<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const storageKey = 'pheuan-rian:theme'
const dark = ref(document.documentElement.dataset.theme !== 'light')

watch(dark, (value) => {
  const theme = value ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value ? '#10121c' : '#f5f3ea')
  try { localStorage.setItem(storageKey, theme) } catch {}
}, { immediate: true })

function syncTheme(event) {
  if (event.key === storageKey || event.key === null) dark.value = event.newValue !== 'light'
}
onMounted(() => window.addEventListener('storage', syncTheme))
onBeforeUnmount(() => window.removeEventListener('storage', syncTheme))
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="t('nav.darkMode')" :aria-pressed="dark" :title="t(dark ? 'nav.lightMode' : 'nav.darkMode')" @click="dark = !dark">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <template v-if="dark">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </template>
      <path v-else d="M20.7 13.2A8.8 8.8 0 0 1 10.8 3.3a8.8 8.8 0 1 0 9.9 9.9Z" />
    </svg>
  </button>
</template>
