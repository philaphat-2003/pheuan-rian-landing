<script setup>
import { ref, onBeforeUnmount } from 'vue'
import GraffitiText from './GraffitiText.vue'
import StickerButton from './StickerButton.vue'
import SprayDecor from './SprayDecor.vue'
import CtaMascot from './CtaMascot.vue'

defineProps({
  title: { type: String, required: true },
  body: { type: String, default: '' },
})

// เมาส์/คีย์บอร์ดอยู่ที่ปุ่มดาวน์โหลด → ดีใจ, ออกจากปุ่ม → เสียใจสักพัก แล้วกลับเป็นท่าปกติ
const mood = ref('idle')
let timer
function onEnter() {
  clearTimeout(timer)
  mood.value = 'happy'
}
function onLeave() {
  if (mood.value !== 'happy') return
  mood.value = 'sad'
  clearTimeout(timer)
  timer = setTimeout(() => (mood.value = 'idle'), 1800)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section id="cta" class="relative isolate overflow-hidden bg-ink pt-12 pb-20 text-white md:pb-24">
    <SprayDecor preset="cta" />
    <div class="mx-auto grid max-w-5xl items-center gap-6 px-4 md:grid-cols-[1fr_300px] md:gap-10">
      <div class="text-center md:order-1 md:text-left">
        <h2 v-reveal="'up'" class="text-[clamp(2.75rem,8vw,5.5rem)]">
          <GraffitiText :text="title" :drips="false" />
        </h2>
        <p v-if="body" v-reveal="{ from: 'up', delay: 120 }" class="mx-auto mt-6 max-w-xl text-lg text-white/80 md:mx-0">{{ body }}</p>
        <div
          v-reveal="{ from: 'up', delay: 240 }"
          class="mt-10 flex flex-wrap justify-center gap-4 md:justify-start"
          @pointerover="onEnter"
          @pointerout="(e) => !e.currentTarget.contains(e.relatedTarget) && onLeave()"
          @focusin="onEnter"
          @focusout="onLeave"
        >
          <StickerButton href="#">
            <svg class="size-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3-.8-1.55.02-2.98.9-3.78 2.28-1.61 2.8-.41 6.94 1.16 9.2.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.8.75 3.02.72c1.25-.02 2.04-1.13 2.8-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.43-.93-2.45-3.69zM14.07 5.85c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.38-.59.68-1.1 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.28z" />
            </svg>
            App Store
          </StickerButton>
          <StickerButton href="#" variant="white">
            <svg class="size-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.6 2.2c-.3.3-.4.7-.4 1.2v17.2c0 .5.1.9.4 1.2l9.6-9.8L3.6 2.2zm10.5 8.9 2.7-2.7L5.2 1.8c-.3-.2-.7-.3-1-.2l9.9 9.5zm0 1.8-9.9 9.5c.3.1.7 0 1-.2l11.6-6.6-2.7-2.7zm6.4-2.2-2.6-1.5-3 3 3 3 2.6-1.5c.9-.5.9-2.5 0-3z" />
            </svg>
            Google Play
          </StickerButton>
        </div>
      </div>

      <div v-reveal="{ from: 'right', delay: 200 }" class="mx-auto w-52.5 md:order-2 md:w-full">
        <CtaMascot :mood="mood" />
      </div>
    </div>
  </section>
</template>

