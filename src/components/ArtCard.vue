<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  variant: { type: String, default: 'chat' }, // 'chat' | 'streak' | 'crew'
})

const { t, locale } = useI18n()

const stickers = { chat: 'LVL UP!', streak: 'ON FIRE', crew: 'SQUAD', lang: 'PICK ONE', level: 'LVL CHECK' }

const languages = [
  { code: 'EN', name: 'English', color: 'bg-mint', picked: true },
  { code: 'JP', name: '日本語', color: 'bg-white' },
  { code: 'KR', name: '한국어', color: 'bg-teal' },
  { code: 'ES', name: 'Español', color: 'bg-steel' },
]
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// ตัวเลขอยู่ที่นี่ ข้อความ (ชื่อวัน/ชื่อเพื่อน) มาจากไฟล์ภาษาตาม index
const weekValues = [40, 65, 30, 80, 55, 100, 70]
const week = computed(() => weekValues.map((value, i) => ({ value, day: t(`art.streak.week.${i}`) })))

const crewStats = [
  { xp: 2480, color: 'bg-mint' },
  { xp: 2310, color: 'bg-white', me: true },
  { xp: 1920, color: 'bg-teal' },
  { xp: 1540, color: 'bg-steel' },
]
const crew = computed(() => crewStats.map((m, i) => ({ ...m, name: t(`art.crew.names.${i}`) })))
const maxXp = crewStats[0].xp
</script>

<template>
  <div class="relative mx-auto w-full max-w-md">
    <span class="absolute -top-3 left-1/2 z-10 h-7 w-28 -translate-x-1/2 -rotate-3 bg-mint/80" aria-hidden="true" />

    <div class="relative rotate-[1.5deg] rounded-[1.75rem] border-4 border-night bg-ink p-6 text-white shadow-[12px_12px_0_0_var(--color-night)]">
      <!-- chat -->
      <template v-if="variant === 'chat'">
        <div class="flex items-center gap-3 border-b border-white/15 pb-4">
          <span class="grid size-11 place-items-center rounded-full border-2 border-night bg-mint text-lg font-black text-night">พ</span>
          <div>
            <p class="font-bold">{{ t('brand') }}</p>
            <p class="flex items-center gap-1.5 text-xs text-mint">
              <span class="size-2 rounded-full bg-mint" /> {{ t('art.chat.online') }}
            </p>
          </div>
        </div>
        <div class="mt-5 space-y-3 text-[15px]">
          <p class="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-night">{{ t('art.chat.bot1') }}</p>
          <p class="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-mint px-4 py-2.5 font-medium text-night">{{ t('art.chat.user') }}</p>
          <p class="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-night">
            {{ t('art.chat.bot2') }} <b>{{ t('art.chat.phrase') }}</b> ☕
          </p>
        </div>
        <div class="mt-5 flex items-center gap-3 rounded-full bg-night/40 p-1.5 pl-4">
          <span class="flex-1 text-sm text-white/50">{{ t('art.chat.hold') }}</span>
          <span class="grid size-10 place-items-center rounded-full bg-mint text-night">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </span>
        </div>
      </template>

      <!-- streak -->
      <template v-else-if="variant === 'streak'">
        <p class="text-sm text-white/60">{{ t('art.streak.label') }}</p>
        <p class="mt-1 flex items-end gap-2">
          <span class="text-6xl font-black leading-none">🔥 21</span>
          <span class="pb-1 text-lg text-mint">{{ t('art.streak.days') }}</span>
        </p>
        <div class="mt-6 flex items-end gap-2.5">
          <div v-for="(d, i) in week" :key="i" class="flex flex-1 flex-col items-center gap-2">
            <div
              class="w-full rounded-t-lg border-2 border-night"
              :class="d.value === 100 ? 'bg-mint' : 'bg-teal'"
              :style="{ height: `${d.value * 1.2}px` }"
            />
            <span class="text-xs text-white/70">{{ d.day }}</span>
          </div>
        </div>
        <div class="mt-5 flex gap-2">
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs">{{ t('art.streak.badge1') }}</span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs">{{ t('art.streak.badge2') }}</span>
        </div>
      </template>

      <!-- lang -->
      <template v-else-if="variant === 'lang'">
        <p class="text-lg font-bold">{{ t('art.lang.question') }}</p>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <div
            v-for="l in languages"
            :key="l.code"
            class="relative flex items-center gap-3 rounded-2xl p-3"
            :class="l.picked ? 'bg-white/15 ring-2 ring-mint' : 'bg-night/30'"
          >
            <span class="grid size-10 place-items-center rounded-full border-2 border-night font-black text-night" :class="l.color">
              {{ l.code }}
            </span>
            <span class="font-medium">{{ l.name }}</span>
            <span v-if="l.picked" class="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border-2 border-night bg-mint text-night">
              <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
          </div>
        </div>
        <div class="mt-6 rounded-full border-2 border-night bg-mint py-2.5 text-center font-bold text-night">{{ t('art.lang.next') }} →</div>
      </template>

      <!-- level -->
      <template v-else-if="variant === 'level'">
        <p class="text-sm text-white/60">{{ t('art.level.label') }}</p>
        <div class="mt-2 flex items-center gap-4">
          <span class="text-7xl leading-none"><span class="graffiti">B1</span></span>
          <div>
            <p class="text-xl font-bold">{{ t('art.level.name') }}</p>
            <p class="text-sm text-mint">{{ t('art.level.note') }}</p>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-6 gap-2">
          <div v-for="(lv, i) in levels" :key="lv" class="text-center">
            <div class="h-3 rounded-full border-2 border-night" :class="i < 3 ? 'bg-mint' : i === 3 ? 'bg-mint/30' : 'bg-night/40'" />
            <span class="mt-1.5 block text-xs" :class="lv === 'B1' ? 'font-black text-mint' : 'text-white/60'">{{ lv }}</span>
          </div>
        </div>
        <div class="mt-5 flex gap-2">
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs">🎤 Speaking 74%</span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs">🎧 Listening 81%</span>
        </div>
      </template>

      <!-- crew -->
      <template v-else-if="variant === 'crew'">
        <div class="flex items-center justify-between">
          <p class="font-bold">{{ t('art.crew.league') }}</p>
          <span class="rounded-full bg-mint px-3 py-1 text-xs font-bold text-night">{{ t('art.crew.daysLeft', { n: 2 }) }}</span>
        </div>
        <ul class="mt-5 space-y-3">
          <li
            v-for="(m, i) in crew"
            :key="i"
            class="flex items-center gap-3 rounded-2xl p-2"
            :class="m.me && 'bg-white/10 ring-2 ring-mint'"
          >
            <span class="w-5 text-center font-black text-white/60">{{ i + 1 }}</span>
            <span class="grid size-9 place-items-center rounded-full border-2 border-night font-bold text-night" :class="m.color">
              {{ m.name[0] }}
            </span>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ m.name }}</p>
              <div class="mt-1 h-2 rounded-full bg-night/40">
                <div class="h-full rounded-full bg-mint" :style="{ width: `${(m.xp / maxXp) * 100}%` }" />
              </div>
            </div>
            <span class="text-sm font-bold tabular-nums">{{ m.xp.toLocaleString(locale) }}</span>
          </li>
        </ul>
      </template>
    </div>

    <span
      class="absolute -right-3 -bottom-6 rotate-[-8deg] rounded-xl border-4 border-night bg-mint px-4 py-1.5 font-tag text-xl text-night shadow-[4px_4px_0_0_var(--color-night)]"
    >
      {{ stickers[variant] }}
    </span>
  </div>
</template>
