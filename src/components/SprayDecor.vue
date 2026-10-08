<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

// ของตกแต่งสไตล์สเปรย์ (สีสาด ละอองสี ดาววิบวับ ลูกศร มงกุฎ น้ำสีไหล) วางไว้หลังเนื้อหาของ section
// ใช้: <SprayDecor preset="about" /> ใน section ที่มี class relative + isolate
// เพิ่ม/แก้ตำแหน่งได้ที่ PRESETS — x/y = จุดกึ่งกลาง (% ของ section), s = ขนาด px, r = องศา, sm: false = ซ่อนบนมือถือ
const props = defineProps({
  preset: { type: String, required: true },
})

const PRESETS = {
  about: [
    { k: 'mist', x: '86%', y: '45%', s: 380, c: 'ink' },
    { k: 'splat', x: '4%', y: '82%', s: 190, c: 'mint', seed: 3 },
    { k: 'star', x: '47%', y: '14%', s: 38, c: 'mint' },
    { k: 'star', x: '51%', y: '22%', s: 18, c: 'teal' },
    { k: 'burst', x: '95%', y: '88%', s: 70, c: 'heading', r: 10, sm: false },
  ],
  habit: [
    { k: 'mist', x: '10%', y: '30%', s: 360, c: 'teal' },
    { k: 'splat', x: '96%', y: '62%', s: 170, c: 'teal', seed: 8 },
    { k: 'arrow', x: '50%', y: '88%', s: 90, c: 'mint', r: -28, sm: false },
    { k: 'star', x: '6%', y: '12%', s: 32, c: 'ink' },
    { k: 'star', x: '90%', y: '88%', s: 26, c: 'mint' },
  ],
  crew: [
    { k: 'mist', x: '85%', y: '70%', s: 380, c: 'mint' },
    { k: 'splat', x: '3%', y: '24%', s: 150, c: 'ink', seed: 13 },
    { k: 'crown', x: '72%', y: '12%', s: 74, c: 'mint', r: 12, sm: false },
    { k: 'star', x: '96%', y: '40%', s: 30, c: 'heading' },
    { k: 'burst', x: '42%', y: '90%', s: 60, c: 'eyebrow', sm: false },
  ],
  story: [
    { k: 'mist', x: '90%', y: '300px', s: 420, c: 'mint' },
    { k: 'splat', x: '95%', y: '200px', s: 160, c: 'ink', seed: 21 },
    { k: 'star', x: '60%', y: '150px', s: 34, c: 'mint', sm: false },
  ],
  deck: [
    { k: 'splat', x: '92%', y: '10%', s: 200, c: 'ink', seed: 5 },
    { k: 'star', x: '60%', y: '14%', s: 40, c: 'mint' },
    { k: 'star', x: '64%', y: '24%', s: 20, c: 'white' },
    { k: 'arrow', x: '6%', y: '92%', s: 110, c: 'mint', r: -35 },
    { k: 'burst', x: '96%', y: '90%', s: 80, c: 'mint' },
  ],
  app: [
    { k: 'star', x: '12%', y: '120px', s: 34, c: 'mint', sm: false },
    { k: 'star', x: '88%', y: '200px', s: 24, c: 'heading', sm: false },
    { k: 'burst', x: '84%', y: '110px', s: 64, c: 'eyebrow', sm: false },
  ],
  game: [
    { k: 'splat', x: '2%', y: '10%', s: 170, c: 'ink', seed: 30 },
    { k: 'splat', x: '98%', y: '92%', s: 150, c: 'steel', seed: 31 },
    { k: 'star', x: '94%', y: '12%', s: 36, c: 'white' },
    { k: 'star', x: '6%', y: '88%', s: 28, c: 'ink' },
  ],
  testimonials: [
    { k: 'mist', x: '50%', y: '50%', s: 520, c: 'mint' },
    { k: 'star', x: '42%', y: '9%', s: 34, c: 'mint', sm: false },
    { k: 'splat', x: '70%', y: '94%', s: 130, c: 'ink', seed: 44, sm: false },
  ],
  news: [
    { k: 'mist', x: '6%', y: '70%', s: 380, c: 'teal' },
    { k: 'splat', x: '95%', y: '8%', s: 180, c: 'mint', seed: 17 },
    { k: 'arrow', x: '62%', y: '9%', s: 86, c: 'ink', r: -18, sm: false },
    { k: 'star', x: '3%', y: '12%', s: 30, c: 'heading' },
  ],
  cta: [
    { k: 'mist', x: '50%', y: '45%', s: 380, c: 'mint' },
    { k: 'splat', x: '6%', y: '30%', s: 200, c: 'teal', seed: 9 },
    { k: 'splat', x: '94%', y: '78%', s: 180, c: 'mint', seed: 12 },
    { k: 'crown', x: '50%', y: '6%', s: 70, c: 'mint', r: -6 },
    { k: 'star', x: '88%', y: '18%', s: 44, c: 'mint' },
    { k: 'star', x: '12%', y: '82%', s: 30, c: 'white' },
    { k: 'burst', x: '82%', y: '14%', s: 90, c: 'white', sm: false },
  ],
  footer: [
    { k: 'drips', x: '70%', y: '0%', s: 300, c: 'ink', top: true },
  ],
}

// สุ่มแบบมี seed → รูปร่างเหมือนเดิมทุกครั้งที่โหลด
function rng(seed) {
  let a = seed * 9301 + 49297
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ก้อนสีสาด: ขอบหยัก + แฉกยื่น + จุดละอองรอบ ๆ
function splat(seed) {
  const r = rng(seed)
  const n = 26
  const pts = Array.from({ length: n }, (_, i) => {
    const a = ((i + r() * 0.5) / n) * Math.PI * 2
    const spike = r()
    const rad = spike > 0.78 ? 30 + r() * 16 : spike > 0.5 ? 22 + r() * 6 : 15 + r() * 6
    return [50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad]
  })
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  let d = `M${mid(pts[n - 1], pts[0]).join(' ')}`
  pts.forEach((p, i) => (d += `Q${p.join(' ')} ${mid(p, pts[(i + 1) % n]).join(' ')}`))
  const dots = Array.from({ length: 18 }, () => {
    const a = r() * Math.PI * 2
    const dist = 34 + r() * 15
    return { cx: 50 + Math.cos(a) * dist, cy: 50 + Math.sin(a) * dist, r: 0.6 + r() * 2.6 }
  })
  return { d: d + 'Z', dots }
}

// แถบน้ำสีไหลลงมาจากขอบบน
function drips(seed) {
  const r = rng(seed)
  return Array.from({ length: 7 }, (_, i) => ({ x: 10 + i * 30 + r() * 12, w: 5 + r() * 5, h: 12 + r() * 38 }))
}

const items = computed(() =>
  (PRESETS[props.preset] ?? []).map((it, i) => ({
    ...it,
    i,
    color: `var(--color-${it.c})`,
    shape: it.k === 'splat' ? splat(it.seed ?? i + 1) : it.k === 'drips' ? drips(it.s) : null,
  })),
)

const style = (it) => ({
  left: it.x,
  top: it.y,
  width: `${it.s}px`,
  height: it.k === 'drips' ? `${it.s * 0.3}px` : `${it.s}px`,
  '--r': `${it.r ?? 0}deg`,
  '--d': `${it.i * 90}ms`,
  color: it.color,
})

// เล่นแอนิเมชันพ่นสีตอนเลื่อนมาเจอ section
const root = ref(null)
const shown = ref(false)
let observer
onMounted(() => {
  observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      shown.value = true
      observer.disconnect()
    }
  })
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="spray-decor" :class="{ 'is-shown': shown }" aria-hidden="true">
    <span v-for="it in items" :key="it.i" class="sd-item" :class="[`sd-${it.k}`, it.sm === false && 'sd-desktop', it.top && 'sd-top']" :style="style(it)">
      <svg v-if="it.k === 'splat'" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="currentColor" class="sd-overspray" />
        <path :d="it.shape.d" fill="currentColor" />
        <circle v-for="(dot, j) in it.shape.dots" :key="j" :cx="dot.cx" :cy="dot.cy" :r="dot.r" fill="currentColor" />
      </svg>

      <svg v-else-if="it.k === 'star'" viewBox="0 0 100 100" class="twinkle" :style="{ animationDelay: `${it.i * 0.4}s` }">
        <path d="M50 3C54 38 62 46 97 50 62 54 54 62 50 97 46 62 38 54 3 50 38 46 46 38 50 3Z" fill="currentColor" stroke="var(--color-night)" stroke-width="5" stroke-linejoin="round" />
      </svg>

      <svg v-else-if="it.k === 'arrow'" viewBox="0 0 100 100">
        <path d="M6 58 58 50 55 34 94 52 56 74 58 62Z" fill="currentColor" stroke="var(--color-night)" stroke-width="5" stroke-linejoin="round" />
        <path d="M14 57 50 52" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" />
      </svg>

      <svg v-else-if="it.k === 'crown'" viewBox="0 0 100 100">
        <path d="M12 72 16 30 34 50 50 16 66 50 84 30 88 72Z" fill="currentColor" stroke="var(--color-night)" stroke-width="5" stroke-linejoin="round" />
        <path d="M12 72H88V84H12Z" fill="currentColor" stroke="var(--color-night)" stroke-width="5" stroke-linejoin="round" />
        <circle cx="50" cy="16" r="5" fill="var(--color-night)" /><circle cx="16" cy="30" r="4" fill="var(--color-night)" /><circle cx="84" cy="30" r="4" fill="var(--color-night)" />
      </svg>

      <svg v-else-if="it.k === 'burst'" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round">
        <path d="M50 6V26M50 74V94M6 50H26M74 50H94M19 19l13 13M68 68l13 13M81 19 68 32M32 68 19 81" />
      </svg>

      <svg v-else-if="it.k === 'drips'" viewBox="0 0 230 70" preserveAspectRatio="none">
        <g v-for="(dr, j) in it.shape" :key="j" class="sd-drip" :style="{ transitionDelay: `${j * 120}ms` }">
          <path :d="`M${dr.x - dr.w / 2} 0V${dr.h}a${dr.w / 2} ${dr.w / 2} 0 0 0 ${dr.w} 0V0Z`" fill="currentColor" />
        </g>
      </svg>

      <span v-else-if="it.k === 'mist'" class="sd-mist-fill" />
    </span>
  </div>
</template>

<style scoped>
.spray-decor {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}
.sd-item {
  position: absolute;
  display: block;
  transform: translate(-50%, -50%) rotate(var(--r));
}
.sd-top {
  transform: translate(-50%, 0);
}
.sd-item > svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.sd-splat svg {
  filter: url(#spray-rough);
  opacity: 0.85;
}
.sd-overspray {
  opacity: 0.18;
  filter: blur(9px);
}
.sd-arrow svg,
.sd-crown svg,
.sd-burst svg {
  filter: url(#spray-rough) drop-shadow(0 0 6px color-mix(in srgb, currentColor 55%, transparent));
}
.sd-mist-fill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, currentColor 0%, transparent 68%);
  opacity: 0.16;
}

/* พ่นสีเข้ามาตอนเลื่อนมาเจอ */
.sd-item > * {
  opacity: 0;
  scale: 0.4;
  transition:
    opacity 0.5s ease var(--d),
    scale 0.7s cubic-bezier(0.3, 1.6, 0.5, 1) var(--d);
}
.is-shown .sd-item > * {
  opacity: 1;
  scale: 1;
}
.sd-drip {
  transform-box: fill-box;
  transform-origin: top;
  transform: scaleY(0);
  transition: transform 1.6s cubic-bezier(0.5, 0, 0.3, 1);
}
.is-shown .sd-drip {
  transform: scaleY(1);
}
.is-shown .sd-drips svg {
  scale: 1;
}

@media (max-width: 767px) {
  .sd-desktop {
    display: none;
  }
  .sd-item {
    scale: 0.7;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sd-item > *,
  .sd-drip {
    opacity: 1;
    scale: 1;
    transform: none;
  }
}
</style>
