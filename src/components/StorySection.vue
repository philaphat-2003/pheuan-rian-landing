<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ArtCard from './ArtCard.vue'
import SprayDecor from './SprayDecor.vue'

// ไทม์ไลน์: เส้นสเปรย์ตรงกลางค่อย ๆ ยาวลงตาม scroll พอปลายเส้นถึงจุดของสเต็ปไหน
// การ์ดของสเต็ปนั้นจะเลื่อนออกจากเส้น (สลับซ้าย/ขวา) — เลื่อนขึ้นก็ย้อนกลับ
defineProps({
  id: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  steps: { type: Array, required: true }, // [{ title, body, art, image? }]
})

const pad = (n) => String(n).padStart(2, '0')

const list = ref(null)
const rows = []
let centers = [] // จุดกึ่งกลางของแต่ละแถว (px จากบนสุดของ list) — วัดใหม่ตอน resize
let height = 0
let tip = 0 // ตำแหน่งปลายเส้นที่แสดงอยู่ (ค่อย ๆ ไล่ตาม target ให้ลื่น)
let raf = 0

const TIP_AT = 0.6 // ปลายเส้นอยู่ที่ 60% ของความสูงจอ
const SPAN = 260 // ระยะ (px) ที่การ์ดใช้เลื่อนออกจนสุด

function measure() {
  height = list.value.offsetHeight
  centers = rows.map((el) => el.offsetTop + el.offsetHeight / 2)
}

function targetTip() {
  const top = list.value.getBoundingClientRect().top
  return Math.min(height, Math.max(0, window.innerHeight * TIP_AT - top))
}

function paint() {
  list.value.style.setProperty('--tip', `${tip}px`)
  list.value.style.setProperty('--fill', height ? tip / height : 0)
  rows.forEach((el, i) => {
    const t = Math.min(1, Math.max(0, (tip - centers[i] + SPAN / 2) / SPAN))
    el.style.setProperty('--p', t * t * (3 - 2 * t)) // smoothstep
  })
}

// ไล่ tip เข้าหา target ทีละนิดทุกเฟรม → เคลื่อนลื่น ไม่กระตุกตามล้อเมาส์
function frame() {
  const target = targetTip()
  tip += (target - tip) * 0.22 // หน้าเว็บเลื่อนนุ่มอยู่แล้ว (Lenis) หน่วงเพิ่มนิดเดียวพอ
  if (Math.abs(target - tip) < 0.5) tip = target
  paint()
  raf = tip === target ? 0 : requestAnimationFrame(frame)
}
const kick = () => (raf ||= requestAnimationFrame(frame))
const onResize = () => {
  measure()
  kick()
}

let reduced = false
onMounted(() => {
  measure()
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    tip = height
    paint()
    return
  }
  tip = targetTip()
  paint()
  window.addEventListener('scroll', kick, { passive: true })
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', kick)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <section :id="id" class="relative isolate scroll-mt-16 overflow-x-clip bg-paper pb-24 md:pb-32">
    <SprayDecor preset="story" />

    <div class="mx-auto max-w-6xl px-4 pt-16 md:pt-24">
      <header v-reveal="'up'" class="mx-auto max-w-2xl text-center">
        <p v-if="eyebrow" class="inline-block font-hand text-2xl text-eyebrow">
          {{ eyebrow }}
          <span class="spray-line" />
        </p>
        <h2 class="mt-4 text-4xl leading-[1.3] font-black whitespace-pre-line text-heading md:text-6xl">{{ title }}</h2>
      </header>

      <ol ref="list" class="timeline mt-16 md:mt-24">
        <!-- เส้น: รางจาง ๆ + เส้นสเปรย์ที่ยาวลงตาม scroll + หัวสเปรย์ที่ปลาย -->
        <span class="tl-track" aria-hidden="true" />
        <span class="tl-fill" aria-hidden="true" />
        <span class="tl-tip" aria-hidden="true" />

        <li v-for="(s, i) in steps" :key="i" :ref="(el) => (rows[i] = el)" class="tl-row" :class="i % 2 ? 'is-right' : 'is-left'">
          <span class="tl-node" aria-hidden="true"><span>{{ pad(i + 1) }}</span></span>

          <div class="tl-card">
            <span class="inline-block -rotate-3 rounded-lg border-2 border-night bg-mint px-3 py-0.5 font-tag text-sm text-night">STEP {{ pad(i + 1) }}</span>
            <h3 class="mt-4 text-2xl leading-[1.35] font-black text-copy md:text-4xl">{{ s.title }}</h3>
            <p class="mt-3 text-lg leading-relaxed text-muted">{{ s.body }}</p>
          </div>

          <div class="tl-visual">
            <img
              v-if="s.image"
              :src="s.image"
              alt=""
              class="w-full rotate-[1.5deg] rounded-[1.75rem] border-4 border-night shadow-[12px_12px_0_0_var(--color-night)]"
            />
            <ArtCard v-else :variant="s.art" />
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* ---------- มือถือ: เส้นชิดซ้าย การ์ดทั้งหมดอยู่ขวาของเส้น ---------- */
.timeline {
  --line-x: 22px;
  --tip: 0px;
  --fill: 0;
  position: relative;
}
.tl-track,
.tl-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--line-x);
  translate: -50% 0;
  border-radius: 99px;
}
.tl-track {
  width: 4px;
  background: repeating-linear-gradient(to bottom, var(--theme-line) 0 10px, transparent 10px 18px);
}
.tl-fill {
  width: 8px;
  background: var(--color-mint);
  box-shadow: 0 0 14px 2px rgb(21 216 179 / 0.55);
  filter: url(#spray-rough);
  transform: scaleY(var(--fill));
  transform-origin: top;
}
/* หัวสเปรย์ที่ปลายเส้น */
.tl-tip {
  position: absolute;
  top: 0;
  left: var(--line-x);
  width: 30px;
  height: 30px;
  translate: -50% -50%;
  transform: translateY(var(--tip));
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0 18%, var(--color-mint) 32%, rgb(21 216 179 / 0.35) 55%, transparent 72%);
  opacity: min(1, calc(var(--fill) * 30));
  pointer-events: none;
}

.tl-row {
  --p: 0;
  --from: -28px; /* การ์ดเริ่มจากฝั่งเส้น แล้วเลื่อนออกไป (มือถือเลื่อนสั้น ไม่ให้ทับเส้น) */
  position: relative;
  display: grid;
  grid-template-columns: calc(var(--line-x) * 2 + 12px) 1fr;
  gap: 1.5rem 0;
  padding-block: 2.5rem;
}
.tl-node {
  position: absolute;
  top: 3rem;
  left: var(--line-x);
  z-index: 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  translate: -50% 0;
  border: 4px solid var(--color-night);
  border-radius: 50%;
  background: var(--color-paper);
  transform: scale(calc(0.55 + 0.45 * var(--p)));
  box-shadow: 0 0 calc(18px * var(--p)) rgb(21 216 179 / 0.7);
}
/* ไส้วงกลมสีมิ้นต์ค่อย ๆ เต็มตามความคืบหน้า */
.tl-node::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--color-mint);
  transform: scale(var(--p));
}
.tl-node span {
  position: relative;
  font: 13px/1 var(--font-tag);
  color: var(--color-night);
}
.tl-card,
.tl-visual {
  grid-column: 2;
  opacity: var(--p);
  transform: translateX(calc(var(--from) * (1 - var(--p)))) scale(calc(0.9 + 0.1 * var(--p)));
  will-change: transform, opacity;
}
.tl-visual {
  width: min(100%, 26rem);
  transform: translateX(calc(var(--from) * (1 - var(--p)))) scale(calc((0.9 + 0.1 * var(--p)) * 0.92));
  transform-origin: left top;
}

/* ---------- จอกว้าง: เส้นตรงกลาง การ์ดข้อความสลับซ้าย/ขวา ภาพอยู่ฝั่งตรงข้าม ---------- */
@media (min-width: 768px) {
  .timeline {
    --line-x: 50%;
  }
  .tl-row {
    grid-template-columns: 1fr 120px 1fr;
    align-items: center;
    gap: 0;
    padding-block: 3.5rem;
  }
  .tl-node {
    top: 50%;
    width: 56px;
    height: 56px;
    translate: -50% -50%;
  }
  .tl-node span {
    font-size: 16px;
  }
  .tl-card,
  .tl-visual {
    grid-row: 1;
  }
  .tl-visual {
    width: min(100%, 26rem);
  }
  /* ข้อความซ้าย / ภาพขวา */
  .is-left .tl-card {
    --from: 90px;
    grid-column: 1;
    justify-self: end;
    text-align: right;
  }
  .is-left .tl-visual {
    --from: -90px;
    grid-column: 3;
    justify-self: start;
    transform-origin: left center;
  }
  /* ข้อความขวา / ภาพซ้าย */
  .is-right .tl-card {
    --from: -90px;
    grid-column: 3;
    justify-self: start;
  }
  .is-right .tl-visual {
    --from: 90px;
    grid-column: 1;
    justify-self: end;
    transform-origin: right center;
  }
  .tl-card {
    max-width: 26rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tl-card,
  .tl-visual {
    will-change: auto;
  }
}
</style>
