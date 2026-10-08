<script setup>
import { ref } from 'vue'
import GraffitiText from './GraffitiText.vue'
import SprayDecor from './SprayDecor.vue'
import { scrollToHash } from '../smoothScroll'

// การ์ดแถวเดียว กดแล้วการ์ดนั้นขยาย (ด้านบนรูป ด้านล่างเนื้อหา) ที่เหลือหดเป็นแถบตัวเลข
defineProps({
  id: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  cta: { type: String, default: '' },
  cards: { type: Array, required: true }, // [{ tag, title, body, emoji?, image? }]
})

const open = ref(0)

// การ์ดที่มี href (เช่นหมวดเกม): กดครั้งแรก = เปิดการ์ด, กดตอนเปิดอยู่ = ไปที่ปลายทาง
function onCard(i, c) {
  if (open.value === i && c.href) scrollToHash(c.href)
  else open.value = i
}

const tones = [
  { bg: 'bg-ink', fg: 'text-white' },
  { bg: 'bg-mint', fg: 'text-night' },
  { bg: 'bg-steel', fg: 'text-white' },
  { bg: 'bg-teal', fg: 'text-night' },
]
const tone = (i) => tones[i % tones.length]
</script>

<template>
  <section :id="id" class="relative isolate scroll-mt-16 overflow-hidden bg-night pt-24 pb-28 text-white md:pt-36 md:pb-40">
    <!-- ผนังอิฐกราฟฟิตี้ชุดเดียวกับมินิเกม (ของตกแต่ง SprayDecor ยังอยู่ด้านบน) -->
    <div class="deck-wall absolute inset-0 -z-10" />
    <SprayDecor preset="deck" />

    <div class="mx-auto max-w-6xl px-4">
      <header v-reveal="'up'" class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <!-- ป้ายสติกเกอร์: พื้นมิ้นต์ขอบกรมท่า ให้ลอยเด่นจากผนัง -->
          <p v-if="eyebrow" class="deck-eyebrow">{{ eyebrow }}</p>
          <h2 class="mt-1 text-[clamp(2.25rem,6vw,4.5rem)]">
            <GraffitiText :text="title" :drips="false" />
          </h2>
        </div>
        <p v-if="hint" class="flex items-center gap-2 font-hand text-lg text-white/60">
          <span class="bob inline-block">👆</span> {{ hint }}
        </p>
      </header>

      <div v-reveal="'up'" class="deck mt-12 flex flex-col gap-3 md:h-[540px] md:flex-row md:gap-4" :style="{ '--n': cards.length }">
        <button
          v-for="(c, i) in cards"
          :key="i"
          type="button"
          :aria-expanded="open === i"
          class="deck-card relative overflow-hidden rounded-[1.5rem] border-4 border-night text-left"
          :class="
            open === i
              ? 'is-open bg-white text-night shadow-[8px_8px_0_0_rgb(0_0_0/0.45)]'
              : [tone(i).bg, tone(i).fg, 'cursor-pointer shadow-[5px_5px_0_0_rgb(0_0_0/0.45)] hover:-translate-y-1 hover:-rotate-1']
          "
          :style="{ '--i': i }"
          @click="onCard(i, c)"
        >
          <!-- ตอนหด: ตัวเลข + แท็ก -->
          <span
            class="absolute inset-0 flex items-center gap-4 px-5 transition-opacity duration-300 md:flex-col-reverse md:justify-between md:px-0 md:py-5"
            :class="open === i ? 'pointer-events-none opacity-0' : 'opacity-100 delay-300'"
            aria-hidden="true"
          >
            <span class="text-4xl md:text-5xl"><GraffitiText :text="String(i + 1)" /></span>
            <span class="flex-1 truncate font-bold md:hidden">{{ c.title }}</span>
            <!-- ชื่อหมวด: จอกว้างเขียนแนวตั้ง ตัวใหญ่ อยู่กลางการ์ด -->
            <span class="font-tag text-sm tracking-wider md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rotate-180 md:text-3xl md:[writing-mode:vertical-rl]">{{ c.tag }}</span>
          </span>

          <!-- ตอนเปิด: รูปด้านบน เนื้อหาด้านล่าง -->
          <span
            class="expanded absolute inset-y-0 left-0 flex w-full flex-col transition duration-300"
            :class="open === i ? 'translate-y-0 opacity-100 delay-300' : 'pointer-events-none translate-y-4 opacity-0'"
          >
            <span class="relative block h-[55%] shrink-0 overflow-hidden border-b-4 border-night" :class="tone(i).bg">
              <span class="deck-dots absolute inset-0 opacity-30" />
              <span class="splat absolute -top-6 -right-6 size-28 bg-white/25" />
              <span class="splat absolute -bottom-8 left-8 size-24 bg-night/25" />
              <!-- ตัวละครประจำหมวด: เด้งขึ้นจากขอบล่างตอนการ์ดเปิด แล้วขยับตามท่าของหมวดนั้น (anim) -->
              <span v-if="c.image" class="pack-char" :class="`anim-${c.anim}`" aria-hidden="true">
                <img :src="c.image" alt="" />
                <span v-if="c.anim === 'sway'" class="fx steam"><i /><i /><i /></span>
                <span v-if="c.anim === 'chill'" class="fx notes"><i>♪</i><i>♫</i><i>♪</i></span>
                <span v-if="c.anim === 'nervous'" class="fx sweat" />
              </span>
              <span v-else class="emoji absolute inset-0 grid place-items-center text-[5.5rem] md:text-[7rem]">{{ c.emoji }}</span>
              <span
                class="sticker absolute top-4 left-4 -rotate-6 rounded-xl border-4 border-night bg-white px-3 py-1 font-tag text-lg text-night shadow-[4px_4px_0_0_var(--color-night)]"
              >
                {{ c.tag }}
              </span>
              <span class="absolute right-4 bottom-2 text-6xl"><GraffitiText :text="String(i + 1)" /></span>
            </span>

            <span class="flex flex-1 flex-col p-5 md:p-7">
              <span class="block text-2xl leading-snug font-black text-heading md:text-3xl">{{ c.title }}</span>
              <span class="mt-2 block text-muted md:text-lg">{{ c.body }}</span>
              <span v-if="c.cta || cta" class="mt-auto inline-flex items-center gap-2 self-start pt-4 font-bold text-heading">
                {{ c.cta || cta }}
                <span class="arrow grid size-8 place-items-center rounded-full border-2 border-night bg-mint text-night">→</span>
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.deck-eyebrow {
  display: inline-block;
  padding: 0.2rem 0.9rem;
  border: 3px solid #0b0f3a;
  border-radius: 0.7rem;
  background: var(--color-mint);
  color: #0b0f3a;
  font: 1.35rem var(--font-hand);
  box-shadow: 4px 4px 0 #0b0f3a;
  transform: rotate(-3deg);
}

.deck-wall {
  background: url('/word-jam/bg-wall.webp') center / cover no-repeat;
}

.deck {
  container-type: inline-size;
}

.deck-card {
  flex: none;
  height: 5rem;
  transition:
    flex-grow 0.7s cubic-bezier(0.65, 0, 0.35, 1),
    height 0.7s cubic-bezier(0.65, 0, 0.35, 1),
    transform 0.2s,
    box-shadow 0.2s,
    background-color 0.4s;
}
.deck-card.is-open {
  height: 30rem;
}

@media (min-width: 768px) {
  .deck-card {
    flex: 1 1 0;
    min-width: 0;
    height: auto;
  }
  .deck-card.is-open {
    flex-grow: 7;
    height: auto;
  }
  /* ล็อกความกว้างเนื้อหาให้เท่าการ์ดตอนเปิดสุด ตัวหนังสือจะไม่ไหลตอนการ์ดกำลังขยาย */
  .expanded {
    width: calc((100cqw - (var(--n) - 1) * 1rem - var(--n) * 8px) * 7 / (var(--n) + 6));
  }
}

/* การ์ดทยอยเด้งขึ้นตอนเลื่อนมาเจอ */
.deck.is-revealed .deck-card {
  animation: card-in 0.6s cubic-bezier(0.3, 1.4, 0.5, 1) backwards;
  animation-delay: calc(var(--i) * 90ms);
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(60px) rotate(-4deg); }
}

/* ลูกเล่นตอนการ์ดเปิด */
.is-open .emoji {
  animation: pop-small 0.6s 0.35s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
.is-open .sticker {
  animation: pop-small 0.5s 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
.is-open .splat {
  animation: splat 0.7s 0.3s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
.deck-card:hover .arrow {
  transform: translateX(4px) rotate(-8deg);
}
.arrow {
  transition: transform 0.2s;
}

/* ---------- ตัวละครประจำหมวด ---------- */
.pack-char {
  position: absolute;
  left: 50%;
  bottom: -7%;
  height: 112%;
  translate: -50% 0;
  opacity: 0;
  pointer-events: none;
}
.pack-char img {
  display: block;
  height: 100%;
  width: auto;
  max-width: none;
  transform-origin: 50% 100%;
  filter: drop-shadow(0 10px 14px rgb(0 0 0 / 0.3));
}
/* เปิดการ์ด → เด้งขึ้นจากขอบล่าง */
.is-open .pack-char {
  animation: char-in 0.7s 0.35s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
@keyframes char-in {
  from { opacity: 0; transform: translateY(45%) rotate(-6deg); }
  to { opacity: 1; transform: none; }
}

/* ท่าขยับของแต่ละหมวด (เล่นวนตอนการ์ดเปิด) */
.is-open .anim-walk img { animation: walk 0.42s ease-in-out infinite alternate; }
.is-open .anim-sway img { animation: sway 2.4s ease-in-out infinite alternate; }
.is-open .anim-slurp img { animation: slurp 1.3s ease-in-out infinite; }
.is-open .anim-lean img { animation: lean 2.2s ease-in-out infinite alternate; }
.is-open .anim-chill img { animation: chill 3.2s ease-in-out infinite alternate; }
.is-open .anim-cheer img { animation: cheer 1.6s cubic-bezier(0.3, 1.4, 0.5, 1) infinite; }
.is-open .anim-nervous img { animation: nervous 2.4s ease-in-out infinite; }
@keyframes walk {
  from { transform: translateY(0) rotate(-2deg); }
  to { transform: translateY(-7px) rotate(2deg); }
}
@keyframes sway {
  from { transform: rotate(-2.5deg); }
  to { transform: rotate(2.5deg); }
}
@keyframes slurp {
  0%, 100% { transform: none; }
  25% { transform: translateY(3px) scale(1.02, 0.97); }
  50% { transform: translateY(-5px) scale(0.99, 1.02); }
}
@keyframes lean {
  from { transform: rotate(0deg); }
  to { transform: rotate(-4deg) translateX(-6px); }
}
@keyframes chill {
  from { transform: scale(1); }
  to { transform: scale(1.025, 1.035); }
}
@keyframes cheer {
  0%, 60%, 100% { transform: none; }
  20% { transform: translateY(-9px) rotate(-3deg); }
  40% { transform: translateY(0) rotate(1deg); }
}
@keyframes nervous {
  0%, 70%, 100% { transform: none; }
  74% { transform: translateX(-3px) rotate(-1deg); }
  78% { transform: translateX(3px) rotate(1deg); }
  82% { transform: translateX(-3px) rotate(-1deg); }
  86% { transform: translateX(2px); }
}

/* เอฟเฟกต์เสริม: ไอกาแฟ (ทำงาน), โน้ตเพลง (ชิล), เหงื่อหยด (สอบ) */
.fx {
  position: absolute;
  pointer-events: none;
}
.steam {
  left: 14%;
  top: 4%;
  display: flex;
  gap: 5px;
}
.steam i {
  width: 5px;
  height: 26px;
  border-radius: 99px;
  background: rgb(255 255 255 / 0.85);
  opacity: 0;
  animation: steam 2s ease-out infinite;
}
.steam i:nth-child(2) { animation-delay: 0.6s; }
.steam i:nth-child(3) { animation-delay: 1.2s; }
@keyframes steam {
  0% { opacity: 0; transform: translateY(10px) scaleY(0.5); }
  30% { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(-26px) translateX(4px) scaleY(1.1) skewX(-12deg); }
}
.notes {
  right: -4%;
  top: 6%;
  width: 3.5rem;
  height: 5rem;
}
.notes i {
  position: absolute;
  bottom: 0;
  font-style: normal;
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--color-mint);
  -webkit-text-stroke: 1.5px var(--color-night);
  opacity: 0;
  animation: note 3s ease-out infinite;
}
.notes i:nth-child(2) { left: 1.4rem; animation-delay: 1s; }
.notes i:nth-child(3) { left: 0.4rem; animation-delay: 2s; }
@keyframes note {
  0% { opacity: 0; transform: translateY(0) rotate(-10deg); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-4rem) rotate(15deg); }
}
.sweat {
  left: 70%;
  top: 22%;
  width: 10px;
  height: 14px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: #7fe7ff;
  border: 2px solid var(--color-night);
  animation: sweat 2.4s ease-in infinite;
}
@keyframes sweat {
  0%, 60% { opacity: 0; transform: translateY(0) scale(0.6); }
  70% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: translateY(26px); }
}

.deck-dots {
  background-image: radial-gradient(currentColor 1.5px, transparent 1.5px);
  background-size: 14px 14px;
  color: var(--color-night);
}
</style>

