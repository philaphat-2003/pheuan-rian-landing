<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GraffitiText from './GraffitiText.vue'
import StickerButton from './StickerButton.vue'
import HeroSpray from './HeroSpray.vue'
const { t } = useI18n()
const props = defineProps({ title: { type: String, required: true }, tagline: { type: String, default: '' }, logo: { type: String, default: '' } })
const logoFailed = ref(false)
// เปลี่ยนภาษา = เปลี่ยนรูปโลโก้ → ลองโหลดรูปใหม่อีกครั้ง
watch(() => props.logo, () => (logoFailed.value = false))

// ตำแหน่งตาในรูปโลโก้แต่ละภาษา (% ของรูป: จุดกึ่งกลาง x/y, กว้าง/สูง, องศาที่ตาเอียง)
// ถ้าเปลี่ยนรูปโลโก้ ให้วัดใหม่ — ไม่มีในรายการ = ไม่กะพริบ
const EYES = {
  '/hero-logo.webp': { x: 42.1, y: 58, w: 10.7, h: 9.5, r: -30 },
  '/hero-logo-en.webp': { x: 59.8, y: 41.3, w: 9.6, h: 11, r: -20 },
}
const eye = computed(() => EYES[props.logo])
</script>

<template>
  <section id="home" class="street-hero">
    <div class="hero-topline"><span>{{ t('hero.topline') }}</span><span>{{ t('hero.est') }}</span></div>
    <div class="hero-layout">
      <div class="hero-copy">
        <p class="hero-kicker"><span /> {{ t('hero.eyebrow') }}</p>
        <h1>{{ t('hero.headline') }}<br /><span class="highlight-word">{{ t('hero.highlight') }}<svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path d="M5 15Q160 0 393 10M30 22Q190 10 365 17" /></svg></span></h1>
        <p class="hero-description">{{ t('hero.description') }}</p>
        <div class="hero-actions">
          <StickerButton href="#game">{{ t('hero.try') }} <span aria-hidden="true">↗</span></StickerButton>
          <a href="#about" class="hero-secondary">{{ t('hero.about') }} <span aria-hidden="true">↓</span></a>
        </div>
        <p class="hero-footnote"><span aria-hidden="true">✳</span> {{ t('hero.note') }}</p>
      </div>
      <div class="hero-art">
        <span class="art-orbit" aria-hidden="true" />
        <!-- ละอองสีสเปรย์ 3 มิติ (Three.js) ลอยรอบโลโก้ -->
        <HeroSpray />
        <span class="art-outline" aria-hidden="true" />
        <span class="art-cross" aria-hidden="true">✳</span>
        <span class="art-tag">SPEAK UP!</span>
        <div class="hero-logo-wrap">
          <!-- :key = เปลี่ยนภาษาแล้วพ่นโลโก้ใหม่อีกรอบ -->
          <div v-if="logo && !logoFailed" :key="logo" class="logo-stage">
            <img :src="logo" :alt="title" width="1400" height="758" fetchpriority="high" @error="logoFailed = true" />
            <!-- เปลือกตาที่วางทับตาในรูป แล้วหลับ-ลืมเป็นระยะ -->
            <span
              v-if="eye"
              class="eyelid"
              :style="{ left: `${eye.x}%`, top: `${eye.y}%`, width: `${eye.w}%`, height: `${eye.h}%`, '--r': `${eye.r}deg` }"
              aria-hidden="true"
            ><i /></span>
          </div>
          <GraffitiText v-else :text="title" class="text-6xl" />
        </div>
        <span class="art-sticker">{{ tagline }} <span aria-hidden="true">↗</span></span>
        <span class="art-note">less fear.<br />more YOU.</span>
      </div>
    </div>
  </section>
</template>

