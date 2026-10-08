<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import SprayDecor from './SprayDecor.vue'
import CatWalker from './CatWalker.vue'

const { t } = useI18n()
const wall = ref(null)
const durations = ref([64, 70])
let resizeObserver
onMounted(() => {
  const groups = wall.value.querySelectorAll('.testimonials-group:first-child')
  // Constant pixel speed on every screen; each duplicated group has identical width.
  const measure = () => {
    durations.value = Array.from(groups, (group, index) => group.getBoundingClientRect().width / (index === 0 ? 25 : 23))
  }
  resizeObserver = new ResizeObserver(measure)
  groups.forEach(group => resizeObserver.observe(group))
  measure()
})
onBeforeUnmount(() => resizeObserver?.disconnect())
// Layout samples only. Replace these with approved reviews before publishing.
const ratings = [[5, 4, 5, 4], [4, 5, 4, 5]]
const rows = computed(() => ratings.map((row, rowIndex) => row.map((rating, index) => ({
  id: rowIndex * 4 + index + 1,
  rating,
  body: t(`testimonials.samples.${index}`),
  name: t('testimonials.person', { n: String(rowIndex * 4 + index + 1).padStart(2, '0') }),
}))))
</script>

<template>
  <section id="testimonials" class="testimonials" aria-labelledby="testimonials-title">
    <SprayDecor preset="testimonials" />
    <div class="review-edge-art" aria-hidden="true">
      <svg class="street-prop spray-can" viewBox="0 0 200 190" fill="none" focusable="false">
        <g class="spray-cloud" fill="var(--color-mint)">
          <circle cx="100" cy="35" r="4"/><circle cx="82" cy="29" r="3"/><circle cx="65" cy="18" r="5"/><circle cx="58" cy="40" r="3"/><circle cx="38" cy="24" r="2"/><circle cx="75" cy="49" r="2"/>
          <path d="m35 53 9-4m15 11 8-4M46 8l7 4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </g>
        <g class="can-body" stroke="#0b0f3a" stroke-width="4" stroke-linejoin="round">
          <path d="M109 59v-9q0-8 8-8h17q8 0 8 8v9" fill="#b5a2ff"/>
          <path d="M119 42V31h13v11" fill="#f5f3ea"/><path d="M120 34h5"/>
          <rect x="99" y="58" width="53" height="106" rx="12" fill="#15d8b3"/>
          <path d="M100 82h51v58h-51" fill="#2f39a9"/>
          <path d="m109 99 8-9 8 11 12-7-6 22-21 3Z" fill="#15d8b3"/>
          <path d="m113 127 22-4" stroke="#f5f3ea" stroke-linecap="round"/>
          <path d="M108 153h33" stroke="#f5f3ea" stroke-linecap="round"/>
        </g>
        <path d="m164 83 7-12m-7 28 15-2" stroke="var(--color-heading)" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <svg class="street-prop boombox" viewBox="0 0 260 170" fill="none" focusable="false">
        <g stroke="#0b0f3a" stroke-width="4" stroke-linejoin="round">
          <path d="M77 54V35h96v19" stroke="var(--color-heading)" stroke-width="9"/>
          <path d="m179 53 37-37" stroke="var(--color-copy)"/>
          <rect x="24" y="53" width="214" height="100" rx="12" fill="#b5a2ff"/>
          <rect x="29" y="59" width="204" height="22" rx="5" fill="#2f39a9"/>
          <path d="M42 69h59" stroke="#15d8b3" stroke-width="3"/>
          <circle cx="199" cy="69" r="4" fill="#eedd87"/><circle cx="216" cy="69" r="4" fill="#15d8b3"/>
          <g class="speaker"><circle cx="67" cy="115" r="28" fill="#10121c"/><circle cx="67" cy="115" r="17" stroke="#15d8b3"/><circle cx="67" cy="115" r="7" fill="#15d8b3"/></g>
          <g class="speaker"><circle cx="194" cy="115" r="28" fill="#10121c"/><circle cx="194" cy="115" r="17" stroke="#15d8b3"/><circle cx="194" cy="115" r="7" fill="#15d8b3"/></g>
          <rect x="108" y="93" width="44" height="35" rx="4" fill="#f5f3ea"/><path d="M118 104h24m-24 12h24" stroke-width="3"/>
          <path d="M114 140h7m5 0h7m5 0h7" stroke-width="5"/>
        </g>
        <g class="sound-marks" stroke="var(--color-mint)" stroke-width="4" stroke-linecap="round"><path d="m13 89-8-6m9 25H3m243-19 9-6m-9 25h11"/></g>
      </svg>
      <span class="edge-tag">DROP A WORD<span>MAKE SOME NOISE! &#8599;</span></span>
    </div>
    <header class="testimonials-heading">
      <div>
        <p class="testimonials-eyebrow">{{ t('testimonials.eyebrow') }} <span>DEMO</span></p>
        <h2 id="testimonials-title">{{ t('testimonials.title') }}</h2>
        <p class="testimonials-note">{{ t('testimonials.note') }}</p>
      </div>
      <div class="crew-stamp" aria-hidden="true"><span>WORD ON</span><strong>THE STREET</strong><span class="stamp-star">&#10038;</span></div>
    </header>

    <!-- แมวดำเดินเล่นเหนือการ์ดรีวิว -->
    <CatWalker class="testimonials-cat" />

    <div ref="wall" class="testimonials-wall">
      <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="testimonials-viewport" tabindex="0" role="region" :aria-label="t('testimonials.row', { n: rowIndex + 1 })">
        <div class="testimonials-track" :class="{ 'is-reversed': rowIndex === 1 }" :style="{ '--review-duration': `${durations[rowIndex]}s` }">
          <div v-for="copy in 2" :key="copy" class="testimonials-group" :aria-hidden="copy === 2 ? true : undefined" :inert="copy === 2 ? true : undefined">
            <figure v-for="review in row" :key="review.id" class="testimonial-card">
              <span class="testimonial-tape" aria-hidden="true">{{ ['REAL TALK', 'SPEAK UP!', 'MY CREW', 'LEVEL UP'][review.id % 4] }}</span>
              <span class="testimonial-quote" aria-hidden="true">&#8220;</span>
              <blockquote>{{ review.body }}</blockquote>
              <figcaption>
                <span class="testimonial-avatar" :class="`tone-${review.id % 3}`" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="16" cy="10" r="5" /><path d="M6 28v-3a10 10 0 0 1 20 0v3Z" /></svg>
                </span>
                <span><strong>{{ review.name }}</strong><small>{{ t('testimonials.sample') }}</small></span>
                <span class="testimonial-number" aria-hidden="true">{{ String(review.id).padStart(2, '0') }}</span>
              </figcaption>
              <div class="testimonial-stars" role="img" :aria-label="t('testimonials.rating', { n: review.rating })">
                <svg v-for="star in 5" :key="star" viewBox="0 0 24 24" :fill="star <= review.rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 2 3 6.1 6.7 1-4.9 4.7 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.7 6.7-1Z" /></svg>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </div>
    <div class="testimonials-caption" aria-hidden="true"><span>REAL TALK. REAL CONNECTION.</span><span>THE LEARNING CREW ↗</span></div>
  </section>
</template>

<style scoped>
.testimonials { position: relative; isolation: isolate; overflow: hidden; padding: 76px 0 38px; background: var(--color-wall); color: var(--color-copy); }
.testimonials-heading { position: relative; max-width: 1152px; margin: 0 auto 46px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.testimonials-eyebrow { color: var(--color-eyebrow); font: 22px var(--font-hand); }
.testimonials-eyebrow span { display: inline-block; margin-left: 12px; padding: 3px 8px; background: var(--color-mint); color: var(--color-night); border: 2px solid var(--color-night); font: 10px monospace; letter-spacing: 1px; vertical-align: middle; transform: rotate(-7deg); }
h2 { position: relative; display: inline-block; isolation: isolate; margin-top: 12px; font-size: clamp(36px, 5vw, 66px); line-height: 1.35; font-weight: 900; font-style: italic; color: var(--color-heading); transform: rotate(-2deg); text-shadow: 3px 3px 0 var(--color-night); }
h2::after { content: ''; position: absolute; z-index: -1; left: 0; right: -10px; bottom: 2px; height: 10px; background: var(--color-mint); clip-path: polygon(2% 20%,100% 0,96% 65%,25% 100%,0 80%); }
.testimonials-note { max-width: 580px; margin-top: 20px; font-size: 13px; color: var(--color-muted); }
.crew-stamp { position: relative; flex-shrink: 0; padding: 14px 22px; border: 3px solid var(--color-night); background: #c6b7ff; color: var(--color-night); box-shadow: 6px 6px 0 var(--color-night); transform: rotate(9deg); font: 20px/1.25 var(--font-tag); }
.crew-stamp strong { display: block; font-size: 27px; }
.stamp-star { position: absolute; right: -24px; top: -33px; font-size: 64px; color: var(--color-mint); -webkit-text-stroke: 2px var(--color-night); }
.testimonials-wall { position: relative; padding-block: 10px; }
.testimonials-wall::before { content: ''; position: absolute; inset: 8% 0; background: var(--color-ink); opacity: .12; transform: skewY(-2deg); pointer-events: none; }
.testimonials-viewport { position: relative; overflow: hidden; padding: 20px 0 22px; }
.testimonials-viewport + .testimonials-viewport { margin-top: -4px; }
.testimonials-viewport:focus-visible { outline: 3px dashed var(--color-heading); outline-offset: -4px; }
.testimonials-track { display: flex; width: max-content; will-change: transform; animation: reviews-left var(--review-duration, 64s) linear infinite; }
.testimonials-track.is-reversed { animation-direction: reverse; }
.testimonials-group { display: flex; flex-shrink: 0; min-width: 100vw; gap: 16px; padding-right: 16px; }
.testimonial-card { --review-accent: var(--color-mint); position: relative; display: flex; flex: 1 0 clamp(290px, 28vw, 410px); flex-direction: column; width: clamp(290px, 28vw, 410px); min-height: 288px; padding: 40px 26px 22px; border: 3px solid var(--color-night); border-radius: 3px 16px 3px 3px; background: var(--color-paper); box-shadow: 5px 6px 0 var(--review-accent); }
.testimonial-card:nth-child(2n) { --review-accent: #b5a2ff; background: var(--color-panel); }
.testimonial-card:nth-child(3n) { --review-accent: #eedd87; }
.testimonial-card::after { content: ''; position: absolute; right: 16px; bottom: 18px; width: 42px; height: 26px; opacity: .4; background-image: radial-gradient(var(--review-accent) 1.5px, transparent 1.5px); background-size: 5px 5px; transform: rotate(-12deg); pointer-events: none; }
.is-reversed .testimonial-card { flex-basis: clamp(310px, 31vw, 450px); width: clamp(310px, 31vw, 450px); }
.testimonial-tape { position: absolute; left: 22px; top: -13px; padding: 5px 16px; background: var(--review-accent); color: var(--color-night); border: 2px solid var(--color-night); font: 14px/1.2 var(--font-tag); letter-spacing: .6px; transform: rotate(-5deg); box-shadow: 2px 2px 0 var(--color-night); }
.testimonial-card:nth-child(even) .testimonial-tape { transform: rotate(4deg); }
.testimonial-quote { position: absolute; top: 5px; right: 16px; color: var(--review-accent); opacity: .4; font: 80px/1 Georgia, serif; pointer-events: none; }
blockquote { position: relative; max-width: 34ch; font-size: 19px; line-height: 1.7; margin-bottom: 24px; }
figcaption { display: flex; align-items: center; gap: 12px; margin-top: auto; }
figcaption strong { display: block; font-size: 14px; font-weight: 500; }
figcaption small { display: block; margin-top: 2px; font-size: 11px; color: var(--color-muted); }
.testimonial-avatar { display: grid; place-items: center; width: 43px; height: 43px; flex-shrink: 0; border: 2px solid var(--color-night); border-radius: 12px 12px 12px 2px; background: var(--color-mint); color: var(--color-night); transform: rotate(-6deg); box-shadow: 2px 2px 0 var(--review-accent); }
.testimonial-avatar.tone-1 { background: #acb4ff; }
.testimonial-avatar.tone-2 { background: #f2dfa5; }
.testimonial-avatar svg { width: 29px; height: 29px; }
.testimonial-number { margin-left: auto; color: var(--color-muted); font: 18px var(--font-tag); transform: rotate(8deg); }
.testimonial-stars { display: flex; align-self: flex-start; gap: 3px; margin-top: 20px; padding: 4px 8px; border: 1px solid var(--color-night); background: var(--review-accent); color: var(--color-night); transform: rotate(-3deg); }
.testimonial-stars svg { width: 18px; height: 18px; }
.testimonials-viewport:hover .testimonials-track, .testimonials-viewport:focus-within .testimonials-track { animation-play-state: paused; }
.testimonials-caption { display: flex; justify-content: space-between; gap: 16px; max-width: 1152px; margin: 20px auto 0; padding-inline: 24px; color: var(--color-muted); font: 10px monospace; letter-spacing: 1.4px; }
@keyframes reviews-left { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-50%, 0, 0); } }
@media (max-width: 640px) {
  .testimonials { padding-top: 44px; }
  .testimonials-heading { align-items: flex-start; gap: 16px; margin-bottom: 28px; }
  .testimonials-heading > div:first-child { min-width: 0; }
  .crew-stamp { display: none; }
  .testimonial-card { padding: 36px 22px 22px; min-height: 276px; }
  blockquote { font-size: 17px; }
  .testimonials-caption { font-size: 8px; letter-spacing: .6px; }
}
@media (prefers-reduced-motion: reduce) {
  .testimonials-track { animation: none; transform: none; will-change: auto; }
  .testimonials-group[aria-hidden='true'] { display: none; }
  .testimonials-viewport { overflow-x: auto; }
}
/* Hip-hop sticker props occupy their own edge space, away from reviews. */
.testimonials { padding-top: 140px; padding-bottom: 180px; }
.review-edge-art { position: absolute; inset: 0; overflow: hidden; pointer-events: none; user-select: none; }
.street-prop { position: absolute; filter: drop-shadow(4px 5px 0 #0b0f3a); }
.spray-can { width: 180px; right: -22px; top: -22px; transform: rotate(-22deg); animation: can-rock 5s ease-in-out infinite; }
.boombox { width: 240px; left: -12px; bottom: 10px; transform: rotate(8deg); animation: box-bob 3s ease-in-out infinite; }
.speaker { transform-box: fill-box; transform-origin: center; animation: speaker-beat 1.5s ease-in-out infinite; }
.spray-cloud { color: var(--color-mint); animation: spray-puff 3s ease-out infinite; transform-origin: 110px 36px; }
.sound-marks { animation: sound-beat 1.5s ease-in-out infinite; }
.edge-tag { position: absolute; right: 28px; bottom: 54px; color: var(--color-heading); font: clamp(20px, 3vw, 38px)/1.3 var(--font-tag); transform: rotate(-9deg); }
.edge-tag span { display: block; color: var(--color-eyebrow); font-size: 12px; letter-spacing: 2px; }
.testimonials-heading, .testimonials-wall, .testimonials-caption { position: relative; z-index: 1; }
.testimonials-cat { z-index: 2; max-width: 1152px; margin: -34px auto -22px; padding-inline: 24px; }
@keyframes can-rock { 0%, 100% { transform: rotate(-22deg) translateY(0); } 50% { transform: rotate(-14deg) translateY(6px); } }
@keyframes box-bob { 0%, 100% { transform: rotate(8deg) translateY(0); } 50% { transform: rotate(5deg) translateY(-5px); } }
@keyframes speaker-beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes spray-puff { 0% { transform: translate(6px, 3px) scale(.7); opacity: 0; } 25% { opacity: .85; } 100% { transform: translate(-16px, -7px) scale(1.18); opacity: 0; } }
@keyframes sound-beat { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@media (max-width: 640px) {
  .testimonials { padding-top: 112px; padding-bottom: 140px; }
  .spray-can { width: 140px; right: -24px; top: -18px; }
  .boombox { width: 170px; left: -18px; bottom: 14px; }
  .edge-tag { right: 16px; bottom: 55px; font-size: 17px; }
  .edge-tag span { font-size: 8px; letter-spacing: .5px; }
}
@media (prefers-reduced-motion: reduce) {
  .street-prop, .speaker, .spray-cloud, .sound-marks { animation: none; }
}
</style>




