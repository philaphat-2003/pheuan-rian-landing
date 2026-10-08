<script setup>
import { useI18n } from 'vue-i18n'
import { LOCALES } from '../i18n'

const { locale, t } = useI18n()
</script>

<template>
  <div role="group" :aria-label="t('nav.language')" class="flex rounded-full border-2 border-mint/40 p-0.5 text-xs font-bold">
    <button
      v-for="l in LOCALES"
      :key="l.code"
      type="button"
      class="rounded-full px-2.5 py-1 transition"
      :class="locale === l.code ? 'bg-mint text-night' : 'text-white/70 hover:text-white'"
      :aria-pressed="locale === l.code"
      @click="locale = l.code"
    >
      {{ l.label }}
    </button>
  </div>
</template>
