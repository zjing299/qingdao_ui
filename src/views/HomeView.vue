<script setup>
// 服务首页：参考图的介绍区、办理流程、成果类型及在线办理入口。
import { RouterLink } from "vue-router";
import {
  ArrowRight,
  ArrowDown,
  FilePlus2,
  Files,
  BookOpen,
  ShieldCheck,
  Fingerprint,
  Clock3,
} from "@lucide/vue";
import { processSteps, notices } from "../modules/home/content.js";
import { achievementTypes } from "../modules/timestamp/constants.js";
function showGuide() {
  document
    .querySelector("#service-guide")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>
<template>
  <main class="home-view">
    <section class="home-hero">
      <div class="portal-container">
        <p class="hero-kicker">科研知识产权保护 <span>·</span> 事前固定</p>
        <h1>知识产权可信时间戳存证</h1>
        <p class="hero-description">
          为专利交底书、论文预印本、原始实验数据、源代码与工艺文件，在正式申报、投稿或转化之前，固定「谁、在何时、有什么」。
        </p>
        <div class="hero-facts">
          <span><Fingerprint :size="14" />本地计算文件摘要</span
          ><span><ShieldCheck :size="14" />原文不上传服务器</span
          ><span><Clock3 :size="14" />签发结果可追溯</span>
        </div>
        <div class="hero-actions">
          <RouterLink class="hero-primary" to="/register"
            ><FilePlus2 :size="17" />新建存证登记<ArrowRight
              :size="16" /></RouterLink
          ><button type="button" class="hero-secondary" @click="showGuide">
            <BookOpen :size="16" />办理指南与材料要求<ArrowDown :size="15" />
          </button>
        </div>
      </div>
    </section>
    <div class="portal-container home-grid">
      <div class="home-left">
        <section id="service-guide" class="portal-card process-panel">
          <div class="section-heading">
            <div>
              <p class="eyebrow">办理指南</p>
              <h2>从申请到签发，四步完成存证</h2>
            </div>
            <span class="quiet-label">一次一份文件</span>
          </div>
          <p class="section-intro">
            无需提交原件，让每一份成果都有时间的证明。
          </p>
          <div class="process-grid">
            <article
              class="process-step"
              v-for="step in processSteps"
              :key="step.number"
              :class="{ 'process-final': step.number === '04' }"
            >
              <span class="process-number">{{ step.number }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </article>
          </div>
          <p class="process-note">
            <ShieldCheck :size="15" />本服务提供「存在性 · 时间 ·
            完整性」证明，不构成著作权确权登记。
          </p>
        </section>
        <section class="portal-card types-panel">
          <h2>可办理的成果类型</h2>
          <p class="section-intro">覆盖科研成果形成与转化过程中的关键材料</p>
          <div class="type-tags">
            <span v-for="type in achievementTypes" :key="type.value">{{
              type.label
            }}</span>
          </div>
        </section>
      </div>
      <aside class="home-right">
        <section class="online-card">
          <div class="online-icon"><FilePlus2 :size="23" /></div>
          <h2>在线办理</h2>
          <p>选择文件、完善登记信息，申请可信时间戳存证。</p>
          <RouterLink class="start-registration" to="/register"
            >新建存证登记 <ArrowRight :size="16" /></RouterLink
          ><RouterLink class="my-certificates-link" to="/certificates"
            ><Files :size="15" />我的凭证记录<ArrowRight
              :size="14" /></RouterLink
          ><small>身份认证接入后，可集中查看本人申请。</small>
        </section>
        <section class="portal-card notice-card">
          <h2>办理须知</h2>
          <ol>
            <li v-for="(notice, index) in notices" :key="notice">
              <span>{{ String(index + 1).padStart(2, "0") }}</span>{{ notice }}
            </li>
          </ol>
        </section>
      </aside>
    </div>
  </main>
</template>
