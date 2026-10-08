<script setup>
import { computed } from 'vue'

// ตัวหนังสือสไตล์กราฟฟิตี้ — ขนาดตาม font-size ของ parent (เส้นขอบ/เงาเป็น em)
const props = defineProps({
  text: { type: String, required: true },
  drips: { type: Boolean, default: true }, // false = ไม่มีน้ำสีไหลใต้ตัวอักษร
})

// ตัวที่มีหางห้อยลงล่าง / สระใต้ / สัญลักษณ์ — ไม่ใส่น้ำสีไหล เพราะจะไม่ติดขอบล่างของตัวอักษร
const NO_DRIP = /[\s\p{P}gjpqyJQฎฏฐญฤฦุู]/u

// แบ่งข้อความเป็นทีละตัวอักษร (รวมสระ/วรรณยุกต์ไทยไว้กับพยัญชนะ) แล้วเลือกประมาณ 3 ตัวที่กระจายกันให้มีน้ำสีไหล
const parts = computed(() => {
  const graphemes = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(props.text)].map((s) => ({ text: s.segment }))
  const eligible = graphemes.map((g, i) => (NO_DRIP.test(g.text) ? -1 : i)).filter((i) => i >= 0)
  // ข้อความสั้น (เช่นตัวเลข 01) ไม่ใส่น้ำสีไหล จะดูเหมือนหมุดปัก
  if (!props.drips || graphemes.length <= 3 || eligible.length < 3) return graphemes

  let h = 0
  for (const ch of props.text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  ;[0.18, 0.5, 0.82].forEach((at, i) => {
    const g = graphemes[eligible[Math.round(at * (eligible.length - 1))]]
    const n = (h >> (i * 5)) & 31
    g.drip = { '--len': `${0.24 + (n % 6) * 0.05}em`, animationDelay: `${0.3 + i * 0.25}s` }
  })
  return graphemes
})
</script>

<template>
  <!-- จุดยึด (graffiti-anchor) กว้าง 0 วางอยู่บนเส้นฐานของตัวอักษร น้ำสีจึงไหลออกจากขอบล่างของตัวนั้นพอดี -->
  <span class="graffiti" :data-text="text"><template v-for="(g, i) in parts" :key="i"><span v-if="g.drip" class="graffiti-anchor" aria-hidden="true"><span class="graffiti-drip" :style="g.drip" /></span>{{ g.text }}</template></span>
</template>
