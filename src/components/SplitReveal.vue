<script setup>
import ArtCard from './ArtCard.vue'
import SprayDecor from './SprayDecor.vue'

// section ข้อความ + ภาพ: ข้อความเข้าจากซ้าย ภาพเข้าจากขวา (reverse = สลับฝั่ง)
defineProps({
  id: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  points: { type: Array, default: () => [] },
  art: { type: String, default: 'chat' },
  image: { type: String, default: '' }, // ใส่รูปจริงแทนภาพประกอบได้
  reverse: { type: Boolean, default: false },
})
</script>

<template>
  <section :id="id" class="relative isolate scroll-mt-16 overflow-x-clip py-24 md:py-32">
    <SprayDecor :preset="id" />
    <div class="mx-auto grid max-w-6xl items-center gap-16 px-4 md:grid-cols-2">
      <div v-reveal="reverse ? 'right' : 'left'" :class="reverse && 'md:order-2'">
        <p v-if="eyebrow" class="inline-block font-hand text-2xl text-eyebrow">
          {{ eyebrow }}
          <span class="spray-line" />
        </p>
        <h2 class="mt-4 text-4xl leading-[1.3] font-black whitespace-pre-line text-heading md:text-6xl">{{ title }}</h2>
        <p v-if="body" class="mt-6 max-w-lg text-lg leading-relaxed text-muted">{{ body }}</p>
        <ul v-if="points.length" class="mt-6 space-y-3">
          <li v-for="p in points" :key="p" class="flex items-start gap-3 text-muted">
            <span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-night bg-mint text-night">
              <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            {{ p }}
          </li>
        </ul>
      </div>

      <div v-reveal="{ from: reverse ? 'left' : 'right', delay: 150 }">
        <img
          v-if="image"
          :src="image"
          alt=""
          class="w-full rotate-[1.5deg] rounded-[1.75rem] border-4 border-night shadow-[12px_12px_0_0_var(--color-night)]"
        />
        <ArtCard v-else :variant="art" />
      </div>
    </div>
  </section>
</template>

