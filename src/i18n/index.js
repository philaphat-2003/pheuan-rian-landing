import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import th from './locales/th'
import en from './locales/en'

export const LOCALES = [
  { code: 'th', label: 'TH' },
  { code: 'en', label: 'EN' },
]

const STORAGE_KEY = 'pheuan-rian:locale'
const inBrowser = typeof window !== 'undefined'

// ภาษาที่ผู้ใช้เคยเลือก — อ่านไว้ก่อน watch ด้านล่างจะเขียนทับด้วยค่าเริ่มต้น
let saved = null
if (inBrowser) {
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch {}
}

// เริ่มเป็นไทยเสมอ ให้ตรงกับ HTML ที่ prerender ไว้ (hydration จะได้ไม่เพี้ยน)
// แล้วค่อยเปลี่ยนเป็นภาษาที่บันทึกไว้หลัง hydrate เสร็จ (applySavedLocale ใน main.js)
export const i18n = createI18n({
  legacy: false,
  locale: 'th',
  fallbackLocale: 'th',
  messages: { th, en },
})

export function applySavedLocale() {
  if (LOCALES.some((l) => l.code === saved) && saved !== i18n.global.locale.value) i18n.global.locale.value = saved
}

// sync <html lang>, <title> และจำภาษาที่เลือกไว้ (เฉพาะในเบราว์เซอร์)
if (inBrowser) {
  let first = true
  watch(
    i18n.global.locale,
    (locale) => {
      document.documentElement.lang = locale
      document.title = i18n.global.t('meta.title')
      // รอบแรก (ค่าเริ่มต้น 'th') ไม่บันทึก ไม่งั้นจะทับภาษาที่ผู้ใช้เลือกไว้ก่อน applySavedLocale
      if (first) {
        first = false
        return
      }
      try {
        localStorage.setItem(STORAGE_KEY, locale)
      } catch {}
    },
    { immediate: true },
  )
}
