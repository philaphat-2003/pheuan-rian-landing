import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'
import reveal from './directives/reveal'
import { i18n, applySavedLocale } from './i18n'
import { initSmoothScroll } from './smoothScroll'
import { initPauseOffscreen } from './pauseOffscreen'
import './style.css'

// Prerender (vite-ssg): ตอน build จะเรนเดอร์หน้าเป็น HTML ครบทั้งหน้า (ภาษาไทย)
// → บอท / ตัวพรีวิวลิงก์ / Google เห็นเนื้อหาตั้งแต่ไบต์แรก แล้ว Vue ค่อยมารับช่วงในเบราว์เซอร์ (hydration)
// โค้ดที่ใช้ window/document ต้องอยู่ใน isClient หรือ onMounted เท่านั้น (ตอน build ไม่มีเบราว์เซอร์)
export const createApp = ViteSSG(
  App,
  ({ app, isClient }) => {
    app.use(i18n).directive('reveal', reveal)
    if (!isClient) return

    // รีเฟรชหน้าเมื่อไหร่ก็เริ่มที่ hero เสมอ:
    // ปิดการจำตำแหน่ง scroll ของเบราว์เซอร์ + ลบ #section ออกจาก URL (ไม่งั้นจะกระโดดไปที่ section นั้น)
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
    window.scrollTo({ top: 0, behavior: 'instant' })

    // หลัง hydrate เสร็จ (vite-ssg mount ต่อจากฟังก์ชันนี้ทันที)
    setTimeout(() => {
      applySavedLocale() // HTML ที่ prerender เป็นไทย → เปลี่ยนเป็นภาษาที่ผู้ใช้เคยเลือกไว้
      initSmoothScroll()
      initPauseOffscreen()
    })
  },
  { hydration: true },
)
