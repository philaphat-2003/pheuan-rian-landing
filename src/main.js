import { createApp } from 'vue'
import App from './App.vue'
import reveal from './directives/reveal'
import { i18n } from './i18n'
import { initSmoothScroll } from './smoothScroll'
import { initPauseOffscreen } from './pauseOffscreen'
import './style.css'

// รีเฟรชหน้าเมื่อไหร่ก็เริ่มที่ hero เสมอ:
// ปิดการจำตำแหน่ง scroll ของเบราว์เซอร์ + ลบ #section ออกจาก URL (ไม่งั้นจะกระโดดไปที่ section นั้น)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (location.hash) history.replaceState(null, '', location.pathname + location.search)
window.scrollTo({ top: 0, behavior: 'instant' })

createApp(App).use(i18n).directive('reveal', reveal).mount('#app')
initSmoothScroll()
initPauseOffscreen()
