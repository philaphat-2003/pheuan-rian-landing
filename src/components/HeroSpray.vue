<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ผืนผ้าใบสำหรับละอองสี 3 มิติหลังโลโก้ — โหลด Three.js ทีหลัง (ไม่ถ่วงหน้าแรก)
// เรนเดอร์เฉพาะตอน hero อยู่บนจอและแท็บเปิดอยู่ / ไม่มี WebGL ก็แค่ไม่แสดง
const canvas = ref(null)
const ready = ref(false)
let scene
let observer
let resizeObserver
let visible = false

const sync = () => (visible && !document.hidden ? scene?.start() : scene?.stop())

onMounted(async () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const small = matchMedia('(max-width: 700px)').matches
  try {
    const { createHeroSpray } = await import('../three/heroSpray.js')
    if (!canvas.value) return
    scene = createHeroSpray(canvas.value, { count: small ? 380 : 750, reduced })
  } catch {
    return // เบราว์เซอร์ไม่รองรับ WebGL → ไม่มีละออง หน้าเว็บยังปกติ
  }
  ready.value = true
  observer = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    sync()
  })
  observer.observe(canvas.value)
  resizeObserver = new ResizeObserver(() => scene.resize())
  resizeObserver.observe(canvas.value)
  document.addEventListener('visibilitychange', sync)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', sync)
  scene?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="hero-spray" :class="{ 'is-ready': ready }" aria-hidden="true" />
</template>

<style scoped>
.hero-spray {
  position: absolute;
  inset: -12% -10%;
  z-index: -1;
  width: 120%;
  height: 124%;
  pointer-events: none;
  /* ขอบผืนผ้าใบค่อย ๆ จาง ไม่ให้เห็นละอองถูกตัดเป็นเส้นตรง */
  -webkit-mask-image: radial-gradient(closest-side, #000 62%, transparent);
  mask-image: radial-gradient(closest-side, #000 62%, transparent);
  opacity: 0;
  transition: opacity 0.6s;
}
.hero-spray.is-ready {
  opacity: 1;
}
</style>
