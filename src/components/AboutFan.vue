<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ArtCard from './ArtCard.vue'
import SprayDecor from './SprayDecor.vue'
import EmoPeek from './EmoPeek.vue'

// การ์ด 3 ใบ: ใบกลางใหญ่ ใบซ้าย/ขวาซ่อนอยู่หลังใบกลาง
// เลื่อนลง → ใบข้างกางออกซ้าย-ขวา / เลื่อนขึ้น → ยุบกลับเข้าหลังใบกลาง (ผูกกับตำแหน่ง scroll)
// มือถือ: กางเป็นพัดไพ่ในจอเดียว แตะใบข้างเพื่อดึงขึ้นมาอยู่หน้า
const props = defineProps({
  id: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  points: { type: Array, default: () => [] }, // [0] = ใบกลาง, [1] = ใบซ้าย, [2] = ใบขวา
  art: { type: String, default: 'chat' },
})

// หน้าตาใบข้าง — เปลี่ยนไอคอน/สติกเกอร์/สีได้ที่นี่ ข้อความมาจาก points
const sides = [
  { side: 'left', point: 1, emoji: '⏱️', sticker: '5 MIN', tone: 'bg-mint text-night' },
  { side: 'right', point: 2, emoji: '🎙️', sticker: 'REAL TIME', tone: 'bg-steel text-white' },
]

const row = ref(null)
const progress = ref(0)
const popped = ref(false)
const voiceHover = ref(false)
let raf = 0

// 0 = การ์ดแถวเพิ่งโผล่ที่ขอบล่างจอ, 1 = ขึ้นมาถึงประมาณกลางจอ (กางสุด)
function targetProgress() {
  const top = row.value.getBoundingClientRect().top
  const vh = window.innerHeight
  const t = Math.min(1, Math.max(0, (vh * 0.95 - top) / (vh * 0.6)))
  return 1 - (1 - t) ** 3
}
// ไล่ค่าเข้าหาเป้าทีละนิดทุกเฟรม → การ์ดกาง/หุบลื่น ไม่กระตุกตามจังหวะล้อเมาส์
function frame() {
  const target = targetProgress()
  const next = progress.value + (target - progress.value) * 0.18
  progress.value = Math.abs(target - next) < 0.001 ? target : next
  // สาวอีโมโผล่เมื่อการ์ดกางเกือบสุด และหลบลงเมื่อเลื่อนกลับขึ้น (เผื่อช่วงกันกระพือ)
  if (progress.value > 0.97) popped.value = true
  else if (progress.value < 0.8) popped.value = false
  raf = progress.value === target ? 0 : requestAnimationFrame(frame)
}
const update = () => {
  progress.value = targetProgress()
  frame()
}
const onScroll = () => (raf ||= requestAnimationFrame(frame))

// ---------- มือถือ: ใบไหนอยู่หน้า (อีกสองใบกางอยู่ซ้าย/ขวาหลังใบหน้า) ----------
const ORDER = ['left', 'center', 'right']
const front = ref('center')
function role(key) {
  if (key === front.value) return 'r-front'
  const rest = ORDER.filter((k) => k !== front.value)
  return rest[0] === key ? 'r-left' : 'r-right'
}
const isMobile = () => matchMedia('(max-width: 767px)').matches
function bringFront(key) {
  if (isMobile()) front.value = key
}
const dotLabel = (key) => props.points[{ left: 1, center: 0, right: 2 }[key]]

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress.value = 1
    popped.value = true
    return
  }
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <section :id="id" class="relative isolate scroll-mt-16 overflow-x-clip py-24 md:py-32">
    <SprayDecor :preset="id" />

    <header v-reveal="'up'" class="mx-auto max-w-2xl px-4 text-center">
      <p v-if="eyebrow" class="inline-block font-hand text-2xl text-eyebrow">
        {{ eyebrow }}
        <span class="spray-line" />
      </p>
      <h2 class="mt-4 text-4xl leading-[1.3] font-black whitespace-pre-line text-heading md:text-6xl">{{ title }}</h2>
      <p v-if="body" class="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted">{{ body }}</p>
    </header>

    <div ref="row" class="fan mx-auto mt-16 max-w-6xl px-4" :style="{ '--p': progress }">
      <!-- ใบกลาง -->
      <div class="fan-center" :class="role('center')" @click="bringFront('center')">
        <ArtCard :variant="art" />
        <p v-if="points[0]" class="fan-caption"><span aria-hidden="true">✓</span> {{ points[0] }}</p>
      </div>

      <!-- ใบซ้าย / ขวา -->
      <article
        v-for="s in sides"
        v-show="points[s.point]"
        :key="s.side"
        class="fan-side relative rounded-[1.75rem] border-4 border-night p-6 shadow-[10px_10px_0_0_var(--color-night)]"
        :class="[`fan-${s.side}`, s.tone, role(s.side)]"
        @click="bringFront(s.side)"
        @pointerenter="s.side === 'right' && (voiceHover = true)"
        @pointerleave="s.side === 'right' && (voiceHover = false)"
      >
        <!-- การ์ดฟีดแบ็กเสียง: สาวอีโมโผล่ออกมาจากหลังการ์ด -->
        <EmoPeek v-if="s.side === 'right'" :popped="popped" :happy="voiceHover" />
        <span class="absolute -top-4 left-5 -rotate-6 rounded-lg border-2 border-night bg-white px-3 py-0.5 font-tag text-sm text-night shadow-[3px_3px_0_0_var(--color-night)]">{{ s.sticker }}</span>
        <span class="mt-6 grid size-20 place-items-center rounded-2xl border-4 border-night bg-white text-5xl" aria-hidden="true">{{ s.emoji }}</span>
        <p class="mt-6 text-xl leading-snug font-black md:text-2xl">{{ points[s.point] }}</p>
      </article>
    </div>

    <!-- มือถือ: จุดบอกว่าใบไหนอยู่หน้า กดเพื่อสลับได้ -->
    <div class="fan-dots">
      <button
        v-for="key in ORDER"
        :key="key"
        type="button"
        :aria-label="dotLabel(key)"
        :aria-pressed="front === key"
        :class="{ on: front === key }"
        @click="front = key"
      />
    </div>
  </section>
</template>

<style scoped>
.fan {
  position: relative;
}
.fan-center {
  position: relative;
  z-index: 2;
}
.fan-side {
  --dir: -1;
  z-index: 1;
  min-height: 19rem;
  will-change: transform;
}
.fan-right {
  --dir: 1;
}
.fan-caption {
  margin-top: 1.75rem;
  text-align: center;
  font-weight: 700;
  color: var(--color-copy);
}
.fan-caption span {
  display: inline-grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.35rem;
  border: 2px solid var(--color-night);
  border-radius: 50%;
  background: var(--color-mint);
  color: var(--color-night);
  font-size: 0.8rem;
}
.fan-dots {
  display: none;
}

/* ---------- มือถือ: พัดไพ่ในจอเดียว ----------
   ทุกใบวางซ้อนในช่องเดียวกัน ใบหน้าอยู่กลาง อีกสองใบเอียงออกซ้าย/ขวาจากหลังใบหน้า
   --p (0→1 ตาม scroll) = กางออกจากหลังใบหน้า, แตะใบข้าง = ดึงขึ้นมาอยู่หน้า */
@media (max-width: 767px) {
  .fan {
    display: grid;
    justify-items: center;
    align-items: center;
    padding-top: 7rem; /* ที่ให้สาวอีโมโผล่ */
  }
  .fan > * {
    grid-area: 1 / 1;
    width: 74vw;
    transition:
      transform 0.55s cubic-bezier(0.3, 1.25, 0.5, 1),
      opacity 0.3s;
  }
  .r-front {
    z-index: 3;
    transform: scale(calc(0.94 + 0.06 * var(--p)));
  }
  .r-left,
  .r-right {
    z-index: 1;
    cursor: pointer;
    transform:
      translateX(calc(var(--side) * 27% * var(--p)))
      rotate(calc(var(--side) * 9deg * var(--p)))
      scale(calc(0.78 + 0.04 * var(--p)));
  }
  .r-left {
    --side: -1;
  }
  .r-right {
    --side: 1;
  }
  /* ใบข้าง: ซ่อนคำบรรยายของใบกลางเวลามันไม่ได้อยู่หน้า */
  .fan-center:not(.r-front) .fan-caption {
    opacity: 0;
  }
  .fan-side {
    min-height: 17rem;
  }
  .fan-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }
  .fan-dots button {
    width: 0.7rem;
    height: 0.7rem;
    border: 2px solid var(--color-night);
    border-radius: 99px;
    background: var(--color-paper);
    transition: width 0.3s, background 0.3s;
  }
  .fan-dots button.on {
    width: 2rem;
    background: var(--color-mint);
  }
}

/* ---------- จอกว้าง: ซ้าย | กลาง | ขวา — ใบข้างเตี้ยกว่าและซ่อนอยู่หลังใบกลางตอนเริ่ม ---------- */
@media (min-width: 768px) {
  .fan {
    --dx: 105%;
    --rot: 4deg;
    display: grid;
    grid-template-columns: 1fr minmax(0, 28rem) 1fr;
    align-items: center;
  }
  .fan-center {
    grid-column: 2;
    grid-row: 1;
    transform: scale(calc(0.94 + 0.06 * var(--p)));
  }
  .fan-side {
    grid-row: 1;
    width: min(100%, 17rem);
    margin-top: 3rem;
    transform:
      translateX(calc(-1 * var(--dir) * var(--dx) * (1 - var(--p))))
      rotate(calc(var(--dir) * var(--rot) * var(--p)))
      scale(calc(0.8 + 0.2 * var(--p)));
    opacity: calc(0.3 + 0.7 * var(--p));
  }
  .fan-left {
    grid-column: 1;
    justify-self: end;
    margin-right: -0.5rem;
    padding-right: 2.25rem; /* เว้นฝั่งที่ชิดใบกลาง ไม่ให้ข้อความโดนบัง */
  }
  .fan-right {
    grid-column: 3;
    justify-self: start;
    margin-left: -0.5rem;
    padding-left: 2.75rem; /* ใบกลางเอียงและมีเงาทางขวา จึงเว้นมากกว่า */
  }
}
</style>
