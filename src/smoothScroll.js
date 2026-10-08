// เลื่อนหน้าแบบลื่นทั้งเว็บ (Lenis): ล้อเมาส์ทีละขั้นจะถูกไล่ให้ไหลต่อเนื่อง
// → ทุกแอนิเมชันที่ผูกกับ scroll (ไพ่, ไทม์ไลน์, การ์ดกาง, เมนูไฮไลต์) ขยับลื่นตามไปด้วย
// ยังใช้ scroll จริงของเบราว์เซอร์ข้างใต้ (sticky / IntersectionObserver / scrollY ทำงานเหมือนเดิม)
// บนจอสัมผัสใช้การเลื่อนธรรมชาติของเครื่อง / ถ้าตั้งค่าลดการเคลื่อนไหว จะไม่เปิดใช้เลย
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// ระยะเผื่อเมนูด้านบนมาจาก CSS อยู่แล้ว (html scroll-padding-top + scroll-mt ของแต่ละ section) Lenis อ่านค่านั้นเอง
const NAV_OFFSET = 0

export let lenis = null

export function initSmoothScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({
    lerp: 0.1, // ยิ่งน้อยยิ่งนุ่ม (แต่ตามช้าลง)
    wheelMultiplier: 1,
    anchors: { offset: NAV_OFFSET }, // ลิงก์ #section ในเมนูเลื่อนไปแบบลื่น
  })
  const raf = (time) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}

// เลื่อนไป #id จากโค้ด (เช่นปุ่มในการ์ด) — มี Lenis ใช้ Lenis, ไม่มีก็ใช้ของเบราว์เซอร์
export function scrollToHash(hash) {
  const el = document.querySelector(hash)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: NAV_OFFSET })
  else el.scrollIntoView({ behavior: 'smooth' })
  history.replaceState(null, '', hash)
}
