let notices = [];
let sequence = 0;
const listeners = new Set();
const timers = new Map();
const publish = () => listeners.forEach((listener) => listener());

function close(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  notices = notices.filter((notice) => notice.id !== id);
  publish();
}
function show(type, content, options = {}) {
  if (!content) return;
  const text = String(content);
  const existing = notices.find(
    (notice) => notice.type === type && notice.content === text,
  );
  const id = existing?.id ?? ++sequence;
  clearTimeout(timers.get(id));
  if (!existing) {
    if (notices.length >= 4) close(notices[0].id);
    notices = [...notices, { id, type, content: text }];
    publish();
  }
  const duration = options.duration ?? 5000;
  if (duration > 0)
    timers.set(
      id,
      setTimeout(() => close(id), duration),
    );
  return () => close(id);
}

// Public API: message.error('内容'), message.success('内容', { duration: 3000 }).
// duration: 0 keeps a message visible until it is manually closed.
export const message = {
  error: (content, options) => show("error", content, options),
  warning: (content, options) => show("warning", content, options),
  success: (content, options) => show("success", content, options),
  info: (content, options) => show("info", content, options),
  close,
  clear() {
    timers.forEach(clearTimeout);
    timers.clear();
    notices = [];
    publish();
  },
};
export const messageStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => notices,
};
