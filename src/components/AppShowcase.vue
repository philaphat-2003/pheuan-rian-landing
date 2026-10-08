<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import AppPhones from './AppPhones.vue'
import SprayDecor from './SprayDecor.vue'

// โชว์หน้าจอแอป: มือถือชุดสว่างอยู่ล่าง ชุดมืดซ้อนทับอยู่บน แล้วตัดด้วยเส้นตรงกลาง
// ฝั่งซ้ายของเส้น = โหมดสว่าง, ฝั่งขวา = โหมดมืด
// → ลากเส้นไปซ้าย มือถือมืดมากขึ้น / ลากไปขวา สว่างมากขึ้น
defineProps({
  id: { type: String, default: 'app' },
})

const { t } = useI18n()

const stage = ref(null)
const shown = ref(50) // ตำแหน่งเส้นที่แสดงอยู่ (%)
let target = 50 // ตำแหน่งที่อยากให้เส้นไปถึง (%)
let raf = 0
let touched = false // ผู้ใช้เคยลากแล้ว → ไม่ต้องเล่นแอนิเมชันแนะนำอีก

// ไล่ตำแหน่งเส้นเข้าหา target ทีละนิด → ลากแล้วลื่น ไม่กระตุก
function frame() {
  const next = shown.value + (target - shown.value) * 0.2
  shown.value = Math.abs(target - next) < 0.05 ? target : next
  raf = shown.value === target ? 0 : requestAnimationFrame(frame)
}
function moveTo(pct) {
  target = Math.min(98, Math.max(2, pct))
  raf ||= requestAnimationFrame(frame)
}

// ---------- ลากด้วยเมาส์ / นิ้ว ----------
let dragging = false
const pctFrom = (e) => {
  const r = stage.value.getBoundingClientRect()
  return ((e.clientX - r.left) / r.width) * 100
}
function onDown(e) {
  if (e.button > 0) return
  dragging = touched = true
  stage.value.setPointerCapture(e.pointerId)
  moveTo(pctFrom(e))
}
function onMove(e) {
  if (dragging) moveTo(pctFrom(e))
}
function onUp() {
  dragging = false
}

// ---------- คีย์บอร์ด ----------
function onKey(e) {
  const step = { ArrowLeft: -5, ArrowRight: 5, PageDown: -20, PageUp: 20 }[e.key]
  if (step) moveTo(target + step)
  else if (e.key === 'Home') moveTo(2)
  else if (e.key === 'End') moveTo(98)
  else return
  touched = true
  e.preventDefault()
}

// ---------- ครั้งแรกที่เลื่อนมาเจอ: ส่ายเส้นให้เห็นว่าลากได้ ----------
let observer
const timers = []
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  observer = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return
      observer.disconnect()
      ;[[400, 32], [1200, 68], [2000, 50]].forEach(([ms, pct]) => timers.push(setTimeout(() => touched || moveTo(pct), ms)))
    },
    { threshold: 0.5 },
  )
  observer.observe(stage.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  timers.forEach(clearTimeout)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <section :id="id" class="relative isolate scroll-mt-16 overflow-hidden bg-wall pt-20 pb-16 md:pt-28">
    <SprayDecor preset="app" />

    <header v-reveal="'up'" class="mx-auto max-w-2xl px-4 text-center">
      <p class="inline-block font-hand text-2xl text-eyebrow">
        {{ t('showcase.eyebrow') }}
        <span class="spray-line" />
      </p>
      <h2 class="mt-4 text-4xl leading-[1.3] font-black whitespace-pre-line text-heading md:text-6xl">{{ t('showcase.title') }}</h2>
      <p class="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted">{{ t('showcase.body') }}</p>
    </header>

    <!-- ลูกศรบอกทิศ: ลากซ้าย = มืด, ลากขวา = สว่าง -->
    <div class="hints mx-auto mt-10 flex max-w-3xl justify-between px-6" aria-hidden="true">
      <span class="hint"><b>←</b> 🌙 {{ t('showcase.dark') }}</span>
      <span class="hint">{{ t('showcase.light') }} ☀️ <b>→</b></span>
    </div>

    <div
      ref="stage"
      class="stage"
      :style="{ '--split': `${shown}%` }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <div class="layer"><AppPhones theme="light" /></div>
      <div class="layer layer-dark" aria-hidden="true" inert><AppPhones theme="dark" /></div>

      <div class="divider" aria-hidden="true" />
      <button
        type="button"
        class="handle"
        role="slider"
        :aria-label="t('showcase.handle')"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(100 - shown)"
        :aria-valuetext="`${t('showcase.dark')} ${Math.round(100 - shown)}%`"
        @keydown="onKey"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-hand);
  font-size: 1.25rem;
  color: var(--color-heading);
}
.hint b {
  font-size: 1.6rem;
  color: var(--color-mint);
}

.stage {
  --split: 50%;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-top: 0.5rem;
  cursor: ew-resize;
  touch-action: pan-y; /* เลื่อนหน้าแนวตั้งได้ตามปกติ ลากแนวนอน = เลื่อนเส้น */
  user-select: none;
}
/* แถวมือถือกว้างกว่าจอ → จัดกลางแล้วล้นออกสองข้างเท่ากัน เครื่องกลางจึงอยู่กลางจอเสมอ */
.layer {
  grid-area: 1 / 1;
  min-width: 0; /* ไม่ให้ grid ขยายตามความกว้างแถวมือถือ */
  display: flex;
  justify-content: center;
  pointer-events: none;
}
/* ชั้นมืดเห็นเฉพาะฝั่งขวาของเส้น */
.layer-dark {
  clip-path: inset(0 0 0 var(--split));
}

.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--split);
  width: 4px;
  translate: -50% 0;
  border-radius: 99px;
  background: linear-gradient(to bottom, transparent, var(--color-mint) 8%, var(--color-mint) 92%, transparent);
  box-shadow: 0 0 16px 2px rgb(21 216 179 / 0.6);
  pointer-events: none;
}
.handle {
  position: absolute;
  bottom: 18px;
  left: var(--split);
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  translate: -50% 0;
  border: 4px solid var(--color-night);
  border-radius: 50%;
  background: var(--color-mint);
  box-shadow: 0 0 0 6px rgb(21 216 179 / 0.25), 4px 4px 0 var(--color-night);
  color: var(--color-night);
  cursor: grab;
  transition: scale 0.2s;
}
.handle:hover,
.stage:active .handle {
  scale: 1.08;
}
.stage:active .handle {
  cursor: grabbing;
}
.handle svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* มือถือ: ย่อทั้งแถวลง เห็นเครื่องกลางเต็ม ๆ และเครื่องข้าง ๆ บางส่วน */
@media (max-width: 767px) {
  /* มือถือ: โชว์เฉพาะเครื่องกลางเต็ม ๆ (5 เครื่องกว้างกว่าจอ เครื่องข้างจะโดนตัด) + เว้นที่ใต้เครื่องให้ปุ่มลาก */
  .layer :deep(.phones) {
    zoom: 0.92;
    padding-bottom: 92px;
  }
  .layer :deep(.is-side) {
    display: none;
  }
  .hint {
    font-size: 1rem;
  }
  .handle {
    width: 52px;
    height: 52px;
  }
}
</style>
