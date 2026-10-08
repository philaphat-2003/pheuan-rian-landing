<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import MarqueeStrip from './components/MarqueeStrip.vue'
import CardStack from './components/CardStack.vue'
import AboutFan from './components/AboutFan.vue'
import StorySection from './components/StorySection.vue'
import CardDeck from './components/CardDeck.vue'
import WaveDivider from './components/WaveDivider.vue'
import CtaSection from './components/CtaSection.vue'
import HangmanSection from './components/HangmanSection.vue'
import AppShowcase from './components/AppShowcase.vue'
import NewsSection from './components/NewsSection.vue'
import TestimonialSection from './components/TestimonialSection.vue'
import SiteFooter from './components/SiteFooter.vue'

const { t, tm } = useI18n()

// อ่าน array จากไฟล์ภาษา เช่น list('tickers') → ['SPEAK UP', ...]
const list = (key) => tm(key).map((_, i) => t(`${key}.${i}`))
// อ่าน array ของ object เช่น items('story.steps', ['title', 'body'])
const items = (key, fields) =>
  tm(key).map((_, i) => Object.fromEntries(fields.map((f) => [f, t(`${key}.${i}.${f}`)])))

const links = computed(() =>
  ['home', 'about', 'habit', 'crew', 'game', 'news'].map((id) => ({ href: `#${id}`, label: t(`nav.${id}`) })),
)

// เพิ่ม section ใหม่: เพิ่ม { id, art } ตรงนี้ + ข้อความใน sections.<id> ของไฟล์ภาษา
const sectionDefs = [
  { id: 'about', art: 'chat' },
  { id: 'habit', art: 'streak' },
  { id: 'crew', art: 'crew' },
]

const sections = computed(() =>
  sectionDefs.map(({ id, art }) => ({
    id,
    art,
    eyebrow: t(`sections.${id}.eyebrow`),
    title: t(`sections.${id}.title`),
    body: t(`sections.${id}.body`),
    points: list(`sections.${id}.points`),
  })),
)

// ภาพของแต่ละสเต็ป (เรียงตาม story.steps) — ใส่ image: '/xxx.png' เพื่อใช้รูปจริงแทนการ์ดภาพประกอบ
const storyVisuals = [{ art: 'lang' }, { art: 'level' }, { art: 'chat' }, { art: 'streak' }]
const storySteps = computed(() =>
  items('story.steps', ['title', 'body']).map((s, i) => ({ ...s, ...storyVisuals[i] })),
)

// รูปของแต่ละการ์ด (เรียงตาม deck.cards) — ใส่ image: '/xxx.png' แทน emoji ได้
// anim = ท่าขยับของตัวละคร: walk เดิน, sway โยก+ไอกาแฟ, slurp ซดเส้น, lean มั่นใจ, chill ฟังเพลง, nervous ลุ้นสอบ
const deckVisuals = [
  { emoji: '✈️', image: '/pack-travel.webp', anim: 'walk' },
  { emoji: '💼', image: '/pack-work.webp', anim: 'sway' },
  { emoji: '🍜', image: '/pack-food.webp', anim: 'slurp' },
  { emoji: '🎤', image: '/pack-job.webp', anim: 'lean' },
  { emoji: '🛹', image: '/pack-chill.webp', anim: 'chill' },
  { emoji: '📝', image: '/pack-exam.webp', anim: 'nervous' },
  // หมวดเกม: ตอนนี้มีแค่ Hangman → ปุ่มพาไปที่มินิเกม (#game)
  { emoji: '🎮', image: '/news-game.webp', anim: 'cheer', href: '#game', ctaKey: 'deck.cards.6.cta' },
]
const deckCards = computed(() =>
  items('deck.cards', ['tag', 'title', 'body']).map((c, i) => {
    const v = deckVisuals[i] ?? {}
    return { ...c, ...v, cta: v.ctaKey ? t(v.ctaKey) : '' }
  }),
)

// รูปของแต่ละข่าว (เรียงตาม news.items) — ใส่ image: '/xxx.png' แทน emoji ได้
// char = ตัวละครที่โผล่ในการ์ด (emoji จะกลายเป็นป้ายเล็กลอยข้าง ๆ)
const newsVisuals = [
  { emoji: '🎮', char: '/news-game.webp' },
  { emoji: '🗣️', char: '/news-lang.webp' },
  { emoji: '🏆', char: '/news-league.webp' },
]
const newsItems = computed(() =>
  items('news.items', ['tag', 'date', 'version', 'title', 'body']).map((n, i) => ({ ...n, ...newsVisuals[i] })),
)

const CONTACT_EMAIL = 'philaphatkaewthane@gmail.com'

const footerColumns = computed(() => [
  {
    heading: t('footer.product'),
    links: [
      { label: t('footer.links.features'), href: '#story' },
      { label: t('footer.links.packs'), href: '#deck' },
      { label: t('footer.links.game'), href: '#game' },
    ],
  },
  {
    heading: t('footer.company'),
    links: [
      { label: t('footer.links.about'), href: '#about' },
      { label: t('footer.links.news'), href: '#news' },
      { label: t('footer.links.contact'), href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
])
</script>

<template>
  <!-- ฟิลเตอร์ขอบสเปรย์ ใช้ผ่าน filter: url(#spray-rough) -->
  <svg class="spray-defs" width="0" height="0" aria-hidden="true" focusable="false">
    <filter id="spray-rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>

  <NavBar :brand="t('brand')" :links="links" />

  <main>
    <HeroSection :title="t('brand')" :tagline="t('hero.tagline')" :logo="t('logo')" />
    <MarqueeStrip :items="list('tickers')" />

    <!-- about = การ์ด 3 ใบกางออกตอนเลื่อน -->
    <AboutFan v-bind="sections[0]" />

    <!-- กองไพ่: แนะนำตัว → วันละนิด → แก๊งเพื่อน → ชวนเล่นเกม (เลื่อนเพื่อสับไพ่) -->
    <!-- คลื่นทับขอบ section ให้ภาพผนังโผล่ถึงเส้นโค้ง (แบบเดียวกับมินิเกม) -->
    <WaveDivider bg="var(--color-wall)" fill="transparent" overlap="next" />
    <CardStack :habit="sections[1]" :crew="sections[2]" />
    <WaveDivider bg="transparent" fill="var(--color-paper)" drip-color="#0b0f3a" overlap="prev" flip />

    <StorySection id="story" :eyebrow="t('story.eyebrow')" :title="t('story.title')" :steps="storySteps" />

    <WaveDivider bg="var(--color-paper)" fill="transparent" overlap="next" flip />
    <CardDeck
      id="deck"
      :eyebrow="t('deck.eyebrow')"
      :title="t('deck.title')"
      :cta="t('deck.cta')"
      :cards="deckCards"
    />

    <WaveDivider bg="transparent" fill="var(--color-wall)" drip-color="#0b0f3a" overlap="prev" />
    <AppShowcase id="app" />
    <!-- คลื่นรอบมินิเกม: ทับขอบ section ให้ภาพผนังกราฟฟิตี้โผล่ถึงเส้นคลื่น -->
    <WaveDivider bg="var(--color-wall)" fill="transparent" overlap="next" flip />
    <HangmanSection id="game" />
    <WaveDivider bg="transparent" fill="var(--color-wall)" drip-color="#0b0f3a" overlap="prev" flip />

    <TestimonialSection />

    <NewsSection id="news" :eyebrow="t('news.eyebrow')" :title="t('news.title')" :more="t('news.more')" :items="newsItems" />

    <WaveDivider bg="var(--color-wall)" fill="var(--color-ink)" />
    <CtaSection :title="t('cta.title')" :body="t('cta.body')" />
  </main>

  <SiteFooter :logo="t('logo')" :email="CONTACT_EMAIL" :columns="footerColumns" />
</template>


