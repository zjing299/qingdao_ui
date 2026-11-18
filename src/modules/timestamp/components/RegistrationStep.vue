<script setup>
// 第二步：登记表；研究单位只读，必填完整后才能进入确认页。
import { ref } from "vue";
import RequiredInput from "../../../components/common/RequiredInput.vue";
import BaseSelect from "../../../components/common/BaseSelect.vue";
import PanelNote from "../../../components/common/PanelNote.vue";
import {
  achievementTypes,
  confidentialityOptions,
  todayDate,
} from "../constants.js";
const props = defineProps({ flow: Object });
const emit = defineEmits(["back"]);
const { state, locked, registrationComplete } = props.flow;
const form = ref(null);
function review() {
  props.flow.review(form.value);
}
defineExpose({ review });
</script>
<template>
  <form ref="form" novalidate @submit.prevent="review">
    <section class="panel registration" aria-labelledby="registration-title">
      <h2 id="registration-title">成果登记信息</h2>
      <p class="section-note">
        请核对成果登记信息；研发人员可添加、删除及调整顺序。
      </p>
      <fieldset
        :key="state.resetVersion"
        class="fields"
        :disabled="locked || state.step !== 2"
      >
        <label class="field"
          ><span>研究单位 <b>*</b></span
          ><input
            :value="state.form.research_unit"
            required
            readonly
            maxlength="255"
            aria-readonly="true"
        /></label>
        <div class="field">
          <span>成果类型 <b>*</b></span
          ><BaseSelect
            v-model="state.form.type"
            label="成果类型"
            :options="achievementTypes"
            :disabled="locked || state.step !== 2"
          />
        </div>
        <label class="field"
          ><span>成果名称 <b>*</b></span
          ><RequiredInput
            v-model="state.form.name"
            error-text="请输入成果名称"
            maxlength="255"
            placeholder="请输入科技成果的正式名称" /></label
        ><label class="field"
          ><span>所属研究室 / 课题组</span
          ><input
            v-model="state.form.research_group"
            maxlength="255"
            placeholder="请输入研究室或课题组"
        /></label>
        <div class="field people-field">
          <span>成果研发人员 <b>*</b>（可多人 / 排序）</span>
          <div class="people-list">
            <div
              v-for="(person, index) in state.people"
              :key="person.id"
              class="person"
            >
              <span class="person-index">{{ index + 1 }}</span><RequiredInput
                v-model="person.name"
                :aria-label="`第${index + 1}位研发人员`"
                error-text="请输入研发人员姓名"
                maxlength="100"
                placeholder="姓名"
              /><button
                type="button"
                :aria-label="`上移第${index + 1}位研发人员`"
                :disabled="index === 0"
                @click="flow.movePerson(index, -1)"
              >
                上移</button
              ><button
                type="button"
                :aria-label="`下移第${index + 1}位研发人员`"
                :disabled="index === state.people.length - 1"
                @click="flow.movePerson(index, 1)"
              >
                下移</button
              ><button
                v-if="state.people.length > 1"
                type="button"
                :aria-label="`删除第${index + 1}位研发人员`"
                @click="flow.removePerson(index)"
              >
                删除
              </button>
            </div>
          </div>
          <button
            class="add-person"
            type="button"
            :disabled="state.people.length >= 100"
            @click="flow.addPerson"
          >
            ＋ 添加研发人员
          </button>
        </div>
        <div class="field">
          <span>密级 <b>*</b></span
          ><BaseSelect
            v-model="state.form.confidentiality"
            label="密级"
            :options="confidentialityOptions"
            :disabled="locked || state.step !== 2"
          />
        </div>
        <label class="field"
          ><span class="project-label">关联项目 / 专利（申请）号</span
          ><input
            v-model="state.form.related_project_no"
            maxlength="512"
            placeholder="请输入关联项目或专利申请号" /></label
        ><label class="field"
          ><span>成果完成日期</span
          ><input
            type="date"
            min="1000-01-01"
            :max="todayDate()"
            :value="state.form.completion_date"
            @input="flow.changeDate($event.target.value)"
        /></label>
      </fieldset>
      <div class="actions wizard-actions">
        <button type="button" class="secondary" @click="emit('back')">
          上一步</button
        ><button
          class="primary"
          type="submit"
          :disabled="locked || !registrationComplete"
        >
          下一步：确认并提交 →
        </button>
      </div>
      <PanelNote />
    </section>
  </form>
</template>
