<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// แมวดำเดินเล่นไปตามแถบ: เดินไปสักพัก → นั่งเลียขน → เดินต่อ (ชนขอบก็หันกลับ) วนไปเรื่อย ๆ
// วาดเป็น SVG เพื่อขยับขา หัว หาง แยกกันได้ — สีเดียวกับแมวของสาวอีโม (ดำ ตามิ้นต์ ขอบสติกเกอร์ขาว)
const CAT_W = 112 // ความกว้างแมวบนจอ (px)
const SPEED = 55 // px ต่อวินาที

const track = ref(null)
const x = ref(0)
const dir = ref(1) // 1 = เดินไปขวา, -1 = ซ้าย
const mode = ref('walk') // 'walk' | 'sit'

let raf = 0
let last = 0
let stopAt = 0
let sitUntil = 0
let visible = false

const maxX = () => Math.max(0, track.value.clientWidth - CAT_W)
const pickStop = () => (stopAt = x.value + dir.value * (160 + Math.random() * 260))

function tick(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
  last = now
  if (mode.value === 'sit') {
    if (now >= sitUntil) {
      mode.value = 'walk'
      if (Math.random() < 0.35) dir.value *= -1 // บางทีก็หันไปทางเดิม
      pickStop()
    }
  } else {
    const max = maxX()
    x.value += dir.value * SPEED * dt
    if (x.value <= 0 || x.value >= max) {
      x.value = Math.min(max, Math.max(0, x.value))
      dir.value *= -1
      pickStop()
    } else if (dir.value > 0 ? x.value >= stopAt : x.value <= stopAt) {
      mode.value = 'sit'
      sitUntil = now + 3200 + Math.random() * 2000
    }
  }
  raf = visible ? requestAnimationFrame(tick) : 0
}

let observer
onMounted(() => {
  x.value = Math.random() * maxX()
  pickStop()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mode.value = 'sit'
    return
  }
  // เดินเฉพาะตอนที่อยู่บนจอ ประหยัดแรงเครื่อง
  observer = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !raf) {
      last = 0
      raf = requestAnimationFrame(tick)
    }
  })
  observer.observe(track.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="track" class="cat-track" aria-hidden="true">
    <div class="cat" :class="`is-${mode}`" :style="{ transform: `translateX(${x}px)` }">
      <svg viewBox="0 0 120 80" :style="{ transform: `scaleX(${dir})` }">

        <!-- ท่าเดิน (หันขวา) -->
        <g class="pose-walk">
          <g class="tail">
            <path d="M28 44C12 42 6 26 13 12" class="stroke-outline" />
            <path d="M28 44C12 42 6 26 13 12" class="stroke-fill" />
          </g>
          <g class="leg leg-b"><rect x="40" y="48" width="8" height="26" rx="4" class="fur-far" /></g>
          <g class="leg leg-a"><rect x="80" y="48" width="8" height="26" rx="4" class="fur-far" /></g>
          <g class="walk-body">
            <ellipse cx="56" cy="46" rx="32" ry="14" class="fur" />
            <path d="M79 26 81 11 91 20Z" class="fur" />
            <path d="M92 19 102 10 103 26Z" class="fur" />
            <path d="M82.5 21 83.5 15 87.5 19Z" class="mint" />
            <path d="M95 18.5 99.5 14 100 22Z" class="mint" />
            <circle cx="90" cy="32" r="14" class="fur" />
            <ellipse cx="96" cy="31" rx="3.6" ry="4.3" class="mint" />
            <ellipse cx="96.8" cy="31.3" rx="1.2" ry="3.3" class="pupil" />
            <circle cx="95" cy="29.4" r=".9" fill="#fff" />
            <path d="M103.4 35.2 101 36.6 103.2 37.6Z" class="nose" />
            <path d="M100 38.5 111 36.5M100 40.5 110 42" class="whisker" />
          </g>
          <g class="leg leg-a"><rect x="31" y="48" width="8" height="26" rx="4" class="fur" /></g>
          <g class="leg leg-b"><rect x="70" y="48" width="8" height="26" rx="4" class="fur" /></g>
        </g>

        <!-- ท่านั่งเลียอุ้งเท้า (หันขวา) -->
        <g class="pose-sit">
          <g class="sit-tail">
            <path d="M42 72C22 75 14 63 25 55" class="stroke-outline" />
            <path d="M42 72C22 75 14 63 25 55" class="stroke-fill" />
          </g>
          <ellipse cx="50" cy="57" rx="20" ry="17" class="fur" />
          <ellipse cx="57" cy="72.5" rx="11" ry="4.5" class="fur" />
          <ellipse cx="65" cy="50" rx="12" ry="21" class="fur" />
          <rect x="64" y="52" width="8" height="23" rx="4" class="fur" />
          <g class="lick">
            <path d="M65 21 66 6 76 15Z" class="fur" />
            <path d="M77 14 87 5 88 21Z" class="fur" />
            <path d="M67.5 16 68.5 10 72.5 14Z" class="mint" />
            <path d="M80 13.5 84.5 9 85 17Z" class="mint" />
            <circle cx="76" cy="27" r="13" class="fur" />
            <path d="M79.5 25.5q3 2.6 6.2 0" class="closed-eye" />
            <path d="M88.6 30.4 86.4 31.6 88.4 32.6Z" class="nose" />
            <ellipse cx="87" cy="35" rx="2.6" ry="1.7" class="tongue" />
            <g class="paw"><rect x="74" y="36" width="8" height="20" rx="4" transform="rotate(25 78 54)" class="fur" /></g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.cat-track {
  position: relative;
  height: 74px;
  pointer-events: none;
}
.cat {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 112px;
  will-change: transform;
}
.cat svg {
  display: block;
  width: 100%;
  overflow: visible;
  /* ขอบสติกเกอร์ขาว + เงา — มองเห็นได้ทั้งพื้นสว่างและพื้นมืด */
  filter: drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff) drop-shadow(0 4px 4px rgb(0 0 0 / 0.2));
}
/* เงาใต้เท้า — อยู่นอก SVG จะได้ไม่โดนขอบสติกเกอร์ขาว */
.cat::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: -2px;
  z-index: -1;
  height: 6px;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.22);
  filter: blur(2px);
}
.fur { fill: #1a1c2a; stroke: #0b0f3a; stroke-width: 2.5; stroke-linejoin: round; }
.fur-far { fill: #11121c; stroke: #0b0f3a; stroke-width: 2.5; }
.mint { fill: #15d8b3; }
.pupil { fill: #0b0f3a; }
.nose { fill: #ff7aa8; }
.tongue { fill: #ff7aa8; }
.whisker, .closed-eye { fill: none; stroke: #15d8b3; stroke-width: 1.6; stroke-linecap: round; }
.closed-eye { stroke-width: 2; }
.stroke-outline, .stroke-fill { fill: none; stroke-linecap: round; }
.stroke-outline { stroke: #0b0f3a; stroke-width: 10; }
.stroke-fill { stroke: #1a1c2a; stroke-width: 5.5; }

/* สลับท่า */
.pose-sit { display: none; }
.is-sit .pose-walk { display: none; }
.is-sit .pose-sit { display: inline; }

/* ---------- เดิน: ขาแกว่งสลับเป็นคู่ทแยง ตัวยกขึ้นลง หางแกว่ง ---------- */
.leg, .tail, .lick, .paw, .sit-tail, .walk-body {
  transform-box: fill-box;
}
.leg { transform-origin: 50% 0; animation: leg 0.5s ease-in-out infinite alternate; }
.leg-b { animation-delay: -0.5s; }
.walk-body { animation: bob 0.25s ease-in-out infinite alternate; }
.tail { transform-origin: 100% 100%; animation: tail-sway 1.2s ease-in-out infinite alternate; }
@keyframes leg { from { transform: rotate(-22deg); } to { transform: rotate(22deg); } }
@keyframes bob { to { transform: translateY(-1.5px); } }
@keyframes tail-sway { from { transform: rotate(-8deg); } to { transform: rotate(10deg); } }

/* ---------- นั่ง: ก้มหัวเลียอุ้งเท้า ลิ้นโผล่เป็นจังหวะ หางตวัดช้า ๆ ---------- */
.lick { transform-origin: 30% 100%; animation: lick 0.45s ease-in-out infinite alternate; }
.tongue { animation: tongue 0.9s steps(1) infinite; }
.sit-tail { transform-origin: 100% 0; animation: tail-flick 2.4s ease-in-out infinite; }
@keyframes lick { from { transform: rotate(-4deg); } to { transform: rotate(9deg) translateY(1.5px); } }
@keyframes tongue { 0% { opacity: 1; } 50% { opacity: 0; } }
@keyframes tail-flick { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg); } }

@media (prefers-reduced-motion: reduce) {
  .leg, .walk-body, .tail, .lick, .tongue, .sit-tail { animation: none; }
  .tongue { opacity: 0; }
}
</style>
