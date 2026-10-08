// หยุดแอนิเมชันที่วนตลอด (แมวเดิน, ตัวละครโยก, แถบวิ่ง, ดาววิบวับ ฯลฯ) ของ section ที่ไม่ได้อยู่บนจอ
// → เครื่องเหลือแรงให้ section ที่กำลังดู เลื่อนหน้าลื่นขึ้น  (คู่กับ .is-offscreen ใน style.css)
export function initPauseOffscreen() {
  const targets = document.querySelectorAll('main > section, main > div, footer')
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting)
    },
    { rootMargin: '200px 0px' }, // เผื่อขอบ: เริ่มเล่นก่อนโผล่เข้าจอนิดหนึ่ง
  )
  targets.forEach((el) => observer.observe(el))
}
