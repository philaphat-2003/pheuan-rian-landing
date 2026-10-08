// แปลงรูปมินิเกม Word Jam จากโฟลเดอร์รูป (Desktop/pheuan-rian-images/09-word-jam) → public/word-jam/*.webp
// ชิ้นที่ทำบนพื้นขาว: ลบพื้นขาว (flood fill จากขอบ) + crop ขอบ / พื้นหลังและภาพคำ: ย่อขนาดอย่างเดียว
// รัน: node scripts/word-jam-assets.mjs   (รันซ้ำได้ ไฟล์ไหนไม่มีก็ข้าม)
import sharp from 'sharp'
import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const SRC = join(homedir(), 'Desktop/pheuan-rian-images/09-word-jam')
const OUT = 'public/word-jam'
const WEB_READY = join(homedir(), 'Desktop/pheuan-rian-images/04-web-ready')
mkdirSync(OUT, { recursive: true })

const find = (name) => ['png', 'jpg', 'jpeg', 'webp'].map((e) => join(SRC, `${name}.${e}`)).find(existsSync)

// ลบพื้นขาว: พิกเซลขาว/เทาอ่อนไม่มีสีที่ต่อกับขอบภาพ → โปร่งใส, ขอบ anti-alias → โปร่งแสงบางส่วน
async function cutout(input, { paper = 225 } = {}) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const isPaper = (i) => {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]
    const lo = Math.min(r, g, b)
    return lo >= paper && Math.max(r, g, b) - lo <= 30
  }
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
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) {
      data[i * 4 + 3] = 0
      continue
    }
    // ขอบที่ติดพื้น: ยิ่งสว่างยิ่งโปร่ง แล้วถอดสีขาวที่ผสมอยู่ออก
    const x = i % w
    const near = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w])
    if (!near) continue
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]
    const a = Math.min(1, Math.max(0, (255 - Math.min(r, g, b)) / 90))
    data[i * 4 + 3] = Math.round(a * 255)
    if (a > 0 && a < 1) {
      data[i * 4] = Math.max(0, Math.round((r - 255 * (1 - a)) / a))
      data[i * 4 + 1] = Math.max(0, Math.round((g - 255 * (1 - a)) / a))
      data[i * 4 + 2] = Math.max(0, Math.round((b - 255 * (1 - a)) / a))
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer()
}

async function save(buf, name, width) {
  const out = join(OUT, `${name}.webp`)
  await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 100 }).toFile(out)
  copyFileSync(out, join(WEB_READY, `word-jam-${name}.webp`))
  const m = await sharp(out).metadata()
  console.log(`[word-jam] ${name}.webp ${m.width}x${m.height}`)
}

// พื้นหลังผนัง (ทึบ)
for (const name of ['bg-wall', 'bg-wall-mobile']) {
  const f = find(name)
  if (f) await save(await sharp(f).webp().toBuffer(), name, name.endsWith('mobile') ? 1080 : 1920)
}

// ชิ้นบนพื้นขาว
for (const [name, width] of [['title-word-jam', 900], ['tag-learn-english', 420], ['tag-better-english', 520], ['tag-small-steps', 520], ['xp-splat', 220]]) {
  const f = find(name)
  if (f) await save(await cutout(f), name, width)
}

// กระป๋อง 2 ใบในภาพเดียว → แบ่งครึ่งซ้าย/ขวา
{
  const f = find('spray-cans')
  if (f) {
    const m = await sharp(f).metadata()
    const half = Math.floor(m.width / 2)
    await save(await cutout(await sharp(f).extract({ left: 0, top: 0, width: half, height: m.height }).toBuffer()), 'spray-can-full', 120)
    await save(await cutout(await sharp(f).extract({ left: half, top: 0, width: m.width - half, height: m.height }).toBuffer()), 'spray-can-empty', 120)
  }
}

// รอยสเปรย์ 4 สี (ตาราง 2x2 มีเส้นแบ่งสีเทา) → ตัดแต่ละช่องโดยเว้นเส้นแบ่งออก
{
  const f = find('key-splats')
  if (f) {
    const m = await sharp(f).metadata()
    const cw = Math.floor(m.width / 2), ch = Math.floor(m.height / 2), pad = 14
    const names = ['key-ink', 'key-mint', 'key-teal', 'key-blue'] // ซ้ายบน, ขวาบน, ซ้ายล่าง, ขวาล่าง
    for (let k = 0; k < 4; k++) {
      const box = { left: (k % 2) * cw + pad, top: Math.floor(k / 2) * ch + pad, width: cw - pad * 2, height: ch - pad * 2 }
      await save(await cutout(await sharp(f).extract(box).toBuffer()), names[k], 160)
    }
  }
}

// ภาพคำบนผนัง (ทึบ) word-<คำ>.*
for (const file of readdirSync(SRC).filter((n) => /^word-[a-z]+\.(png|jpe?g|webp)$/i.test(n))) {
  const name = file.replace(/\.[^.]+$/, '').toLowerCase()
  await save(await sharp(join(SRC, file)).webp().toBuffer(), name, 760)
}
