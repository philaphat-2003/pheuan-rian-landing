import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  // prerender (vite-ssg build): bundle vue-i18n เข้าไปด้วย ให้ค่าใน define ด้านบนถูกแทนที่
  // (ถ้าปล่อยเป็น external ตอนเรนเดอร์ใน Node จะหา __VUE_PROD_DEVTOOLS__ ไม่เจอแล้วพัง)
  ssr: {
    noExternal: ['vue-i18n', /^@intlify\//],
  },
  ssgOptions: {
    formatting: 'none',
  },
})
