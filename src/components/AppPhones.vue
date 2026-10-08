<script setup>
// มือถือ 5 เครื่องที่แสดงหน้าจอจริงของแอป — theme = 'light' | 'dark'
// AppShowcase วางชุดนี้ซ้อนกันสองชั้น (สว่าง/มืด) แล้วตัดด้วยเส้นตรงกลาง
// ภาพมาจาก golden test ของแอป (pheuan-rian-App/apps/mobile/test/goldens) → public/app-screens/<ชื่อ>-<theme>.webp
// bar = สีแถบสถานะด้านบน ให้ต่อกับพื้นหลังของหน้าจอนั้น (shop เป็นฉากซอยกลางคืนทั้งสองโหมด)
import { useI18n } from 'vue-i18n'

const props = defineProps({
  theme: { type: String, default: 'light' },
})
const { t } = useI18n()

// คำอธิบายรูปอยู่ในไฟล์ภาษา (alt.screens.*) — ชั้นโหมดมืดซ้อนเป็นภาพซ้ำ (aria-hidden) จึงให้ alt ว่าง ไม่อ่านซ้ำสองรอบ
const altOf = (name) => (props.theme === 'light' ? t(`alt.screens.${name}`) : '')

const screens = [
  { name: 'streak' },
  { name: 'result' },
  { name: 'home', main: true },
  { name: 'league' },
  { name: 'shop', bar: { light: '#030b2f', dark: '#030b2f' } },
]
const BAR = { light: '#f5f3ea', dark: '#10121c' }
const barColor = (s, theme) => s.bar?.[theme] ?? BAR[theme]
const barText = (color) => (color === '#f5f3ea' ? '#11152e' : '#ffffff')
</script>

<template>
  <div class="phones">
    <div v-for="s in screens" :key="s.name" class="phone" :class="s.main ? 'is-main' : 'is-side'">
      <div class="screen">
        <span class="island" />
        <div class="status" :style="{ background: barColor(s, theme), color: barText(barColor(s, theme)) }">
          <span>9:41</span>
          <span class="status-icons"><i class="sig" /><i class="wifi" /><i class="batt" /></span>
        </div>
        <img :src="`/app-screens/${s.name}-${theme}.webp`" :alt="altOf(s.name)" width="540" height="1199" loading="lazy" decoding="async" />
        <span class="home-bar" :style="{ background: barText(barColor(s, theme)) }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- แถวมือถือ ---------- */
.phones {
  flex: none; /* ห้ามหดตามจอ ไม่งั้นแถวจะล้นออกขวาข้างเดียว เครื่องกลางไม่อยู่กลาง */
  display: flex;
  align-items: center;
  gap: 34px;
  width: max-content;
  padding: 30px 0 96px; /* เว้นที่ด้านล่างให้ปุ่มลากเส้น ไม่ทับเครื่องกลาง */
}
.phone {
  position: relative;
  flex: none;
  width: 290px;
  height: 666px; /* 10 + แถบสถานะ 46 + ภาพเต็มจอ 270×600 (สัดส่วน golden 824×1830) + 10 → เห็นแถบเมนูล่างครบ */
  padding: 10px;
  border-radius: 50px;
  background: #0a0a0d;
  box-shadow:
    inset 0 0 0 2px #2b2c35,
    0 0 0 2px #9a9ead,
    0 0 0 3px #3c3e48,
    0 40px 70px -28px rgb(8 10 40 / 0.55),
    0 18px 30px -18px rgb(8 10 40 / 0.4);
}
/* ปุ่มข้างเครื่อง */
.phone::before,
.phone::after {
  content: '';
  position: absolute;
  width: 3px;
  border-radius: 2px;
  background: #7e8290;
}
.phone::before {
  left: -5px;
  top: 120px;
  height: 56px;
  box-shadow: 0 -40px 0 -8px #7e8290;
}
.phone::after {
  right: -5px;
  top: 150px;
  height: 80px;
}
.is-side {
  zoom: 0.84;
}
.screen {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 40px;
  background: #000;
}
.screen img {
  display: block;
  flex: 1;
  min-height: 0;
  width: 100%;
  object-fit: cover;
  object-position: top;
}
.island {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 3;
  width: 92px;
  height: 27px;
  translate: -50% 0;
  border-radius: 99px;
  background: #000;
}
.status {
  display: flex;
  flex: none;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  padding: 6px 26px 0 30px;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.status-icons {
  display: flex;
  align-items: center;
  gap: 5px;
}
.status-icons i {
  display: block;
  background: currentColor;
}
.sig {
  width: 16px;
  height: 10px;
  clip-path: polygon(0 70%, 20% 70%, 20% 100%, 0 100%, 0 70%, 27% 50%, 47% 50%, 47% 100%, 27% 100%, 27% 50%, 54% 25%, 74% 25%, 74% 100%, 54% 100%, 54% 25%, 80% 0, 100% 0, 100% 100%, 80% 100%);
}
.wifi {
  width: 14px;
  height: 11px;
  clip-path: polygon(50% 100%, 0 30%, 15% 12%, 50% 0, 85% 12%, 100% 30%);
}
.batt {
  position: relative;
  width: 22px;
  height: 11px;
  border-radius: 3px;
  background: none !important;
  box-shadow: inset 0 0 0 1.5px currentColor;
}
.batt::after {
  content: '';
  position: absolute;
  inset: 2.5px 5px 2.5px 2.5px;
  border-radius: 1.5px;
  background: currentColor;
}
.home-bar {
  position: absolute;
  bottom: 7px;
  left: 50%;
  width: 110px;
  height: 4px;
  translate: -50% 0;
  border-radius: 99px;
  opacity: 0.6;
}
</style>
