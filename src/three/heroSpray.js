// ละอองสีสเปรย์ 3 มิติด้านหลังโลโก้ใน hero (Three.js)
// เปิดหน้า: ละอองพ่นเข้ามาจาก 2 มุม → มารวมเป็นกลุ่มควันวงรีรอบโลโก้ → ลอยช้า ๆ + เอียงตามเมาส์
// โหลดผ่าน dynamic import เท่านั้น (HeroSpray.vue) จะได้ไม่ถ่วงการโหลดหน้าแรก
import { WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, Points, ShaderMaterial, NormalBlending, Group, Color } from 'three'

const PALETTE = ['#15d8b3', '#15d8b3', '#49a4bb', '#3b48e6', '#2f39a9'] // มิ้นต์เด่นสุด
const INTRO_MS = 1800

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uPixelRatio;
  attribute vec3 aStart;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // แต่ละเม็ดออกตัวไม่พร้อมกัน → ดูเป็นการพ่นต่อเนื่อง
    float t = clamp(uIntro * 1.35 - aSeed * 0.35, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 3.0);
    vec3 p = mix(aStart, position, e);
    // ลอยเบา ๆ รอบตำแหน่งเป้าหมาย
    float s = aSeed * 6.2831;
    p += vec3(sin(uTime * 0.35 + s) * 0.06, cos(uTime * 0.28 + s * 1.3) * 0.05, sin(uTime * 0.22 + s * 0.7) * 0.08) * e;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (6.0 / -mv.z);
    vColor = aColor;
    vAlpha = smoothstep(0.0, 0.25, t);
  }
`

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // เม็ดกลมขอบฟุ้งแบบละอองสเปรย์
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`

export function createHeroSpray(canvas, { count = 1100, reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' })
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  renderer.setPixelRatio(dpr)

  const scene = new Scene()
  const camera = new PerspectiveCamera(40, 1, 0.1, 50)
  camera.position.set(0, 0, 6)
  const group = new Group()
  scene.add(group)

  // ---------- จุดเป้าหมาย: วงรีหนาแน่นตรงขอบ + ฟุ้งบาง ๆ ด้านใน, เอียงเหมือนวงในภาพ ----------
  const pos = new Float32Array(count * 3)
  const start = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const seed = new Float32Array(count)
  const color = new Float32Array(count * 3)
  const c = new Color()
  const tilt = -0.5
  for (let i = 0; i < count; i++) {
    const ring = Math.random() < 0.72
    const ang = Math.random() * Math.PI * 2
    const r = ring ? 1 + (Math.random() - 0.5) * 0.35 : Math.sqrt(Math.random()) * 0.95
    let x = Math.cos(ang) * r * 2.25
    let y = Math.sin(ang) * r * 1.35
    const z = (Math.random() - 0.5) * (ring ? 0.9 : 1.6)
    ;[x, y] = [x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt)]
    pos.set([x, y, z], i * 3)

    // จุดเริ่ม: พ่นมาจากมุมซ้ายล่าง / ขวาบน (ครึ่ง ๆ)
    const fromLeft = i % 2 === 0
    start.set([fromLeft ? -4.2 : 4.2, fromLeft ? -2.6 : 2.4, 1.2 + Math.random()], i * 3)

    size[i] = ring ? 6 + Math.random() * 14 : 3 + Math.random() * 8
    seed[i] = Math.random()
    c.set(PALETTE[Math.floor(Math.random() * PALETTE.length)])
    color.set([c.r, c.g, c.b], i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('aStart', new BufferAttribute(start, 3))
  geo.setAttribute('aSize', new BufferAttribute(size, 1))
  geo.setAttribute('aSeed', new BufferAttribute(seed, 1))
  geo.setAttribute('aColor', new BufferAttribute(color, 3))

  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntro: { value: reduced ? 1 : 0 },
      uPixelRatio: { value: dpr },
      uOpacity: { value: 0.5 },
    },
  })
  group.add(new Points(geo, material))

  // ---------- ขนาด / เมาส์ / ธีม ----------
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()

  const mouse = { x: 0, y: 0 }
  const onPointer = (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  // โหมดสว่าง: ละอองจางลงบนพื้นครีม / โหมดมืด: ชัดขึ้นนิดหน่อย
  const applyTheme = () => (material.uniforms.uOpacity.value = document.documentElement.dataset.theme === 'dark' ? 0.65 : 0.38)
  applyTheme()
  const themeObserver = new MutationObserver(applyTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // ---------- วนเรนเดอร์ (หยุดเมื่อไม่อยู่บนจอ) ----------
  let raf = 0
  let running = false
  const t0 = performance.now()
  function frame(now) {
    const t = (now - t0) / 1000
    material.uniforms.uTime.value = t
    material.uniforms.uIntro.value = reduced ? 1 : Math.min(1, (now - t0) / INTRO_MS)
    group.rotation.y += (mouse.x * 0.35 - group.rotation.y) * 0.05
    group.rotation.x += (mouse.y * 0.2 - group.rotation.x) * 0.05
    group.rotation.z = Math.sin(t * 0.15) * 0.04
    renderer.render(scene, camera)
    raf = running ? requestAnimationFrame(frame) : 0
  }

  return {
    resize,
    start() {
      if (reduced) {
        renderer.render(scene, camera) // ตั้งค่าลดการเคลื่อนไหว: วาดภาพนิ่งภาพเดียว
        return
      }
      if (running) return
      running = true
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    dispose() {
      this.stop()
      window.removeEventListener('pointermove', onPointer)
      themeObserver.disconnect()
      geo.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}
