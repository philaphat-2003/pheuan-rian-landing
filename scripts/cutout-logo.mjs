// ลบพื้นขาวของโลโก้ → public/*.webp (พื้นโปร่งใส + crop ขอบ)
// วางไฟล์ต้นฉบับไว้ที่ assets/ แล้วรัน `npm run logo`
//   assets/hero-logo.png    → public/hero-logo.webp     (ภาษาไทย)
//   assets/hero-logo-en.png → public/hero-logo-en.webp  (ภาษาอังกฤษ)
// (รันอัตโนมัติก่อน npm run dev / build ด้วย และจะข้ามไฟล์ที่ผลลัพธ์ใหม่กว่าอยู่แล้ว)
import sharp from 'sharp'
import { existsSync, statSync } from 'node:fs'

const JOBS = [
  { name: 'hero-logo', out: 'public/hero-logo.webp' },
  { name: 'hero-logo-en', out: 'public/hero-logo-en.webp' },
]
const force = process.argv.includes('--force')

for (const { name, out } of JOBS) {
  const src = ['png', 'jpg', 'jpeg', 'webp'].map((ext) => `assets/${name}.${ext}`).find(existsSync)
  if (!src) {
    console.log(`[logo] ไม่พบ assets/${name}.png — ข้าม`)
    continue
  }
  if (existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs && !force) continue
  await cutout(src, out)
  console.log(`[logo] ${src} → ${out}`)
}

async function cutout(src, out) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]

  // พิกเซล "พื้นหลัง" = ขาว/เทาอ่อนเกือบไม่มีสี
  const isPaper = (i) => {
    const [r, g, b] = px(i)
    const lo = Math.min(r, g, b)
    return lo >= 225 && Math.max(r, g, b) - lo <= 30
  }

  // flood fill จากขอบภาพ — ไฮไลต์สีขาวที่อยู่ในตัวอักษร (มีเส้นดำล้อม) จะไม่โดนลบ
  const bg = new Uint8Array(w * h)
  const stack = []
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
  while (stack.length) {
    const i = stack.pop()
    if (bg[i] || !isPaper(i)) continue
    bg[i] = 1
    const x = i % w
    if (x > 0) stack.push(i - 1)
    if (x < w - 1) stack.push(i + 1)
    if (i >= w) stack.push(i - w)
    if (i < w * (h - 1)) stack.push(i + w)
  }

  // ขอบ anti-alias / ละอองสเปรย์ที่ติดพื้นขาว: ทำโปร่งแสงตามความสว่าง แล้วถอดสีขาวที่ผสมอยู่ออก
  const nearBg = (i) => {
    const x = i % w
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx
        const j = i + dy * w + dx
        if (nx >= 0 && nx < w && j >= 0 && j < w * h && bg[j]) return true
      }
    return false
  }

  for (let i = 0; i < w * h; i++) {
    if (bg[i]) {
      data[i * 4 + 3] = 0
      continue
    }
    if (!nearBg(i)) continue
    const [r, g, b] = px(i)
    const a = Math.min(1, Math.max(0, (255 - Math.min(r, g, b)) / 110))
    if (a >= 1) continue
    data[i * 4 + 3] = Math.round(a * 255)
    if (a > 0) {
      data[i * 4] = Math.max(0, Math.round((r - 255 * (1 - a)) / a))
      data[i * 4 + 1] = Math.max(0, Math.round((g - 255 * (1 - a)) / a))
      data[i * 4 + 2] = Math.max(0, Math.round((b - 255 * (1 - a)) / a))
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out)
}
