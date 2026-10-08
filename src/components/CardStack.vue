<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

// กองไพ่: ใบหน้าสุดแนะนำตัวแอป เลื่อนลง → ใบหน้าถูกยกขึ้นแล้วสอดไปไว้หลังกอง เผยใบถัดไป
// เลื่อนขึ้น → สับกลับ (ผูกกับตำแหน่ง scroll, section ถูกตรึงไว้ระหว่างสับ)
const props = defineProps({
  habit: { type: Object, required: true }, // { eyebrow, title, body, points }
  crew: { type: Object, required: true },
})

const { t, tm } = useI18n()
const tags = computed(() => tm('stack.tags').map((_, i) => t(`stack.tags.${i}`)))
const week = [40, 65, 30, 80, 55, 100, 70]

// ลีกประจำสัปดาห์: ตัวละครของเราแข่งกับ "คุณ" — name = index ใน art.crew.names (0 มายด์, 1 คุณ, 2 บอส, 3 ฟ้า)
const leagueData = [
  { name: 2, face: '/face-office.webp', xp: 2480 },
  { name: 3, face: '/face-emo.webp', xp: 2310 },
  { name: 0, face: '/face-guy.webp', xp: 1920 },
  { name: 1, face: '', xp: 1540, me: true },
]
const league = computed(() => leagueData.map((p) => ({ ...p, label: t(`art.crew.names.${p.name}`), pct: Math.round((p.xp / leagueData[0].xp) * 100) })))
// ตัวอย่างเกมทายคำบนใบสุดท้าย (ช่องว่าง = ยังไม่ได้ทาย)
const teaser = ['L', 'E', '', 'R', '']

const cards = ['intro', 'habit', 'crew', 'final']
const N = cards.length
// ใบไหนมี id ไว้ให้เมนูด้านบนกระโดดมาถึง
const anchors = { habit: 1, crew: 2 }

const section = ref(null)
const els = []
const shown = ref(0) // ตำแหน่งไพ่ที่แสดง (0 = ใบแรกอยู่หน้า, N-1 = ใบสุดท้ายอยู่หน้า)
let target = 0
let raf = 0
let reduced = false

// smootherstep: เริ่มและจบนุ่มกว่า smoothstep ธรรมดา
const smooth = (x) => x * x * x * (x * (6 * x - 15) + 10)
// scroll → ตำแหน่งไพ่ โดยให้ "ค้าง" ที่แต่ละใบสักพักก่อนสับ (อ่านทัน) — ช่วงสับกว้าง 70% ของระยะต่อใบ
function readScroll() {
  const r = section.value.getBoundingClientRect()
  const span = r.height - window.innerHeight
  const q = Math.min(1, Math.max(0, -r.top / span)) * (N - 1)
  const i = Math.min(N - 2, Math.floor(q))
  const f = q - i
  return i + smooth(Math.min(1, Math.max(0, (f - 0.15) / 0.7)))
}

// วางไพ่แต่ละใบตามตำแหน่ง p
function place(p) {
  els.forEach((el, k) => {
    if (!el) return
    const e = (((k - p) % N) + N) % N
    let depth, x = 0, y = 0, rot = 0, z
    if (e > N - 1) {
      // ใบที่กำลังถูกสับ: เลื่อนออกไปทางซ้ายจนพ้นกอง แล้วค่อยสอดกลับไปไว้หลังสุด
      // สลับชั้น (หน้า → หลัง) ตอนที่ใบพ้นกองแล้ว จึงไม่เห็นการกระพริบกระโดด
      const tt = N - e
      const s = Math.sin(tt * Math.PI)
      depth = smooth(tt) * (N - 1)
      x = -s * 108
      y = -s * 10
      rot = -s * 12
      z = tt < 0.5 ? 100 : 0
    } else {
      depth = e
      z = Math.round((N - depth) * 10)
    }
    const tilt = depth * (k % 2 ? 1.6 : -1.6)
    el.style.zIndex = z
    el.style.transform = `translate3d(${x}%, calc(${y}% + ${depth * 18}px), 0) rotate(${rot + tilt}deg) scale(${1 - depth * 0.06})`
    el.style.opacity = depth > N - 1.2 ? 0.55 : 1
  })
}

function frame() {
  // ไล่ตาม scroll แบบหน่วงนุ่ม ๆ (ค่ายิ่งน้อยยิ่งลื่นแต่ตามช้าลง)
  // หน้าเว็บเลื่อนแบบนุ่มอยู่แล้ว (Lenis) จึงหน่วงเพิ่มแค่นิดเดียว ไม่ให้ไพ่ตามช้า
  const next = reduced ? target : shown.value + (target - shown.value) * 0.16
  shown.value = Math.abs(target - next) < 0.0005 ? target : next
  place(shown.value)
  raf = shown.value === target ? 0 : requestAnimationFrame(frame)
}
const onScroll = () => {
  target = readScroll()
  raf ||= requestAnimationFrame(frame)
}
const active = computed(() => Math.min(N - 1, Math.round(shown.value)))

onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  target = shown.value = readScroll()
  place(shown.value)
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
  <section ref="section" class="stack-section" :style="{ '--n': N }">
    <!-- จุดกระโดดของเมนู (#habit, #crew) วางตามตำแหน่ง scroll ของไพ่แต่ละใบ -->
    <span v-for="(k, id) in anchors" :id="id" :key="id" class="stack-anchor" :style="{ '--k': k }" />

    <div class="stack-sticky">
      <!-- ลูกศรโค้ง: ไพ่ใบหน้าจะถูกสับไปทางนี้ -->
      <svg class="stack-arrow" viewBox="0 0 90 140" aria-hidden="true">
        <path d="M58 130C18 118 8 62 38 24" />
        <path d="M22 30 40 18 50 40" />
      </svg>
      <svg class="stack-sparkle twinkle" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 3C54 38 62 46 97 50 62 54 54 62 50 97 46 62 38 54 3 50 38 46 46 38 50 3Z" />
      </svg>

      <div class="stack">
        <!-- 1: แนะนำตัว (ใบธรรมดา) -->
        <article :ref="(el) => (els[0] = el)" class="card" :aria-hidden="active !== 0">
          <p class="eyebrow">{{ t('stack.eyebrow') }}</p>
          <img :src="t('logo')" :alt="t('brand')" class="intro-logo" />
          <p class="body">{{ t('stack.body') }}</p>
          <ul class="tags">
            <li v-for="tag in tags" :key="tag">{{ tag }}</li>
          </ul>
        </article>

        <!-- 2: วันละนิด -->
        <article :ref="(el) => (els[1] = el)" class="card card-habit" :class="{ 'is-front': active === 1 }" :aria-hidden="active !== 1">
          <div class="habit-text">
            <p class="eyebrow">{{ habit.eyebrow }}</p>
            <h3>{{ habit.title }}</h3>
            <p class="body">{{ habit.body }}</p>
            <!-- แบดจ์ที่ปลดล็อก (points ข้อ 2) -->
            <div class="badges" aria-hidden="true">
              <span>{{ t('art.streak.badge1') }}</span>
              <span>{{ t('art.streak.badge2') }}</span>
            </div>
          </div>

          <!-- วิดเจ็ตสตรีค + การแจ้งเตือนแบบเพื่อนสะกิด (points ข้อ 1) -->
          <div class="streak-widget" aria-hidden="true">
            <div class="nudge">
              <img src="/brand-mark.webp" alt="" />
              <span><small>{{ t('stack.nudgeFrom') }}</small>{{ t('stack.nudge') }}</span>
            </div>
            <p class="widget-head"><span>{{ t('art.streak.label') }}</span><b>21 <small>{{ t('stack.streak') }}</small></b></p>
            <div class="bars">
              <span class="goal-line"><small>{{ t('stack.goal') }}</small></span>
              <span v-for="(v, i) in week" :key="i" class="bar-col" :style="{ '--i': i }">
                <i :class="{ top: v === 100 }" :style="{ height: `${v}%` }"><em v-if="v === 100">🔥</em></i>
                <small>{{ t(`art.streak.week.${i}`) }}</small>
              </span>
            </div>
          </div>
        </article>

        <!-- 3: แก๊งเพื่อน -->
        <article :ref="(el) => (els[2] = el)" class="card card-crew" :aria-hidden="active !== 2">
          <div class="crew-text">
            <p class="eyebrow">{{ crew.eyebrow }}</p>
            <h3>{{ crew.title }}</h3>
            <p class="body">{{ crew.body }}</p>
          </div>
          <!-- กระดานลีก: ตัวละครของเรา vs คุณ -->
          <ol class="league">
            <li v-for="(p, i) in league" :key="p.name" :class="{ me: p.me }">
              <span class="rank">{{ i + 1 }}</span>
              <img v-if="p.face" :src="p.face" alt="" class="face" />
              <span v-else class="face face-me" aria-hidden="true">
                <svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="5" /><path d="M7 27a9 9 0 0 1 18 0" /></svg>
              </span>
              <span class="who">
                <b>{{ p.label }}<i v-if="i === 0" aria-hidden="true"> 👑</i></b>
                <span class="xp-bar"><i :style="{ width: `${p.pct}%` }" /></span>
              </span>
              <span class="xp">{{ p.xp.toLocaleString() }}</span>
            </li>
          </ol>
        </article>

        <!-- 4: ชวนเล่นเกม — ตัวอย่างเกมทายคำ + หนุ่มแว่นโบกมือ -->
        <article :ref="(el) => (els[3] = el)" class="card card-final" :aria-hidden="active !== 3">
          <p class="eyebrow">{{ t('stack.finalEyebrow') }}</p>
          <h3>{{ t('stack.finalTitle') }}</h3>
          <p class="body">{{ t('stack.finalBody') }}</p>
          <div class="teaser" aria-hidden="true">
            <span v-for="(l, i) in teaser" :key="i" :class="{ empty: !l }">{{ l || '?' }}</span>
          </div>
          <a href="#game" class="final-cta" :tabindex="active === 3 ? 0 : -1">{{ t('stack.finalCta') }} <span aria-hidden="true">→</span></a>
          <img src="/mascot-wave.webp" alt="" class="final-mascot" />
        </article>
      </div>

      <p class="stack-meta">
        <span class="count">{{ String(active + 1).padStart(2, '0') }} / {{ String(N).padStart(2, '0') }}</span>
        <span class="hint" :class="{ gone: active === N - 1 }"><span class="bob" aria-hidden="true">↓</span> {{ t('stack.hint') }}</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.stack-section {
  position: relative;
  /* ความยาว scroll: ใบละ 110svh + หนึ่งหน้าจอสำหรับตอนตรึง (ยิ่งยาว ยิ่งสับช้าและนุ่ม) */
  height: calc((var(--n) - 1) * 110svh + 100svh);
  background: var(--color-night);
  color: #fff;
}
.stack-anchor {
  position: absolute;
  left: 0;
  top: calc(var(--k) / (var(--n) - 1) * (100% - 100svh) + 90px);
}
.stack-sticky {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5.5rem; /* เว้นให้ขอบไพ่ที่ซ้อนอยู่ด้านหลัง (ยื่นลงมา ~60px) ไม่ทับตัวนับ */
  height: 100svh;
  padding: 90px 16px 24px; /* 90px = ความสูงเมนูด้านบน */
  overflow: hidden;
  /* ผนังอิฐกราฟฟิตี้ชุดเดียวกับมินิเกม — ติดอยู่กับส่วนที่ตรึงไว้ เลยอยู่กับที่ระหว่างสับไพ่ */
  background: url('/word-jam/bg-wall.webp') center / cover no-repeat, var(--color-night);
}

.stack {
  position: relative;
  width: min(100%, 46rem);
  height: min(31rem, 64svh);
}
.card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 3rem;
  border: 4px solid #0b0f3a;
  border-radius: 1.75rem;
  background: var(--color-paper);
  color: var(--color-copy);
  box-shadow: 8px 10px 0 rgb(0 0 0 / 0.35);
  transform-origin: 50% 100%;
  will-change: transform;
  overflow: hidden;
}
.eyebrow {
  font-family: var(--font-hand);
  font-size: 1.5rem;
  color: var(--color-eyebrow);
}
h3 {
  margin-top: 0.4rem;
  font-size: clamp(1.8rem, 4.5vw, 3.1rem);
  line-height: 1.3;
  font-weight: 900;
  white-space: pre-line;
  color: var(--color-heading);
}
.body {
  margin-top: 0.75rem;
  font-size: 1.2rem;
  line-height: 1.7;
  color: var(--color-muted);
}
.intro-logo {
  width: min(70%, 25rem);
  margin: 0.5rem 0 0 -0.5rem;
  transform: rotate(-3deg);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
}
.tags li {
  padding: 0.3rem 0.8rem;
  border: 2px solid #0b0f3a;
  border-radius: 99px;
  background: var(--color-mint);
  color: #0b0f3a;
  font-size: 0.95rem;
  font-weight: 700;
}

/* ใบวันละนิด: ข้อความ + แบดจ์ซ้าย, วิดเจ็ตสตรีคขวา */
.card-habit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2rem;
}
.card-habit h3 {
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.25rem;
}
.badges span {
  padding: 0.35rem 0.8rem;
  border: 2px solid #0b0f3a;
  border-radius: 0.7rem;
  background: #fff;
  color: #0b0f3a;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 3px 3px 0 #0b0f3a;
  transform: rotate(-3deg);
}
.badges span + span {
  background: var(--color-mint);
  transform: rotate(2deg);
}

.streak-widget {
  position: relative;
  padding: 3.4rem 1.1rem 1rem;
  border-radius: 1.25rem;
  background: #2f39a9;
  color: #fff;
  box-shadow: inset 0 0 0 3px #0b0f3a, 5px 6px 0 #0b0f3a;
}
.widget-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgb(255 255 255 / 0.7);
}
.widget-head b {
  font-size: 1.9rem;
  font-weight: 900;
  color: #fff;
}
.widget-head b small {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-mint);
}
/* การแจ้งเตือนแบบเพื่อนสะกิด: เลื่อนลงมาตอนใบนี้ขึ้นมาอยู่หน้า */
.nudge {
  position: absolute;
  top: -1.4rem;
  left: -1.2rem;
  right: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  border-radius: 1rem;
  background: #fff;
  color: #11152e;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.35;
  box-shadow: 0 12px 26px -8px rgb(0 0 0 / 0.45);
  opacity: 0;
  transform: translateY(-14px) scale(0.95);
  transition: opacity 0.3s, transform 0.3s;
}
.nudge img {
  flex: none;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.6rem;
  background: var(--color-mint);
}
.nudge small {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: #6b7090;
}
.is-front .nudge {
  opacity: 1;
  transform: rotate(-2deg);
  transition: opacity 0.4s 0.45s, transform 0.5s 0.45s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.bars {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
  height: 7.5rem;
  margin-top: 1.9rem; /* เว้นที่ให้ 🔥 บนแท่งสูงสุด ไม่ชนตัวเลข */
  padding-bottom: 1.2rem;
}
.bar-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  height: 100%;
}
.bar-col i {
  position: relative;
  display: block;
  border-radius: 0.45rem 0.45rem 0.2rem 0.2rem;
  background: var(--color-teal);
  opacity: 0.6;
  transform-origin: bottom;
  transform: scaleY(0.15);
  transition: transform 0.5s cubic-bezier(0.3, 1.4, 0.5, 1);
  transition-delay: calc(var(--i) * 60ms);
}
.is-front .bar-col i {
  transform: scaleY(1);
}
.bar-col i.top {
  background: var(--color-mint);
  opacity: 1;
}
.bar-col em {
  position: absolute;
  left: 50%;
  top: -1.5rem;
  translate: -50% 0;
  font-style: normal;
  font-size: 1.1rem;
}
.bar-col {
  position: relative;
}
.bar-col small {
  position: absolute;
  left: 0;
  bottom: -1.2rem;
  width: 100%;
  text-align: center;
  font-size: 0.7rem;
  color: rgb(255 255 255 / 0.7);
}
/* เส้นเป้าหมายรายวัน (เส้นประ) */
.goal-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(1.2rem + 60% * (7.5rem - 1.2rem) / 7.5rem);
  border-top: 2px dashed rgb(255 255 255 / 0.45);
  z-index: 1;
  pointer-events: none;
}
.goal-line small {
  position: absolute;
  right: 0;
  top: -0.6rem;
  padding: 0 0.35rem;
  border-radius: 99px;
  background: #2f39a9;
  line-height: 1.1rem;
  font-size: 0.65rem;
  color: rgb(255 255 255 / 0.7);
}

/* ใบแก๊งเพื่อน: ข้อความซ้าย + กระดานลีกขวา (มือถือเรียงบน-ล่าง) */
.card-crew {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  align-items: center;
  gap: 2rem;
}
.league {
  display: grid;
  gap: 0.55rem;
}
.league li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 0.8rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--color-copy) 6%, transparent);
}
.league li.me {
  background: color-mix(in srgb, var(--color-mint) 16%, transparent);
  box-shadow: inset 0 0 0 2px var(--color-mint);
}
.rank {
  width: 1.2rem;
  font-family: var(--font-tag);
  font-size: 1.05rem;
  text-align: center;
  color: var(--color-muted);
}
.league li:first-child .rank {
  color: #f59e0b;
}
.face {
  flex: none;
  width: 2.9rem;
  height: 2.9rem;
  border: 3px solid #0b0f3a;
  border-radius: 50%;
  background: var(--color-mint);
  object-fit: cover;
}
.face-me {
  display: grid;
  place-items: center;
  background: #fff;
}
.face-me svg {
  width: 70%;
  fill: none;
  stroke: #0b0f3a;
  stroke-width: 2.4;
  stroke-linecap: round;
}
.who {
  flex: 1;
  min-width: 0;
}
.who b {
  display: block;
  font-size: 0.98rem;
}
.who i {
  font-style: normal;
}
.xp-bar {
  display: block;
  height: 0.45rem;
  margin-top: 0.3rem;
  overflow: hidden;
  border-radius: 99px;
  background: color-mix(in srgb, var(--color-copy) 10%, transparent);
}
.xp-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-mint), var(--color-teal));
}
.xp {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-muted);
}

.card-final {
  background: var(--color-mint);
}
.card-final h3,
.card-final .body,
.card-final .eyebrow {
  color: #0b0f3a;
}
/* ตัวอย่างเกมทายคำ */
.teaser {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.teaser span {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3.5rem;
  border: 3px solid #0b0f3a;
  border-radius: 0.8rem;
  background: #fff;
  color: #2f39a9;
  font-size: 1.6rem;
  font-weight: 900;
  box-shadow: 3px 3px 0 #0b0f3a;
}
.teaser span.empty {
  background: rgb(255 255 255 / 0.45);
  color: rgb(11 15 58 / 0.35);
  animation: tile-wait 1.6s ease-in-out infinite;
}
.teaser span.empty + span.empty {
  animation-delay: 0.3s;
}
@keyframes tile-wait {
  50% { transform: translateY(-4px); }
}
/* หนุ่มแว่นโบกมือ มุมขวาล่าง */
.final-mascot {
  position: absolute;
  right: -1rem;
  bottom: -2.5rem;
  width: min(40%, 17rem);
  transform: rotate(-4deg);
  pointer-events: none;
}
.card-final > :not(.final-mascot) {
  position: relative;
  z-index: 1;
  max-width: 62%;
}
.final-cta {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.8rem 1.5rem;
  border: 4px solid #0b0f3a;
  border-radius: 1rem;
  background: #fff;
  color: #0b0f3a;
  font-weight: 800;
  box-shadow: 5px 5px 0 #0b0f3a;
  transition: transform 0.15s;
}
.final-cta:hover {
  transform: translateY(-2px);
}

/* ลูกศรโค้งซ้าย + ดาวขวา (ตามภาพร่าง) */
.stack-arrow {
  position: absolute;
  left: calc(50% - min(50%, 23rem) - 7.5rem);
  top: 38%;
  width: 90px;
  fill: none;
  stroke: var(--color-mint);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px rgb(21 216 179 / 0.5));
}
.stack-sparkle {
  position: absolute;
  right: calc(50% - min(50%, 23rem) - 6.5rem);
  top: 45%;
  width: 56px;
  fill: var(--color-mint);
  stroke: #0b0f3a;
  stroke-width: 4;
}

.stack-meta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.95rem;
}
.count {
  font-family: var(--font-tag);
  font-size: 1.1rem;
  color: var(--color-mint);
}
.hint {
  color: rgb(255 255 255 / 0.65);
  transition: opacity 0.3s;
}
.hint.gone {
  opacity: 0;
}
.hint .bob {
  display: inline-block;
}

@media (max-width: 767px) {
  .stack {
    height: min(30rem, 66svh);
  }
  .intro-logo {
    width: 76%;
  }
  .stack-sticky {
    gap: 4.5rem;
  }
  .card {
    padding: 1.5rem 1.4rem;
  }
  .eyebrow {
    font-size: 1.25rem;
  }
  .body {
    font-size: 1rem;
  }
  .card-habit {
    grid-template-columns: 1fr;
    align-content: start;
    gap: 2rem;
  }
  .card-habit .body,
  .card-habit .badges {
    display: none; /* จอเล็ก: เหลือหัวข้อ + วิดเจ็ต */
  }
  .nudge {
    left: -0.4rem;
    right: -0.4rem;
  }
  .card-crew {
    grid-template-columns: 1fr;
    align-content: start;
    gap: 1rem;
  }
  .card-crew .body {
    display: none; /* จอเล็ก: เหลือหัวข้อ + กระดานลีก */
  }
  .league li {
    padding: 0.4rem 0.6rem;
  }
  .face {
    width: 2.4rem;
    height: 2.4rem;
  }
  .card-final > :not(.final-mascot) {
    max-width: 100%;
  }
  .card-final .body {
    max-width: 70%;
  }
  .teaser span {
    width: 2.4rem;
    height: 2.9rem;
    font-size: 1.3rem;
  }
  .final-mascot {
    width: 46%;
    right: -1.2rem;
    bottom: -1.5rem;
  }
  .stack-arrow {
    left: 10px;
    top: 13%;
    width: 44px;
  }
  .stack-sparkle {
    right: 12px;
    top: 16%;
    width: 36px;
  }
}
</style>
