<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
})

// วนสองรอบเพื่อให้ translateX(-50%) ต่อกันแบบไร้รอยต่อ
const loop = computed(() => [...props.items, ...props.items])

// น้ำสีมิ้นต์ไหลลงจากแถบ
const drips = [
  { left: '14%', h: '26px', delay: '0.2s' },
  { left: '37%', h: '14px', delay: '0.5s' },
  { left: '61%', h: '34px', delay: '0.35s' },
  { left: '83%', h: '18px', delay: '0.7s' },
]
</script>

<template>
  <!-- wrapper ตัดส่วนที่ล้นจากการเอียง ไม่ให้หน้าเว็บเลื่อนแนวนอน -->
  <div class="pointer-events-none relative z-10 -mt-6 -mb-12 overflow-hidden pt-6 pb-12">
    <div class="relative mx-[-5%] -rotate-2">
    <div class="overflow-hidden border-y-4 border-night bg-mint py-3">
      <div class="marquee flex w-max">
        <span
          v-for="(item, i) in loop"
          :key="i"
          class="flex items-center gap-6 px-3 font-tag text-2xl whitespace-nowrap text-night md:text-3xl"
        >
          {{ item }}
          <span class="text-ink">✦</span>
        </span>
      </div>
    </div>
    <span v-for="d in drips" :key="d.left" class="marquee-drip" :style="{ left: d.left, height: d.h, animationDelay: d.delay }" aria-hidden="true" />
    </div>
  </div>
</template>
