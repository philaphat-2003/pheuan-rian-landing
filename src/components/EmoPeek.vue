<script setup>
// สาวอีโมโผล่ขึ้นมาจากหลังการ์ด "ฟีดแบ็กการออกเสียง" + บับเบิลเสียงพูด
// ภาพ 3 ท่าใน /mascot-emo.webp (เฟรมละ 564x781): 0 = โบกมือ, 1 = ดีใจ (ตาเป็นประกาย), 2 = แบมือ
// /mascot-emo-blink.webp = ภาพเดียวกันแต่หลับตา ใช้ซ้อนเฉพาะแถบตาเพื่อกะพริบ
defineProps({
  popped: { type: Boolean, default: false }, // true = โผล่ขึ้นมาแล้ว
  happy: { type: Boolean, default: false }, // true = เมาส์อยู่บนการ์ด
})
</script>

<template>
  <div class="emo-peek" :class="{ 'is-popped': popped, 'is-happy': happy }" aria-hidden="true">
    <!-- บับเบิลเสียง: ไมค์ + แท่งเสียงเต้น -->
    <span class="voice-bubble">
      <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
      <i v-for="n in 5" :key="n" :style="{ animationDelay: `${n * -0.13}s` }" />
    </span>

    <!-- หน้าต่างที่ตัดตัวละครตรงขอบการ์ด → ดูเหมือนโผล่ออกมาจากด้านหลังการ์ด -->
    <div class="peek-window">
      <div class="emo">
        <img src="/mascot-emo.webp" alt="" width="1692" height="781" :style="{ transform: `translateX(-${happy ? 100 / 3 : 0}%)` }" />
        <img v-if="!happy" src="/mascot-emo-blink.webp" alt="" width="1692" height="781" class="emo-blink" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.emo-peek {
  position: absolute;
  right: 6px;
  bottom: calc(100% + 4px); /* ขอบนอกของการ์ด (border 4px) */
  width: 150px;
  pointer-events: none;
}
.peek-window {
  height: 128px;
  overflow: hidden;
}
.emo {
  position: relative;
  width: 100%;
  aspect-ratio: 564 / 781;
  overflow: hidden;
  transform: translateY(105%);
  transition: transform 0.35s ease-in;
}
.is-popped .emo {
  transform: translateY(0);
  transition: transform 0.65s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.emo img {
  position: absolute;
  inset: 0 auto auto 0;
  width: 300%;
  max-width: none;
  height: 100%;
}
/* ภาพหลับตา: โชว์เฉพาะแถบตาของเฟรมแรก (y 31–44%, x 9–22% ของทั้งแผ่น) */
.emo-blink {
  opacity: 0;
  clip-path: inset(31% 78% 56% 8.5%);
  animation: emo-blink 5.4s linear infinite 1.2s;
}
@keyframes emo-blink {
  0%, 44%, 47%, 100% { opacity: 0; }
  45%, 46% { opacity: 1; }
}
/* ดีใจ: เด้งตัวขึ้นนิด ๆ */
.is-popped.is-happy .emo {
  animation: emo-cheer 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
@keyframes emo-cheer {
  40% { transform: translateY(-6%); }
}

.voice-bubble {
  position: absolute;
  z-index: 2;
  right: calc(100% - 18px);
  top: 18px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 7px 11px 7px 9px;
  border: 3px solid var(--color-night);
  border-radius: 16px 16px 4px 16px;
  background: #fff;
  box-shadow: 3px 3px 0 var(--color-night);
  opacity: 0;
  scale: 0.4;
  transform-origin: 100% 100%;
  transition: opacity 0.2s, scale 0.2s;
}
.is-popped .voice-bubble {
  opacity: 1;
  scale: 1;
  transition: opacity 0.3s 0.45s, scale 0.45s 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.voice-bubble svg {
  width: 16px;
  height: 16px;
  margin-right: 3px;
  fill: none;
  stroke: var(--color-ink);
  stroke-width: 2.2;
  stroke-linecap: round;
}
.voice-bubble i {
  width: 3.5px;
  height: 16px;
  border-radius: 2px;
  background: var(--color-mint);
  transform-origin: center;
  animation: voice-bar 0.7s ease-in-out infinite alternate;
}
.is-happy .voice-bubble i {
  animation-duration: 0.35s;
}
@keyframes voice-bar {
  from { transform: scaleY(0.25); }
  to { transform: scaleY(1); }
}

@media (max-width: 767px) {
  .emo-peek { width: 112px; }
  .peek-window { height: 96px; }
  .voice-bubble { top: 10px; padding: 5px 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .emo, .voice-bubble { transition: none !important; }
  .emo-blink, .voice-bubble i, .emo { animation: none !important; }
}
</style>
