import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import th from './locales/th'
import en from './locales/en'

export const LOCALES = [
  { code: 'th', label: 'TH' },
  { code: 'en', label: 'EN' },
]

const STORAGE_KEY = 'pheuan-rian:locale'

function initialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LOCALES.some((l) => l.code === saved)) return saved
  } catch {}
  return 'th'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'th',
  messages: { th, en },
})

// sync <html lang>, <title> และจำภาษาที่เลือกไว้
watch(
  i18n.global.locale,
  (locale) => {
    document.documentElement.lang = locale
    document.title = i18n.global.t('meta.title')
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {}
  },
  { immediate: true },
)
