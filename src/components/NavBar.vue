<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import LangSwitch from './LangSwitch.vue'
import ThemeToggle from './ThemeToggle.vue'
const props = defineProps({ brand: { type: String, required: true }, links: { type: Array, required: true } })
const { t } = useI18n()
const menuOpen = ref(false)
const toggle = ref(null)
function closeMenu(event) {
  if (event.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
    toggle.value?.focus()
  }
}

// ไฮไลต์เมนูตาม section ที่กำลังดูอยู่ (เส้นอ้างอิง = 40% ของความสูงจอ)
// ไฮไลต์เฉพาะตอนอยู่ "ใน" section นั้นจริง ๆ — section ที่ไม่มีในเมนู (4 สเต็ป, หมวดบทเรียน ฯลฯ) จะไม่มีขีด
// จุดกระโดดแบบ span (เช่น #habit, #crew ในกองไพ่) ใช้ขอบล่างของ section ที่ครอบอยู่แทน
const current = ref('')
// เลื่อนพ้นด้านบน → เมนูหดเป็นสติกเกอร์ลอย
const floating = ref(false)
let raf = 0
function spy() {
  raf = 0
  floating.value = window.scrollY > 80
  const line = window.innerHeight * 0.4
  let found = ''
  for (const { href } of props.links) {
    const el = href.startsWith('#') && document.getElementById(href.slice(1))
    if (!el) continue
    const box = el.offsetHeight ? el : el.closest('section') ?? el
    if (el.getBoundingClientRect().top <= line && box.getBoundingClientRect().bottom > line) found = href
  }
  current.value = found
}
const onScroll = () => (raf ||= requestAnimationFrame(spy))

onMounted(() => {
  window.addEventListener('keydown', closeMenu)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  spy()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeMenu)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <header class="street-nav" :class="{ 'is-floating': floating }">
    <nav class="street-nav-inner" :aria-label="t('nav.menu')">
      <a href="#home" class="nav-brand" @click="menuOpen = false"><span class="brand-symbol" aria-hidden="true"><img src="/brand-mark.webp" alt="" width="176" height="176" /></span><span>{{ brand }}<small>{{ t('tagline') }}</small></span></a>
      <ul class="desktop-links">
        <li v-for="link in links.filter(item => item.href !== '#home')" :key="link.href">
          <a :href="link.href" :class="{ 'is-current': current === link.href }" :aria-current="current === link.href ? 'location' : undefined">
            {{ link.label }}
            <!-- ขีดสเปรย์แบบเดียวกับคำไฮไลต์ใน hero -->
            <svg class="nav-scribble" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path d="M5 15Q160 0 393 10M30 22Q190 10 365 17" /></svg>
          </a>
        </li>
      </ul>
      <div class="nav-actions">
        <ThemeToggle />
        <LangSwitch />
        <a href="#game" class="nav-start">{{ t('hero.try') }} <span aria-hidden="true">↗</span></a>
        <button ref="toggle" type="button" class="mobile-toggle" :aria-label="t('nav.menu')" :aria-expanded="menuOpen" aria-controls="mobile-navigation" @click="menuOpen = !menuOpen"><span class="burger" :class="{ 'is-open': menuOpen }" aria-hidden="true"><i /><i /><i /></span></button>
      </div>
    </nav>
    <!-- เมนูมือถือ: เลื่อนกางลงมาแบบนุ่ม ๆ (grid-rows 0fr → 1fr) ลิงก์ทยอยโผล่ทีละอัน -->
    <div class="mobile-menu" :class="{ 'is-open': menuOpen }" :inert="!menuOpen">
      <ul id="mobile-navigation" class="mobile-links">
        <li v-for="(link, i) in links" :key="link.href" :style="{ '--i': i }"><a :href="link.href" :class="{ 'is-current': current === link.href }" @click="menuOpen = false">{{ link.label }}</a></li>
      </ul>
    </div>
  </header>
</template>
