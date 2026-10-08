<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const props = defineProps({ mood: { type: String, default: 'idle' }, tick: { type: Number, default: 0 }, image: { type: String, default: '' } })
const { t } = useI18n()
const blinkReady = ref(false)
const frame = computed(() => ({ idle: 0, hit: 1, win: 1, miss: 2, lose: 2 }[props.mood] ?? 0))
</script>

<template>
  <aside class="app-ui game-buddy" :class="`mood-${mood}`">
    <!-- ข้อความของเพื่อน AI หน้าตาเหมือนบับเบิลแชทในแอป -->
    <div class="buddy-speech">
      <span class="buddy-name" aria-hidden="true"><i class="buddy-avatar">พ</i>{{ t('showcase.chat.name') }}</span>
      <p role="status" aria-live="polite" aria-atomic="true"><span :key="`speech-${tick}`" class="buddy-message">{{ t(`game.mascot.${mood}`) }}</span></p>
    </div>
    <div class="buddy-stage" aria-hidden="true">
      <span class="buddy-halo" />
      <div :key="tick" class="buddy-reaction" :class="`react-${mood}`">
        <div class="buddy-portrait">
          <img v-if="!image" src="/mascot-blink.png" alt="" width="1536" height="1024" class="buddy-sheet buddy-blink" :class="{ 'is-ready': blinkReady }" :style="{ transform: `translateX(-${frame * 100 / 3}%)` }" @load="blinkReady = true" />
          <img v-if="image" :src="image" alt="" class="custom-mascot" />
          <img v-else src="/mascot-reactions.png" alt="" width="1536" height="1024" decoding="async" class="buddy-sheet" :style="{ transform: `translateX(-${frame * 100 / 3}%)` }" />
        </div>
        <span v-if="mood !== 'idle'" class="buddy-badge" :class="`badge-${mood}`">{{ { hit: 'NICE!', miss: 'OOPS!', win: 'LEVEL UP!', lose: 'TRY AGAIN' }[mood] }}</span>
        <span v-if="mood === 'hit' || mood === 'win'" class="buddy-burst">
          <i v-for="n in (mood === 'win' ? 12 : 5)" :key="n" :style="{ '--i': n, '--angle': `${n * 137.5}deg`, '--distance': `${70 + n % 4 * 18}px` }" />
        </span>
        <span v-if="mood === 'miss'" class="buddy-surprise">?!</span>
      </div>
      <span class="buddy-platform" />
    </div>
    <span class="buddy-label"><i />{{ t('showcase.chat.status') }}</span>
  </aside>
</template>

<style scoped>
.game-buddy { --buddy-accent: var(--ui-mint); width: 260px; max-width: 100%; display: flex; flex-direction: column; align-items: center; }
.mood-miss, .mood-lose { --buddy-accent: var(--ui-warn); }
/* บับเบิลแชทแบบในแอป: การ์ดขาว มุมล่างซ้ายแหลม เงานุ่ม */
.buddy-speech { position: relative; z-index: 3; width: 100%; min-height: 86px; padding: 12px 14px 14px; border-radius: 20px 20px 20px 6px; background: var(--ui-surface); box-shadow: var(--ui-shadow); }
.buddy-name { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--ui-text-2); }
.buddy-avatar { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #15d8b3, #2f39a9); color: #fff; font-size: 11px; font-style: normal; }
.buddy-speech p { margin-top: 6px; font-size: 15px; font-weight: 500; }
.buddy-message { display: inline-block; animation: message-in .25s ease-out both; }
.buddy-stage { position: relative; width: 100%; margin-top: 18px; isolation: isolate; }
.buddy-halo { display: none; }
.buddy-reaction { position: relative; transform-origin: 50% 90%; }
.buddy-portrait { position: relative; width: 100%; aspect-ratio: 2 / 3; overflow: hidden; border-radius: 32px; background: linear-gradient(160deg, #2f39a9 0%, #1b2170 55%, #0f7f73 100%); box-shadow: var(--ui-shadow); }
.buddy-sheet { position: absolute; top: -17%; left: 0; width: 300%; max-width: none; height: auto; }
.custom-mascot { width: 100%; height: 100%; object-fit: contain; }
.buddy-platform { display: none; }
.buddy-label { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; padding: 6px 12px; border-radius: 99px; background: var(--ui-surface); box-shadow: var(--ui-shadow-sm); font-size: 12px; font-weight: 600; color: var(--ui-mint); }
.buddy-label i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 25%, transparent); }
/* ป้ายผลลัพธ์แบบ toast ในแอป */
.buddy-badge { position: absolute; z-index: 2; left: 50%; bottom: 16px; translate: -50% 0; padding: 8px 16px; border-radius: 99px; background: var(--buddy-accent); color: #0b0e1d; font-size: 14px; font-weight: 700; white-space: nowrap; box-shadow: 0 10px 22px -8px rgb(0 0 0 / .45); animation: badge-in .4s ease-out both; }
.badge-win { background: var(--ui-accent); color: var(--ui-on-accent); }
.buddy-surprise { position: absolute; right: 14px; top: 12px; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--ui-warn); color: #0b0e1d; font-size: 18px; font-weight: 700; box-shadow: 0 8px 18px -6px rgb(0 0 0 / .4); animation: badge-in .35s ease-out both; }
.buddy-burst { position: absolute; inset: 0; pointer-events: none; }
.buddy-burst i { position: absolute; left: 50%; top: 28%; width: 8px; height: 13px; border-radius: 2px; background: var(--color-mint); animation: buddy-confetti 1.1s cubic-bezier(.12,.7,.25,1) both; animation-delay: calc(var(--i) * 25ms); }
.buddy-burst i:nth-child(3n) { background: #b5a2ff; }
.buddy-burst i:nth-child(3n + 1) { background: #f2dfa5; border-radius: 50%; }
.buddy-portrait { animation: buddy-breathe 4.8s ease-in-out infinite; }
.react-hit { animation: buddy-cheer .65s cubic-bezier(.2,.8,.3,1) both; }
.react-win { animation: buddy-celebrate 1.1s ease-in-out both; }
.react-miss { animation: buddy-flinch .5s ease-out both; }
.react-lose { animation: buddy-comfort .9s ease-in-out both; }
@keyframes buddy-breathe { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px) rotate(.5deg); } }
@keyframes buddy-cheer { 0%,100% { transform: translateY(0) rotate(0); } 20% { transform: scale(1.025,.97); } 50% { transform: translateY(-18px) rotate(-4deg); } 80% { transform: translateY(2px) scale(1.02,.98); } }
@keyframes buddy-celebrate { 0%,100% { transform: translateY(0); } 25% { transform: translateY(-24px) rotate(-6deg); } 50% { transform: translateY(0) rotate(3deg); } 75% { transform: translateY(-14px) rotate(-3deg); } }
@keyframes buddy-flinch { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px) rotate(-3deg); } 45% { transform: translateX(7px) rotate(2deg); } 70% { transform: translateX(-3px); } }
@keyframes buddy-comfort { 0% { transform: translateY(0); } 45% { transform: translateY(10px) rotate(3deg) scale(.97); } 100% { transform: translateY(3px) rotate(1deg); } }
@keyframes buddy-confetti { 0% { opacity: 0; transform: rotate(var(--angle)) translateY(0) scale(.2); } 15% { opacity: 1; } 100% { opacity: 0; transform: rotate(var(--angle)) translateY(calc(-1 * var(--distance))) rotate(130deg); } }
@keyframes message-in { from { opacity: .4; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes badge-in { from { opacity: 0; scale: .65; } to { opacity: 1; scale: 1; } }
@media (max-width: 1023px) { .game-buddy { width: 230px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } .buddy-burst { display: none; } }
/* Overlay only the eyes so the generated blink cannot shift the body. */
/* แถบตา = y 372–465 px ของภาพ 1536x1024 (ภาพถูกขยาย 300% และเลื่อนขึ้น 17%) — เปลี่ยนภาพมาสคอตแล้วต้องวัดใหม่ */
.buddy-blink { z-index: 1; opacity: 0; clip-path: inset(31.4% 0 56.5% 0); pointer-events: none; }
.buddy-blink.is-ready { animation: natural-blink 6.2s linear infinite; }
@keyframes natural-blink {
  0%, 39%, 43%, 76%, 80%, 100% { opacity: 0; }
  40%, 42%, 77%, 79% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .buddy-blink { display: none; } }
</style>

