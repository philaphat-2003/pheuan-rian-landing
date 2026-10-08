<script setup>
import { computed } from 'vue'

// คลื่นคั่นระหว่าง section: bg = สีของ section ก่อนหน้า, fill = สีของ section ถัดไป
const props = defineProps({
  fill: { type: String, default: 'var(--color-ink)' },
  bg: { type: String, default: 'transparent' },
  accent: { type: String, default: '' }, // สีเส้นกราฟฟิตี้ตามขอบคลื่น (ไม่ใส่ = ไม่มีเส้น)
  flip: { type: Boolean, default: false }, // กลับด้านคลื่นซ้าย-ขวา
  dripColor: { type: String, default: '' }, // สีน้ำสีไหล (ไม่ใส่ = ใช้สี bg) — ใช้เมื่อ bg โปร่งใสเพื่อให้ภาพพื้นหลังด้านบนโผล่
  // ซ้อนทับ section ที่มีภาพพื้นหลัง: 'next' = ทับขอบบนของ section ถัดไป, 'prev' = ทับขอบล่างของ section ก่อนหน้า
  overlap: { type: String, default: '' },
})

const curve = 'M0 40C220 110 420 120 700 70S1180 -10 1440 50'

// หาค่า y บนเส้นโค้งที่ตำแหน่ง x (สองช่วง cubic bezier ของ curve ด้านบน)
const segments = [
  [[0, 40], [220, 110], [420, 120], [700, 70]],
  [[700, 70], [980, 20], [1180, -10], [1440, 50]],
]
function yAt(x) {
  const seg = x <= 700 ? segments[0] : segments[1]
  const at = (t, i) => (1 - t) ** 3 * seg[0][i] + 3 * (1 - t) ** 2 * t * seg[1][i] + 3 * (1 - t) * t ** 2 * seg[2][i] + t ** 3 * seg[3][i]
  let lo = 0
  let hi = 1
  for (let k = 0; k < 20; k++) {
    const mid = (lo + hi) / 2
    at(mid, 0) < x ? (lo = mid) : (hi = mid)
  }
  return at(lo, 1)
}

// น้ำสีของ section ด้านบนไหลลงมาทับ section ถัดไป
const dripSpecs = [
  { x: 120, w: 12, h: 14 },
  { x: 300, w: 8, h: 6 },
  { x: 640, w: 10, h: 8 },
  { x: 880, w: 12, h: 44 },
  { x: 1010, w: 16, h: 50 },
  { x: 1180, w: 10, h: 30 },
  { x: 1290, w: 14, h: 56 },
]
const drip = ({ x, w, h }, y) => `M${x - w / 2} ${y - 8}V${y + h}a${w / 2} ${w / 2} 0 0 0 ${w} 0V${y - 8}Z`
const drips = computed(() => dripSpecs.map((d) => ({ d: drip(d, yAt(d.x)), dot: { cx: d.x, cy: yAt(d.x) + d.h + d.w * 1.1, r: d.w * 0.32 } })))
const accentDrips = computed(() => (props.accent ? [{ x: 420, w: 7, h: 16 }, { x: 1130, w: 7, h: 24 }].map((d) => drip(d, yAt(d.x) + 4)) : []))
</script>

<template>
  <!-- fill โปร่งใส (ทับขอบบนของ section ที่มีภาพ): วาดส่วนบนเส้นเป็นรูปทรงแทน กล่องจะได้ไม่ทึบทั้งกล่อง -->
  <div class="wave -my-px leading-none" :class="overlap && `wave-over-${overlap}`" :style="{ background: fill === 'transparent' ? 'transparent' : bg }" aria-hidden="true">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" class="block h-16 w-full md:h-28" :class="flip && '-scale-x-100'">
      <path v-if="fill === 'transparent'" :style="{ fill: bg }" :d="`${curve}V0H0Z`" />
      <path v-else :fill="fill" :d="`${curve}V120H0Z`" />
      <g :style="{ fill: dripColor || bg }">
        <template v-for="(dr, i) in drips" :key="i">
          <path :d="dr.d" />
          <circle v-bind="dr.dot" />
        </template>
      </g>
      <template v-if="accent">
        <path :d="curve" fill="none" :stroke="accent" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        <path v-for="(d, i) in accentDrips" :key="`a${i}`" :d="d" :fill="accent" />
      </template>
    </svg>
  </div>
</template>

<style scoped>
/* วางคลื่นทับขอบของ section ที่มีภาพพื้นหลัง (ส่วนที่โปร่งใสจะเห็นภาพต่อเนื่อง ไม่มีแถบสีทึบคั่น) */
.wave-over-next,
.wave-over-prev {
  position: relative;
  z-index: 2;
}
.wave-over-next { margin-bottom: -4rem; }
.wave-over-prev { margin-top: -4rem; }
@media (min-width: 768px) {
  .wave-over-next { margin-bottom: -7rem; }
  .wave-over-prev { margin-top: -7rem; }
}
</style>
