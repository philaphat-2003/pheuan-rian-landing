<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

// มินิเกม Word Jam แบบ "พิมพ์คำตอบ" บนผนังกราฟฟิตี้ 3 แผง:
//   ซ้าย = ความคืบหน้า + ผนังที่ถูกพ่นสีตามตัวอักษรที่ทายถูก
//   กลาง = คำใบ้ + ช่องตัวอักษร + คีย์บอร์ดกระป๋องสเปรย์ + ส่งคำตอบ
//   ขวา  = เพื่อนเรียน AI (มาสคอตหนุ่มแว่น) คอยบอกผล + XP + คำถัดไป
// กติกา: พิมพ์ให้ครบช่องแล้วส่ง → ตัวที่ถูกตำแหน่งล็อกเป็นสีมิ้นต์ / ส่งผิดเสียสเปรย์ 1 กระป๋อง (6 กระป๋อง)
//        ตัวช่วยเปิดให้ 1 ตัวต่อคำ / พิมพ์บนคีย์บอร์ดจริงได้ (A–Z, Backspace, Enter) ตอนที่ section อยู่บนจอ
defineProps({
  id: { type: String, required: true },
})

const { t, tm, locale } = useI18n()

const MAX_MISS = 6
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((r) => r.split(''))

const wordCount = computed(() => tm('game.words').length)
const index = ref(Math.floor(Math.random() * 10))
const wordAt = (i) => t(`game.words.${i % wordCount.value}.word`)
const word = computed(() => wordAt(index.value))
const hint = computed(() => t(`game.words.${index.value % wordCount.value}.hint`))
const nextWord = computed(() => wordAt(index.value + 1))

// สถานะของคำปัจจุบัน
const locked = ref([]) // true = ตัวนี้ถูกตำแหน่งแล้ว (ล็อก)
const entry = ref([]) // ตัวที่พิมพ์ไว้ในช่องที่ยังไม่ล็อก
const tried = ref({}) // ตัวอักษรที่เคยส่งแล้ว → 'hit' (มีในคำ) | 'miss' (ไม่มีในคำ)
const misses = ref(0)
const clueUsed = ref(false)
const status = ref('play') // play | win | lose
const shakeKey = ref(0)
const cursor = ref(0) // ช่องถัดไปที่จะพิมพ์ (ดู type())

// สถานะรวมของรอบเล่นนี้
const solved = ref(0)
const streak = ref(0)
const xp = ref(0)
const lastXp = ref(0)
const say = ref({ key: 'idle', n: 0 }) // ข้อความของเพื่อนเรียน AI
const sayTick = ref(0)

function reset() {
  const n = word.value.length
  locked.value = Array(n).fill(false)
  entry.value = Array(n).fill('')
  tried.value = {}
  misses.value = 0
  cursor.value = 0
  clueUsed.value = false
  status.value = 'play'
  lastXp.value = 0
  setSay('idle')
}
reset()

const over = computed(() => status.value !== 'play')
const lockedCount = computed(() => locked.value.filter(Boolean).length)
const full = computed(() => entry.value.every((c, i) => locked.value[i] || c))
const paint = computed(() => (status.value === 'win' ? 100 : Math.round((lockedCount.value / word.value.length) * 100)))
const slotChar = (i) => (locked.value[i] ? word.value[i] : status.value === 'lose' ? word.value[i] : entry.value[i])

function setSay(key, n = 0) {
  say.value = { key, n }
  sayTick.value++
}
// อารมณ์ของมาสคอต → เฟรมในภาพ 3 ท่า (0 ปกติ, 1 ดีใจ, 2 ให้กำลังใจ)
const mood = computed(() => ({ idle: 0, close: 1, clue: 1, win: 1, none: 2, lose: 2 })[say.value.key])

// เคอร์เซอร์เดินทีละช่อง: เจอช่องที่ล็อก → ถ้าพิมพ์ตัวเดียวกับที่ล็อกถือว่ายืนยันช่องนั้น (พิมพ์ทั้งคำได้)
// ถ้าพิมพ์ตัวอื่นก็ข้ามช่องล็อกไปวางที่ช่องว่างถัดไป (พิมพ์เฉพาะตัวที่ขาดได้)
function type(ch) {
  if (over.value) return
  const n = word.value.length
  let p = cursor.value
  while (p < n && locked.value[p]) {
    if (ch === word.value[p]) {
      cursor.value = p + 1
      return
    }
    p++
  }
  if (p >= n) return
  entry.value[p] = ch
  cursor.value = p + 1
}
function backspace() {
  if (over.value) return
  for (let k = Math.min(cursor.value, entry.value.length) - 1; k >= 0; k--) {
    if (!locked.value[k] && entry.value[k]) {
      entry.value[k] = ''
      cursor.value = k
      return
    }
  }
  cursor.value = 0
}
function finish(win) {
  status.value = win ? 'win' : 'lose'
  if (win) {
    solved.value++
    streak.value++
    lastXp.value = Math.max(5, 10 + (misses.value === 0 ? 5 : 0) - (clueUsed.value ? 3 : 0))
  } else {
    streak.value = 0
    lastXp.value = 2
  }
  xp.value += lastXp.value
  setSay(win ? 'win' : 'lose')
}
function submit() {
  if (over.value || !full.value) return
  const w = word.value
  const guess = entry.value.map((c, i) => (locked.value[i] ? w[i] : c))
  guess.forEach((c, i) => {
    if (!locked.value[i]) tried.value[c] = w.includes(c) ? 'hit' : (tried.value[c] ?? 'miss')
    if (c === w[i]) locked.value[i] = true
  })
  if (locked.value.every(Boolean)) return finish(true)
  misses.value++
  shakeKey.value++
  entry.value = entry.value.map(() => '')
  cursor.value = 0
  if (misses.value >= MAX_MISS) return finish(false)
  setSay(lockedCount.value ? 'close' : 'none', lockedCount.value)
}
function clue() {
  if (over.value || clueUsed.value) return
  const open = locked.value.map((l, i) => (l ? -1 : i)).filter((i) => i >= 0)
  const i = open[Math.floor(Math.random() * open.length)]
  locked.value[i] = true
  entry.value[i] = ''
  clueUsed.value = true
  // เคลียร์ตัวที่พิมพ์ค้างไว้หลังช่องที่เพิ่งเปิด ให้พิมพ์ต่อได้ถูกตำแหน่ง
  entry.value = entry.value.map((c, k) => (k < cursor.value ? c : ''))
  if (locked.value.every(Boolean)) return finish(true)
  setSay('clue')
}
function next() {
  index.value = (index.value + 1) % wordCount.value
  reset()
}

// อ่านออกเสียง (ถ้าเบราว์เซอร์รองรับ)
function speak(text, lang) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = 0.9
  speechSynthesis.speak(u)
}
const speakHint = () => speak(hint.value, locale.value === 'th' ? 'th-TH' : 'en-US')
const speakWord = () => speak(word.value.toLowerCase(), 'en-US')

// พิมพ์บนคีย์บอร์ดจริงได้ เฉพาะตอนที่ section นี้อยู่บนจอ
const root = ref(null)
let inView = false
let observer
function onKey(e) {
  if (!inView || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.target.closest?.('input, textarea, [contenteditable]')) return
  const key = e.key.toUpperCase()
  if (/^[A-Z]$/.test(key)) type(key)
  else if (e.key === 'Backspace') backspace()
  else if (e.key === 'Enter') over.value ? next() : submit()
  else return
  e.preventDefault()
}
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.4 })
  observer.observe(root.value)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('keydown', onKey)
})

// คีย์ทุกตัวสีน้ำเงินเดียวกัน: สีมิ้นต์มีไว้บอกว่า 'ตัวนี้มีในคำ' อย่างเดียว
const keyTone = () => 'blue'

// ภาพคำบนผนัง (public/word-jam/word-<คำ>.webp) — คำไหนยังไม่มีภาพ ใช้โลโก้แทน
const artMissing = ref({})
const wordArt = computed(() => (artMissing.value[word.value] ? t('logo') : `/word-jam/word-${word.value.toLowerCase()}.webp`))
const onArtError = () => (artMissing.value = { ...artMissing.value, [word.value]: true })
</script>

<template>
  <!-- ฉากเกม: ผนังกราฟฟิตี้ด้านหลัง (ชื่อเกม/ชีวิต | ภาพคำ+คำใบ้+ช่องตัวอักษร | มาสคอตยืนพิงผนัง)
       แล้ว "เคาน์เตอร์" ด้านล่างวางแป้นพิมพ์ — แบบเกมบาร์เทนเดอร์ -->
  <section :id="id" ref="root" class="jam relative isolate scroll-mt-16 overflow-hidden pt-24 pb-28 md:pt-36 md:pb-40">
    <img src="/word-jam/tag-learn-english.webp" alt="" class="jam-tag" width="420" height="396" aria-hidden="true" />

    <header v-reveal="'up'" class="mx-auto max-w-2xl px-4 text-center">
      <p class="inline-block font-hand text-2xl text-mint">
        {{ t('game.eyebrow') }}
        <span class="spray-line" />
      </p>
      <p class="mx-auto mt-4 max-w-md text-white/70">{{ t('game.desc') }}</p>
    </header>

    <div v-reveal="{ from: 'up', delay: 100 }" class="scene mx-auto mt-8 max-w-[76rem] px-4">
      <!-- ================= ผนัง ================= -->
      <div class="wall-zone">
        <!-- ซ้าย: ชื่อเกม + กระป๋องชีวิต + สกอร์ -->
        <div class="zone-left">
          <h2 class="title"><img src="/word-jam/title-word-jam.webp" :alt="t('game.title')" width="900" height="344" /></h2>
          <div class="cans" role="img" :aria-label="t('game.sprayCount', { n: MAX_MISS - misses, max: MAX_MISS })">
            <img
              v-for="n in MAX_MISS"
              :key="n"
              :src="n <= misses ? '/word-jam/spray-can-empty.webp' : '/word-jam/spray-can-full.webp'"
              alt=""
              class="can"
              :class="{ 'is-used': n <= misses }"
              width="120"
              height="234"
              aria-hidden="true"
            />
            <small>{{ t('game.misses', { n: MAX_MISS }) }}</small>
          </div>
          <div class="chips">
            <span class="chip"><small>🔥 {{ t('game.currentStreak') }}</small><b>{{ streak }}</b></span>
            <span class="chip"><small>📖 {{ t('game.wordsLearned') }}</small><b>{{ solved }}<em>/{{ wordCount }}</em></b></span>
            <span class="chip chip-xp" :class="{ 'is-on': over }">
              <img src="/word-jam/xp-splat.webp" alt="" width="220" height="222" />
              <b>{{ over ? t('game.xpGain', { n: lastXp }) : `${xp} XP` }}</b>
            </span>
          </div>
        </div>

        <!-- กลาง: ภาพคำบนผนัง (ถูกพ่นสีตามตัวที่ล็อก) + คำใบ้ + ช่องตัวอักษร -->
        <div class="zone-center">
          <figure class="poster" aria-hidden="true">
            <span class="poster-label">{{ t('game.guessWord') }}</span>
            <span class="poster-chip">🏷️ {{ t('game.categoryName') }}</span>
            <div class="wall">
              <img :key="wordArt" :src="wordArt" alt="" class="wall-guide" :class="{ 'is-photo': !artMissing[word] }" @error="onArtError" />
              <img :key="`${wordArt}-p`" :src="wordArt" alt="" class="wall-paint" :class="{ 'is-photo': !artMissing[word] }" :style="{ clipPath: `inset(0 ${100 - paint}% 0 0)` }" />
            </div>
          </figure>

          <div class="hint-box">
            <div>
              <small class="hint-label">♛ {{ t('game.hint') }}</small>
              <p class="hint-text">{{ hint }}</p>
            </div>
            <button type="button" class="round-btn" :aria-label="t('game.listen')" @click="speakHint">
              <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></svg>
            </button>
            <button type="button" class="clue-btn" :disabled="clueUsed || over" @click="clue">💡 {{ clueUsed ? t('game.clueUsed') : t('game.needClue') }}</button>
          </div>

          <div :key="`s-${index}-${shakeKey}`" class="slots" :class="{ shake: shakeKey && !over }" aria-live="polite">
            <span
              v-for="(c, i) in word"
              :key="i"
              class="slot"
              :class="{ 'is-locked': locked[i] || status === 'win', 'is-reveal': status === 'lose' && !locked[i], 'is-typed': !locked[i] && entry[i] }"
            >
              <span v-if="slotChar(i)" class="slot-ch">{{ slotChar(i) }}</span>
            </span>
          </div>
        </div>

        <!-- ขวา: มาสคอตยืนพิงผนัง ขาจมหลังเคาน์เตอร์ + บับเบิลคำพูด -->
        <div class="zone-right">
          <div class="tutor-bubble">
            <span class="tutor-name"><img src="/brand-mark.webp" alt="" class="tutor-icon" />{{ t('game.tutor') }}<span class="online" aria-hidden="true" /></span>
            <p :key="sayTick" class="tutor-say" role="status" aria-live="polite">{{ t(`game.tutorSay.${say.key}`, { n: say.n }) }}</p>
          </div>
          <div class="mascot-stage">
            <span class="mascot-glow" aria-hidden="true" />
            <div :key="`m-${sayTick}`" class="tutor-mascot" :class="`mood-${mood}`" aria-hidden="true">
              <span class="mascot-sheet" :style="{ backgroundPositionX: `${mood * 50}%` }" />
              <span v-if="mood === 0" class="mascot-sheet mascot-blink" />
            </div>
          </div>
        </div>
      </div>

      <!-- ================= เคาน์เตอร์ + แป้นพิมพ์ ================= -->
      <div class="counter">
        <div class="keys">
          <!-- --n = จำนวนช่องในแถว (แถวล่างนับปุ่มลบเป็น 2 ช่อง) -->
          <div v-for="(row, r) in ROWS" :key="r" class="key-row" :style="{ '--n': row.length + (r === 2 ? 2 : 0) }">
            <button
              v-for="ch in row"
              :key="ch"
              type="button"
              class="key"
              :class="[`tone-${keyTone(ch)}`, tried[ch] && `is-${tried[ch]}`]"
              :disabled="over"
              @click="type(ch)"
            >
              {{ ch }}
            </button>
            <button v-if="r === 2" type="button" class="key key-wide" :aria-label="t('game.backspace')" :disabled="over" @click="backspace">⌫</button>
          </div>
        </div>

        <div class="counter-foot">
          <!-- ระหว่างเล่น: วิธีพิมพ์ + ข้าม / จบคำ: ผลลัพธ์ + ฟังเสียง -->
          <div v-if="!over" class="foot-info">
            <p class="result-tip">⌨️ {{ t('game.typeTip') }}</p>
            <button type="button" class="skip-btn" @click="next">{{ t('game.skip') }}</button>
          </div>
          <div v-else class="foot-info result" :class="`is-${status}`">
            <span class="result-icon" aria-hidden="true">{{ status === 'win' ? '✓' : '✕' }}</span>
            <b class="result-word">{{ word }}</b>
            <button type="button" class="mini-speak" :aria-label="t('game.listen')" @click="speakWord">
              <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9Z" /><path d="M16 9a4 4 0 0 1 0 6" /></svg>
            </button>
            <span class="result-pill">{{ status === 'win' ? t('game.win') : t('game.lose', { word }) }}</span>
          </div>
          <button v-if="!over" type="button" class="submit-btn" :disabled="!full" @click="submit">{{ t('game.submit') }} →</button>
          <button v-else type="button" class="submit-btn" @click="next">{{ status === 'win' ? t('game.next') : t('game.retry') }} →</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- ผนัง (ภาพ bg-wall) ---------- */
.jam {
  color: #fff;
  background: url('/word-jam/bg-wall.webp') center / cover no-repeat, #0b0f3a;
}
.jam-tag {
  position: absolute;
  top: 1.5rem;
  left: 2%;
  z-index: 1;
  width: clamp(9rem, 14vw, 13rem);
  transform: rotate(-8deg);
  filter: drop-shadow(0 0 14px rgb(21 216 179 / 0.45));
  pointer-events: none;
}

/* ---------- โซนผนัง: ซ้าย | กลาง | ขวา ---------- */
.wall-zone {
  display: grid;
  grid-template-columns: minmax(0, 15rem) minmax(0, 1fr) minmax(0, 17rem);
  align-items: end;
  gap: 1.5rem;
}
.zone-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: start;
  padding-top: 1rem;
}
.zone-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-bottom: 2.6rem; /* เว้นให้เคาน์เตอร์ที่ซ้อนขึ้นมา */
}
.zone-right {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title img {
  display: block;
  width: 100%;
  transform: rotate(-4deg);
}
.cans {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.15rem;
}
.cans small {
  width: 100%;
  font: 0.8rem var(--font-tag);
  color: rgb(255 255 255 / 0.7);
}
.can {
  width: 2.1rem;
  transform-origin: 50% 100%;
}
.can:nth-of-type(odd) { transform: rotate(-6deg); }
.can:nth-of-type(even) { transform: rotate(5deg); }
.can.is-used { animation: can-out 0.45s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes can-out {
  from { transform: scale(1.4) rotate(-14deg); }
}
.chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}
.chip {
  display: grid;
  gap: 0.05rem;
  padding: 0.45rem 0.6rem;
  border: 2px solid rgb(255 255 255 / 0.1);
  border-radius: 0.8rem;
  background: rgb(11 15 58 / 0.8);
}
.chip small {
  font-size: 0.7rem;
  color: rgb(255 255 255 / 0.65);
}
.chip b {
  font-size: 1.3rem;
  line-height: 1.1;
}
.chip em {
  font-style: normal;
  font-size: 0.75rem;
  color: rgb(255 255 255 / 0.55);
}
.chip-xp {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.chip-xp img {
  width: 2.4rem;
  transform: rotate(-8deg);
}
.chip-xp.is-on img {
  animation: xp-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes xp-pop {
  from { transform: rotate(-8deg) scale(0.4); }
}

/* ---------- ภาพคำบนผนัง (โปสเตอร์) ---------- */
.poster {
  position: relative;
  width: min(100%, 30rem);
  margin-top: 0.8rem;
  padding: 0.6rem;
  border: 3px solid #0b0f3a;
  border-radius: 1rem;
  background: #eef0f5;
  box-shadow: 7px 8px 0 rgb(0 0 0 / 0.4), 0 0 34px rgb(21 216 179 / 0.22);
  transform: rotate(-1.5deg);
}
.poster-label,
.poster-chip {
  position: absolute;
  z-index: 2;
  top: -0.95rem;
  padding: 0.2rem 0.65rem;
  border: 2px solid #0b0f3a;
  white-space: nowrap;
}
.poster-label {
  left: -0.6rem;
  border-radius: 0.5rem;
  background: #0b0f3a;
  color: var(--color-mint);
  font: 0.9rem var(--font-tag);
  transform: rotate(-6deg);
}
.poster-chip {
  right: -0.5rem;
  border-radius: 99px;
  background: var(--color-ink);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  transform: rotate(3deg);
}
.wall {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.6rem;
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.25) 0 2px, transparent 2px 18px),
    repeating-linear-gradient(90deg, rgb(0 0 0 / 0.2) 0 2px, transparent 2px 38px),
    #5b6178;
}
.wall img {
  position: absolute;
  inset: 8%;
  width: 84%;
  height: 84%;
  object-fit: contain;
}
.wall img.is-photo {
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.wall-guide {
  filter: grayscale(1) brightness(1.4);
  opacity: 0.25;
}
.wall-guide.is-photo {
  filter: grayscale(1) contrast(0.7) brightness(0.9);
  opacity: 1;
}
.wall-paint {
  transition: clip-path 0.7s cubic-bezier(0.16, 0.8, 0.3, 1);
}

/* ---------- คำใบ้ + ช่องตัวอักษร ---------- */
.hint-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  width: min(100%, 36rem);
  padding: 0.7rem 0.9rem;
  border: 3px solid #0b0f3a;
  border-radius: 1rem;
  background: #fff;
  color: #0b0f3a;
  box-shadow: 5px 6px 0 rgb(0 0 0 / 0.35);
}
.hint-box > div {
  flex: 1;
  min-width: 10rem;
}
.hint-label {
  font: 0.8rem var(--font-tag);
  color: var(--color-ink);
}
.hint-text {
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.3;
}
.round-btn {
  display: grid;
  place-items: center;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  background: #0b0f3a;
  color: #fff;
  transition: transform 0.15s;
}
.round-btn:hover { transform: scale(1.08); }
.round-btn svg,
.mini-speak svg {
  width: 1.3rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.clue-btn {
  padding: 0.5rem 0.95rem;
  border: 3px solid #0b0f3a;
  border-radius: 99px;
  background: var(--color-ink);
  color: #fff;
  font-weight: 700;
  box-shadow: 3px 3px 0 #0b0f3a;
  transition: transform 0.15s;
}
.clue-btn:hover:not(:disabled) { transform: translateY(-2px); }
.clue-btn:disabled {
  background: #c9cede;
  color: #5b6178;
  box-shadow: none;
}
.slots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}
.slot {
  display: grid;
  place-items: center;
  width: 3.7rem;
  height: 4.2rem;
  border: 3px dashed rgb(255 255 255 / 0.3);
  border-radius: 0.8rem;
  background: rgb(11 15 58 / 0.55);
  color: #fff;
  font-size: 2.3rem;
  font-weight: 900;
  transition: background 0.25s, border-color 0.25s;
}
.slot.is-typed {
  border-style: solid;
  border-color: #fff;
  background: rgb(255 255 255 / 0.14);
}
.slot.is-locked {
  border: 3px solid #0b0f3a;
  background: var(--color-mint);
  color: #0b0f3a;
  box-shadow: 3px 4px 0 #0b0f3a, 0 0 18px rgb(21 216 179 / 0.55);
}
.slot.is-reveal {
  border-style: solid;
  border-color: var(--color-teal);
  color: var(--color-teal);
}
.slot-ch {
  animation: slot-in 0.25s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
@keyframes slot-in {
  from { transform: scale(0.4); opacity: 0; }
}
.shake { animation: shake 0.45s both; }
@keyframes shake {
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

/* ---------- มาสคอต + บับเบิล ---------- */
.tutor-bubble {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0.65rem 0.85rem 0.8rem;
  border: 3px solid #0b0f3a;
  border-radius: 1.1rem;
  background: var(--color-mint);
  color: #0b0f3a;
  box-shadow: 5px 6px 0 rgb(0 0 0 / 0.4);
}
.tutor-bubble::after {
  content: '';
  position: absolute;
  left: 42%;
  bottom: -14px;
  width: 22px;
  height: 22px;
  background: var(--color-mint);
  border-right: 3px solid #0b0f3a;
  border-bottom: 3px solid #0b0f3a;
  transform: rotate(45deg);
}
.tutor-name {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 800;
}
.tutor-icon {
  width: 1.6rem;
  height: 1.6rem;
  border: 2px solid #0b0f3a;
  border-radius: 0.5rem;
}
.online {
  width: 0.55rem;
  height: 0.55rem;
  margin-left: auto;
  border-radius: 50%;
  background: #0b0f3a;
}
.tutor-say {
  margin-top: 0.3rem;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  animation: say-in 0.3s ease-out both;
}
@keyframes say-in {
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
}
.mascot-stage {
  position: relative;
  width: 100%;
  margin-top: 0.4rem;
  margin-bottom: -2.4rem; /* ขาจมลงหลังเคาน์เตอร์ */
}
.mascot-glow {
  position: absolute;
  inset: 12% 4% 6%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(21 216 179 / 0.35), transparent 68%);
  filter: blur(6px);
}
.tutor-mascot {
  position: relative;
  width: 100%;
  aspect-ratio: 512 / 740; /* หนึ่งเฟรม: จากหัว (y150) ถึงเอว (y890) */
  transform-origin: 50% 100%;
  animation: mascot-pop 0.5s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.mood-1 { animation-name: mascot-cheer; }
.mood-2 { animation-name: mascot-flinch; }
/* ภาพ 1536×1024 สามท่า: กว้าง 300% ของกล่อง; ตำแหน่งแนวตั้ง 52.9% = เริ่มที่ y150 ของภาพ */
.mascot-sheet {
  position: absolute;
  inset: 0;
  background: url('/mascot-reactions.png') 0 52.9% / 300% auto no-repeat;
  filter: drop-shadow(0 14px 18px rgb(0 0 0 / 0.45));
  clip-path: inset(0 4%);
}
.mascot-blink {
  background-image: url('/mascot-blink.png');
  clip-path: inset(30% 4% 57.4% 4%); /* แถบตา (y 372–465 ของภาพ) */
  opacity: 0;
  filter: none;
  animation: blink 5s linear infinite 1.2s;
}
@keyframes blink {
  0%, 44%, 47%, 100% { opacity: 0; }
  45%, 46% { opacity: 1; }
}
@keyframes mascot-pop {
  from { transform: translateY(10px) scale(0.95); }
}
@keyframes mascot-cheer {
  0%, 100% { transform: none; }
  40% { transform: translateY(-18px) rotate(-3deg) scale(1.03); }
}
@keyframes mascot-flinch {
  0%, 100% { transform: none; }
  25% { transform: translateX(-6px) rotate(-3deg); }
  60% { transform: translateX(5px) rotate(2deg); }
}

/* ---------- เคาน์เตอร์ ---------- */
.counter {
  position: relative;
  z-index: 3; /* ทับขามาสคอต */
  padding: 1.4rem 1.6rem 1.1rem;
  border: 4px solid #0b0f3a;
  border-top: 6px solid var(--color-mint);
  border-radius: 1.6rem 1.6rem 1.2rem 1.2rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), transparent 30%),
    #141a52;
  box-shadow: 0 -10px 30px rgb(21 216 179 / 0.18), 0 24px 40px -18px rgb(0 0 0 / 0.7);
}
/* ขอบหน้าเคาน์เตอร์ (เหมือนแผ่นไม้ด้านหน้า) */
.counter::after {
  content: '';
  position: absolute;
  left: 2%;
  right: 2%;
  bottom: -14px;
  height: 14px;
  border: 4px solid #0b0f3a;
  border-top: 0;
  border-radius: 0 0 1rem 1rem;
  background: #0f1440;
}

/* คีย์ = รอยพ่นสเปรย์ (public/word-jam/key-*.webp, สัดส่วน 160×183) */
.keys {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
  max-width: 50rem;
  margin: 0 auto;
}
.key-row {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 4.1rem));
  justify-content: center;
  gap: 0.3rem;
}
.key {
  position: relative;
  width: 100%;
  aspect-ratio: 160 / 183;
  padding-bottom: 14%;
  background: var(--tile) center top / 100% auto no-repeat;
  color: #fff;
  font: clamp(1.1rem, 1.9vw, 1.85rem) var(--font-tag);
  text-shadow: 2px 2px 0 #0b0f3a, -1px -1px 0 #0b0f3a;
  transition: transform 0.12s, opacity 0.2s, filter 0.2s;
}
.tone-ink { --tile: url('/word-jam/key-ink.webp'); }
.tone-teal { --tile: url('/word-jam/key-teal.webp'); }
.tone-blue { --tile: url('/word-jam/key-blue.webp'); }
.tone-mint { --tile: url('/word-jam/key-mint.webp'); }
.key:hover:not(:disabled) { transform: translateY(-3px) rotate(-4deg); }
.key:active:not(:disabled) { transform: translateY(2px) scale(0.94); }
.key.is-hit {
  --tile: url('/word-jam/key-mint.webp');
  color: #0b0f3a;
  text-shadow: 1px 1px 0 #fff;
  filter: drop-shadow(0 0 8px rgb(21 216 179 / 0.9));
}
.key.is-miss {
  opacity: 0.28;
  filter: grayscale(0.7);
  text-decoration: line-through;
}
.key-wide {
  grid-column: span 2;
  aspect-ratio: auto;
  background: url('/word-jam/key-ink.webp') center top / 100% 100% no-repeat;
  filter: brightness(0.55);
  font-family: var(--font-display);
}
.key:disabled { cursor: default; }

.counter-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem 1rem;
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 2px dashed rgb(255 255 255 / 0.12);
}
.foot-info {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 0.9rem;
  min-width: 14rem;
}
.result-tip {
  color: rgb(255 255 255 / 0.65);
  font-size: 0.95rem;
}
.skip-btn {
  padding: 0.4rem 0.9rem;
  border: 2px solid rgb(255 255 255 / 0.25);
  border-radius: 99px;
  color: rgb(255 255 255 / 0.8);
  font-size: 0.85rem;
}
.skip-btn:hover {
  border-color: var(--color-mint);
  color: #fff;
}
.result-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-mint);
  color: #0b0f3a;
  font-size: 1.3rem;
  font-weight: 900;
  box-shadow: 0 0 0 4px rgb(21 216 179 / 0.3);
  animation: xp-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.result.is-lose .result-icon { background: var(--color-teal); }
.result-word {
  font: 1.6rem var(--font-tag);
  letter-spacing: 1px;
}
.mini-speak {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: var(--color-mint);
}
.result-pill {
  padding: 0.4rem 0.95rem;
  border-radius: 99px;
  background: var(--color-mint);
  color: #0b0f3a;
  font-weight: 800;
}
.result.is-lose .result-pill { background: var(--color-teal); }
.submit-btn {
  padding: 0.75rem 1.7rem;
  border: 4px solid #0b0f3a;
  border-radius: 1rem;
  background: var(--color-mint);
  color: #0b0f3a;
  font: 1.35rem var(--font-tag);
  box-shadow: 5px 6px 0 #0b0f3a, 0 0 20px rgb(21 216 179 / 0.45);
  transform: rotate(-2deg);
  transition: transform 0.15s, opacity 0.2s;
}
.submit-btn:hover:not(:disabled) { transform: rotate(-2deg) translateY(-2px); }
.submit-btn:disabled {
  opacity: 0.35;
  box-shadow: 5px 6px 0 #0b0f3a;
  cursor: default;
}

/* ---------- จอแคบ: เรียงเป็นคอลัมน์ [ชื่อเกม+ชีวิต] [มาสคอต|บับเบิล] [ภาพคำ+คำใบ้+ช่อง] [เคาน์เตอร์] ---------- */
@media (max-width: 1023px) {
  .wall-zone {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
    gap: 1rem;
  }
  .zone-left {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding-top: 0;
  }
  .zone-left { flex-wrap: nowrap; gap: 0.6rem; }
  .title { flex: 0 1 min(50%, 16rem); }
  .cans { flex-wrap: nowrap; justify-content: flex-end; }
  .cans small { display: none; }
  .can { width: clamp(1.25rem, 6vw, 2rem); }
  .chips { display: none; }
  .zone-right {
    order: -1;
    display: grid;
    grid-template-columns: clamp(6rem, 28vw, 8.5rem) minmax(0, 1fr);
    align-items: center;
    column-gap: 0.9rem;
  }
  .zone-right .tutor-bubble { grid-column: 2; grid-row: 1; }
  .zone-right .mascot-stage { grid-column: 1; grid-row: 1; margin: 0; }
  .tutor-bubble::after {
    left: -13px;
    top: 50%;
    bottom: auto;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    border: 0;
    border-left: 3px solid #0b0f3a;
    border-bottom: 3px solid #0b0f3a;
  }
  .zone-center { padding-bottom: 1.2rem; }
}
@media (max-width: 640px) {
  .jam-tag { display: none; }
  .counter { padding: 1rem 0.6rem 0.9rem; }
  .key-row { gap: 0.12rem; }
  .key { font-size: 1.1rem; }
  .slot { width: 2.4rem; height: 2.9rem; font-size: 1.5rem; }
  .hint-text { font-size: 1.1rem; }
  .submit-btn { font-size: 1.1rem; padding: 0.6rem 1.1rem; }
  .result-tip { font-size: 0.85rem; }
}
@media (prefers-reduced-motion: reduce) {
  .tutor-mascot, .mascot-blink, .slot-ch, .shake, .tutor-say { animation: none !important; }
}
</style>
