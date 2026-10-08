<script setup>
import SprayDecor from './SprayDecor.vue'
// การ์ดข่าว/อัปเดต: ใบแรกใหญ่ (ข่าวล่าสุด) ที่เหลือเรียงด้านข้าง
defineProps({
  id: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  more: { type: String, default: '' },
  items: { type: Array, required: true }, // [{ tag, date, version, title, body, emoji?, image? }]
})

const tones = ['bg-ink', 'bg-teal', 'bg-steel', 'bg-mint']
</script>

<template>
  <section :id="id" class="relative isolate scroll-mt-16 overflow-x-clip bg-wall py-20 md:py-28">
    <SprayDecor preset="news" />
    <div class="mx-auto max-w-6xl px-4">
      <header v-reveal="'left'">
        <p v-if="eyebrow" class="inline-block font-hand text-2xl text-eyebrow">
          {{ eyebrow }}
          <span class="spray-line" />
        </p>
        <h2 class="mt-4 text-4xl leading-[1.3] font-black text-heading md:text-6xl">{{ title }}</h2>
      </header>

      <div class="mt-12 grid gap-6 md:grid-cols-3 md:grid-rows-2">
        <div
          v-for="(item, i) in items"
          :key="i"
          v-reveal="{ from: i === 0 ? 'left' : 'right', delay: i * 120 }"
          :class="i === 0 && 'md:col-span-2 md:row-span-2'"
        >
        <article
          class="news-card group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border-4 border-night bg-paper"
          :class="i !== 0 && 'md:flex-row'"
        >
          <div
            class="relative shrink-0 overflow-hidden border-night"
            :class="[tones[i % tones.length], i === 0 ? 'h-56 border-b-4 md:h-72' : 'h-40 border-b-4 md:h-auto md:w-2/5 md:border-r-4 md:border-b-0']"
          >
            <img v-if="item.image" :src="item.image" alt="" class="size-full object-cover" />
            <template v-else>
              <span class="news-dots absolute inset-0 opacity-25" />
              <span class="splat absolute -right-8 -bottom-10 size-36 bg-white/20" />
              <!-- ตัวละครยืนโผล่จากขอบล่าง + emoji เป็นป้ายลอย -->
              <template v-if="item.char">
                <img :src="item.char" alt="" class="news-char" :class="i === 0 ? 'is-big' : 'is-small'" />
                <span class="news-emoji" :class="i === 0 ? 'is-big' : 'is-small'" aria-hidden="true">{{ item.emoji }}</span>
              </template>
              <span
                v-else
                class="absolute inset-0 grid place-items-center transition duration-500 group-hover:scale-110 group-hover:-rotate-6"
                :class="i === 0 ? 'text-[7rem]' : 'text-6xl'"
              >
                {{ item.emoji }}
              </span>
            </template>
            <span
              v-if="item.tag"
              class="absolute top-4 left-4 -rotate-6 rounded-xl border-4 border-night px-3 py-0.5 font-tag text-night shadow-[3px_3px_0_0_var(--color-night)]"
              :class="[item.tag === 'NEW' ? 'new-flash bg-mint text-lg' : 'bg-white text-sm']"
            >
              {{ item.tag }}
            </span>
          </div>

          <div class="flex flex-1 flex-col p-5" :class="i === 0 && 'md:p-7'">
            <p class="flex items-center gap-2 text-sm text-muted">
              <span class="rounded-md bg-ink/10 px-2 py-0.5 font-bold text-heading">{{ item.version }}</span>
              {{ item.date }}
            </p>
            <h3 class="mt-2 leading-snug font-black text-copy" :class="i === 0 ? 'text-2xl md:text-4xl' : 'text-xl'">{{ item.title }}</h3>
            <p class="mt-2 text-muted" :class="i === 0 ? 'md:text-lg' : 'text-sm'">{{ item.body }}</p>
            <a
              v-if="more"
              href="#"
              class="mt-auto inline-flex items-center gap-2 self-start pt-4 font-bold text-heading after:absolute after:inset-0"
              @click.prevent
            >
              {{ more }}
              <span class="transition group-hover:translate-x-1">→</span>
            </a>
          </div>
        </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.news-card {
  box-shadow: 8px 8px 0 0 var(--color-night);
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.news-card:hover {
  transform: translate(-3px, -3px) rotate(-0.6deg);
  box-shadow: 12px 12px 0 0 var(--color-mint);
}

.new-flash {
  animation: flash 1.6s ease-in-out infinite;
}
@keyframes flash {
  0%, 100% { transform: rotate(-6deg) scale(1); }
  50%      { transform: rotate(-3deg) scale(1.12); }
}

/* ตัวละครในการ์ดข่าว: ยืนชิดขอบล่าง ขาถูกขอบภาพตัด → ดูเหมือนโผล่ขึ้นมา / hover แล้วเด้ง */
.news-char {
  position: absolute;
  bottom: -6%;
  left: 50%;
  translate: -50% 0;
  width: auto;
  max-width: none;
  transform-origin: 50% 100%;
  filter: drop-shadow(0 10px 14px rgb(0 0 0 / 0.3));
  transition: transform 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
  animation: char-idle 3s ease-in-out infinite alternate;
}
.news-char.is-big { height: 98%; bottom: -8%; }
.news-char.is-small { height: 100%; bottom: -10%; }
.group:hover .news-char {
  transform: translateY(-6%) rotate(-3deg) scale(1.04);
}
@keyframes char-idle {
  to { rotate: 1.5deg; }
}
.news-emoji {
  position: absolute;
  display: grid;
  place-items: center;
  border: 3px solid var(--color-night);
  border-radius: 50%;
  background: #fff;
  box-shadow: 3px 3px 0 var(--color-night);
  animation: emoji-bob 2.2s ease-in-out infinite alternate;
  transition: transform 0.4s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.news-emoji.is-big { right: 16%; top: 22%; width: 4.5rem; height: 4.5rem; font-size: 2.4rem; }
.news-emoji.is-small { right: 6%; top: auto; bottom: 8%; width: 2.6rem; height: 2.6rem; font-size: 1.3rem; }
.group:hover .news-emoji {
  transform: rotate(12deg) scale(1.15);
}
@keyframes emoji-bob {
  to { translate: 0 -8px; }
}
@media (prefers-reduced-motion: reduce) {
  .news-char, .news-emoji { animation: none; }
}

.news-dots {
  background-image: radial-gradient(var(--color-night) 1.5px, transparent 1.5px);
  background-size: 14px 14px;
}
</style>

