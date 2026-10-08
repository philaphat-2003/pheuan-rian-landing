<script setup>
defineProps({
  href: { type: String, default: '#' },
  variant: { type: String, default: 'mint' }, // 'mint' | 'white'
})
</script>

<template>
  <a
    :href="href"
    class="spray-btn inline-flex items-center gap-2 rounded-2xl border-4 border-night px-6 py-3 text-lg font-bold text-night shadow-[6px_6px_0_0_var(--color-night)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--color-night)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_0_var(--color-night)]"
    :class="variant === 'white' ? 'bg-white' : 'bg-mint'"
  >
    <slot />
  </a>
</template>
