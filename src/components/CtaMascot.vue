<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// หนุ่มออฟฟิศข้างปุ่มดาวน์โหลด — ภาพ 3 ท่าเรียงกันใน /mascot-office.webp (แต่ละเฟรม 579x819)
// mood: 'idle' = ชี้นิ้วมาที่คนดู, 'happy' = เลื่อนแว่นลงตาเป็นประกาย, 'sad' = เกาหัวเขิน ๆ
const props = defineProps({
  mood: { type: String, default: 'idle' },
})

const { t } = useI18n()
const FRAMES = { idle: 0, happy: 1, sad: 2 }
const frame = computed(() => FRAMES[props.mood] ?? 0)
</script>

<template>
  <div class="cta-buddy" :class="`is-${mood}`">
    <p class="buddy-say" role="status" aria-live="polite">
      <span :key="mood" class="say-text">{{ t(`cta.mascot.${mood}`) }}</span>
    </p>
    <div class="buddy-frame" aria-hidden="true">
      <!-- :key ทำให้เด้งใหม่ทุกครั้งที่เปลี่ยนท่า -->
      <div :key="mood" class="buddy-pose">
        <img src="/mascot-office.webp" alt="" width="1737" height="819" :style="{ transform: `translateX(-${frame * 100 / 3}%)` }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cta-buddy {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.buddy-say {
  position: relative;
  z-index: 2;
  margin-bottom: -6px;
  padding: 10px 16px;
  border-radius: 18px 18px 18px 6px;
  background: #fff;
  color: #11152e;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 14px 30px -12px rgb(0 0 0 / 0.45);
}
.say-text {
  display: inline-block;
  animation: say-in 0.3s ease-out both;
}
.buddy-frame {
  width: 100%;
  aspect-ratio: 579 / 819;
  overflow: hidden;
  /* เงาใส่ที่กรอบ (หลังตัดเฟรมแล้ว) — ถ้าใส่ที่รูป เงาของทั้งแผ่นจะโดนตัดเป็นกรอบสี่เหลี่ยม */
  filter: drop-shadow(0 18px 20px rgb(0 0 0 / 0.35));
}
.buddy-pose {
  width: 100%;
  height: 100%;
  transform-origin: 50% 90%;
  animation: pose-in 0.45s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.buddy-pose img {
  display: block;
  width: 300%;
  max-width: none;
  height: 100%;
}
/* ท่าปกติ: โยกตัวเบา ๆ */
.is-idle .buddy-frame {
  animation: buddy-sway 3.2s ease-in-out infinite;
}
.is-happy .buddy-pose {
  animation: pose-happy 0.55s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.is-sad .buddy-pose {
  animation: pose-sad 0.6s ease-out both;
}
@keyframes say-in {
  from { opacity: 0; transform: translateY(6px) scale(0.95); }
}
@keyframes pose-in {
  from { opacity: 0.4; transform: scale(0.94); }
}
@keyframes pose-happy {
  0% { transform: scale(0.95); }
  45% { transform: translateY(-14px) scale(1.04) rotate(-2deg); }
  100% { transform: none; }
}
@keyframes pose-sad {
  0% { transform: none; }
  40% { transform: translateY(8px) rotate(2deg) scale(0.97); }
  100% { transform: translateY(4px) rotate(1deg); }
}
@keyframes buddy-sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(1.5deg) translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) {
  .say-text, .buddy-pose, .buddy-frame { animation: none !important; }
}
</style>
