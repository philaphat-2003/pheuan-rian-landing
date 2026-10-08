<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GraffitiText from './GraffitiText.vue'
import SprayDecor from './SprayDecor.vue'

const props = defineProps({
  logo: { type: String, default: '' },
  email: { type: String, required: true },
  columns: { type: Array, required: true }, // [{ heading, links: [{ label, href }] }]
})

const { t } = useI18n()

// hover แล้วขึ้นวงกลมสีของแต่ละแอป — แก้ href เป็นลิงก์จริงได้เลย
const socials = computed(() => [
  { name: 'Facebook', href: '#', color: '#1877F2' },
  { name: 'Instagram', href: '#', color: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' },
  { name: 'Twitter', href: '#', color: '#1DA1F2' },
  { name: 'LinkedIn', href: '#', color: '#0A66C2' },
  { name: 'Email', href: `mailto:${props.email}?subject=${encodeURIComponent(t('brand'))}`, color: '#EA4335' },
])
</script>

<template>
  <!-- พื้นหลังผนังอิฐกราฟฟิตี้ชุดเดียวกับมินิเกม/กองไพ่ -->
  <footer class="footer-wall relative isolate text-white">
    <SprayDecor preset="footer" />
    <div class="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 px-4 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
      <div class="col-span-2 md:col-span-1">
        <a href="#home" class="inline-block">
          <img v-if="logo" :src="logo" :alt="t('brand')" class="w-48 transition duration-300 hover:scale-105 hover:-rotate-2" />
          <span v-else class="text-4xl"><GraffitiText :text="t('brand')" /></span>
        </a>
        <p class="mt-3 font-hand text-lg text-mint">{{ t('footer.tagline') }}</p>

        <ul class="mt-6 flex items-center gap-2">
          <li v-for="s in socials" :key="s.name">
            <a
              :href="s.href"
              :aria-label="s.name"
              :title="s.name === 'Email' ? email : s.name"
              class="social group relative grid size-12 place-items-center rounded-full text-white/70 transition-colors duration-300 hover:text-white focus-visible:text-white"
              :target="s.name === 'Email' ? undefined : '_blank'"
              :rel="s.name === 'Email' ? undefined : 'noopener'"
            >
              <span class="social-bg absolute inset-0 rounded-full border-2 border-night" :style="{ background: s.color }" />
              <svg class="relative size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <template v-if="s.name === 'Facebook'">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </template>
                <template v-else-if="s.name === 'Instagram'">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <path d="M17.5 6.5h.01" />
                </template>
                <template v-else-if="s.name === 'Twitter'">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </template>
                <template v-else-if="s.name === 'LinkedIn'">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </template>
                <template v-else>
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </template>
              </svg>
            </a>
          </li>
        </ul>
      </div>

      <nav v-for="col in columns" :key="col.heading">
        <p class="font-tag text-lg tracking-wide text-mint">{{ col.heading }}</p>
        <ul class="mt-4 space-y-3">
          <li v-for="link in col.links" :key="link.label">
            <a :href="link.href" class="footer-link relative text-white/75 transition hover:text-white">{{ link.label }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-white/50">
        <p>{{ t('footer.rights') }}</p>
        <p class="font-tag tracking-wider text-mint">SPEAK · LEARN · FLEX</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-wall {
  /* ด้านบนมืดลงนิดหน่อย ให้ลิงก์อ่านง่าย ส่วนมุมยังเห็นสีฟุ้งของภาพ */
  background:
    linear-gradient(180deg, rgb(11 15 58 / 0.35), transparent 60%),
    url('/word-jam/bg-wall.webp') center / cover no-repeat,
    var(--color-night);
}

/* วงกลมสีแอปขยายออกจากกลางตอน hover */
.social-bg {
  transform: scale(0);
  transition: transform 0.35s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.social:hover .social-bg,
.social:focus-visible .social-bg {
  transform: scale(1);
}
.social svg {
  transition: transform 0.35s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.social:hover svg {
  transform: scale(1.1) rotate(-8deg);
}

/* ขีดเส้นใต้แบบสเปรย์ */
.footer-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-mint);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.footer-link:hover::after {
  transform: scaleX(1);
}
</style>
