// v-reveal — ใช้ซ้ำได้ทุกที่
//   v-reveal="'left'"                   → เลื่อนเข้ามาจากซ้าย
//   v-reveal="{ from: 'right', delay: 150 }"
// from: 'left' | 'right' | 'up' (ค่าเริ่มต้น)
let observer

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  )
  return observer
}

export default {
  // prerender: ใส่ class ไว้ใน HTML ตั้งแต่แรก — ไม่งั้นเนื้อหาจะโผล่แว้บนึงแล้วหายไปตอน JS โหลด (ก่อนเลื่อนเข้ามา)
  getSSRProps({ value }) {
    const opts = typeof value === 'string' ? { from: value } : value ?? {}
    return {
      class: `reveal reveal-${opts.from ?? 'up'}`,
      // บอก Vue ว่า class/style ที่ต่างจาก template ฝั่ง client เป็นเรื่องตั้งใจ (ไม่ต้องเตือน hydration mismatch)
      'data-allow-mismatch': 'class,style',
      style: opts.delay ? { transitionDelay: `${opts.delay}ms` } : undefined,
    }
  },
  mounted(el, { value }) {
    const opts = typeof value === 'string' ? { from: value } : value ?? {}
    el.classList.add('reveal', `reveal-${opts.from ?? 'up'}`)
    if (opts.delay) el.style.transitionDelay = `${opts.delay}ms`
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
