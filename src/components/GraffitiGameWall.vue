<script setup>
import { useI18n } from 'vue-i18n'
defineProps({ remaining: Number, max: Number, progress: Number, streak: Number, mood: String, tick: Number })
const { t } = useI18n()
</script>

<template>
  <!-- การ์ดผลงาน: ทายถูกแล้วโลโก้ค่อย ๆ ถูกพ่นสีจากซ้ายไปขวา — หน้าตาแบบการ์ดในแอป -->
  <div class="app-ui wall-card" :class="`wall-${mood}`">
    <div class="wc-head">
      <span class="wc-icon" aria-hidden="true">🎨</span>
      <div>
        <b>{{ t('game.title') }}</b>
        <small>{{ t('game.wallLabel') }}</small>
      </div>
    </div>

    <div class="wc-canvas" aria-hidden="true">
      <img :src="t('logo')" alt="" class="wall-guide" />
      <img :src="t('logo')" alt="" class="wall-painted" :style="{ clipPath: `inset(0 ${100 - progress}% 0 0)` }" />
      <span v-if="mood === 'hit' || mood === 'win'" :key="tick" class="paint-cloud" :style="{ left: `${Math.min(progress, 85)}%` }" />
      <span v-if="mood === 'win' || mood === 'lose'" :key="mood" class="wall-result">{{ mood === 'win' ? '🎉 FRESH TAG!' : '↺ TRY AGAIN' }}</span>
    </div>

    <div class="wc-row">
      <small>{{ t('game.paintProgress') }}</small>
      <b>{{ progress }}%</b>
    </div>
    <div class="wc-bar" role="progressbar" :aria-label="t('game.paintProgress')" :aria-valuenow="progress" :aria-valuemin="0" :aria-valuemax="100"><span :style="{ width: `${progress}%` }" /></div>

    <div class="wc-stats">
      <div class="stat">
        <small>{{ t('game.sprayLeft') }}</small>
        <b :aria-label="t('game.sprayCount', { n: remaining, max })">{{ remaining }}<span>/{{ max }}</span></b>
      </div>
      <div class="stat">
        <small>{{ t('game.streak') }}</small>
        <b>🔥 {{ streak }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wall-card {
  width: 290px;
  max-width: 100%;
  padding: 18px;
  border-radius: 28px;
  background: var(--ui-surface);
  box-shadow: var(--ui-shadow);
}
.wc-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.wc-head b {
  display: block;
  font-size: 16px;
  font-weight: 600;
}
.wc-head small {
  display: block;
  font-size: 12px;
  color: var(--ui-text-2);
}
.wc-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: linear-gradient(135deg, #15d8b3, #2f39a9);
  font-size: 20px;
}
.wc-canvas {
  position: relative;
  aspect-ratio: 4 / 3;
  margin-top: 16px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(70% 60% at 50% 50%, rgb(47 57 169 / 0.12), transparent 70%),
    var(--ui-surface-2);
}
.wc-canvas img {
  position: absolute;
  inset: 8%;
  width: 84%;
  height: 84%;
  object-fit: contain;
}
.wall-guide {
  filter: grayscale(1);
  opacity: 0.16;
}
.wall-painted {
  transition: clip-path 0.7s cubic-bezier(0.16, 0.8, 0.3, 1);
}
.paint-cloud {
  position: absolute;
  top: 20%;
  width: 60px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(ellipse, #15d8b3aa, transparent 70%);
  animation: spray-reveal 0.7s ease-out both;
  pointer-events: none;
}
.wall-result {
  position: absolute;
  bottom: 12px;
  left: 50%;
  translate: -50% 0;
  padding: 7px 14px;
  border-radius: 99px;
  background: var(--ui-mint);
  color: #0b0e1d;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 8px 20px -6px rgb(0 0 0 / 0.35);
  animation: result-pop 0.35s ease-out;
}
.wall-lose .wall-result {
  background: var(--ui-warn);
}
.wc-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 16px;
  font-size: 13px;
}
.wc-row small {
  color: var(--ui-text-2);
}
.wc-bar {
  height: 8px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 99px;
  background: var(--ui-surface-2);
}
.wc-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--ui-mint), var(--ui-accent));
  transition: width 0.7s ease;
}
.wc-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
}
.stat {
  padding: 10px 12px;
  border-radius: 16px;
  background: var(--ui-surface-2);
}
.stat small {
  display: block;
  font-size: 11px;
  color: var(--ui-text-2);
}
.stat b {
  font-size: 18px;
  font-weight: 700;
}
.stat b span {
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-text-2);
}
@keyframes spray-reveal { from { opacity: 1; transform: scale(.5); } to { opacity: 0; transform: scale(2); } }
@keyframes result-pop { from { opacity: 0; scale: 1.2; } to { opacity: 1; scale: 1; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } .paint-cloud { display: none; } }
</style>
