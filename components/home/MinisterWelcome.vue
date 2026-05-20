<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings)

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    id="welcome"
    ref="sectionRef"
    class="minister-section"
    aria-label="Welcome letter from our minister"
  >
    <div class="minister-container">
      <!-- ── Left: stacked photo cards ─────────────────────────────── -->
      <div aria-hidden="true" :class="['reveal-left', isVisible && 'is-visible']">
        <div class="photo-stack-wrapper">
          <div class="photo-card photo-card--back">
            <img :src="cfg.congregationPhotos[0]" alt="Congregation gathering 1" loading="lazy" />
          </div>
          <div class="photo-card photo-card--mid">
            <img :src="cfg.congregationPhotos[1]" alt="Congregation gathering 2" loading="lazy" />
          </div>
          <div class="photo-card photo-card--front">
            <div class="photo-pin"></div>
            <img :src="cfg.ministerPhoto" alt="Minister headshot" loading="eager" />
          </div>
        </div>
      </div>

      <!-- ── Right: letter ─────────────────────────────────────────── -->
      <div :class="['reveal-right', 'delay-200', isVisible && 'is-visible']">
        <!-- Top brush stroke -->
        <div class="brush-stroke">
          <svg
            width="160"
            height="18"
            viewBox="0 0 160 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 12 C30 4, 60 16, 90 10 C120 4, 145 14, 158 9"
              stroke="#111827"
              stroke-width="3.5"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M10 13 C38 6, 68 17, 96 11 C124 5, 148 15, 156 10"
              stroke="#111827"
              stroke-width="1.2"
              stroke-linecap="round"
              fill="none"
              opacity="0.35"
            />
          </svg>
        </div>

        <h2 class="letter-heading">A Welcome Letter From Our Minister</h2>

        <div class="letter-body">
          <p class="first-paragraph">
            <span aria-hidden="true" class="drop-cap">D</span>ear Friend,<br /><br />
            {{ cfg.ministerLetterP1 }}
          </p>
          <p>{{ cfg.ministerLetterP2 }}</p>
          <p>{{ cfg.ministerLetterP3 }}</p>
          <p>{{ cfg.ministerLetterP4 }}</p>
        </div>

        <div class="signature-block">
          <p class="minister-name">{{ cfg.ministerName }}</p>
          <p class="minister-role">{{ cfg.ministerTitle }}</p>
        </div>

        <!-- Bottom brush stroke (mirrored) -->
        <div class="brush-stroke brush-stroke--bottom">
          <svg
            width="160"
            height="18"
            viewBox="0 0 160 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style="transform: scaleX(-1)"
          >
            <path
              d="M4 12 C30 4, 60 16, 90 10 C120 4, 145 14, 158 9"
              stroke="#111827"
              stroke-width="3.5"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M10 13 C38 6, 68 17, 96 11 C124 5, 148 15, 156 10"
              stroke="#111827"
              stroke-width="1.2"
              stroke-linecap="round"
              fill="none"
              opacity="0.35"
            />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.minister-section {
  background: #ffffff;
  padding: 80px 24px;
}
.minister-container {
  max-width: 860px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 64px;
  align-items: center;
}
.photo-stack-wrapper {
  position: relative;
  width: 260px;
  height: 360px;
  margin: 0 auto;
}
.photo-card {
  position: absolute;
  width: 200px;
  height: 260px;
  border-radius: 8px;
  overflow: hidden;
  border: 6px solid white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.photo-card--back {
  bottom: 0;
  left: 0;
  transform: rotate(-12deg);
  z-index: 1;
  background: #d1d5db;
}
.photo-card--mid {
  bottom: 20px;
  left: 30px;
  transform: rotate(-5deg);
  z-index: 2;
  background: #9ca3af;
}
.photo-card--front {
  bottom: 40px;
  left: 55px;
  transform: rotate(3deg);
  z-index: 3;
}
.photo-card :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo-pin {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 10px;
  height: 10px;
  background: #2563eb;
  border-radius: 50%;
  z-index: 10;
}
.brush-stroke {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.brush-stroke--bottom {
  margin-bottom: 0;
  margin-top: 20px;
}
.letter-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 28px;
}
.letter-body p {
  font-size: 14px;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 16px;
}
.drop-cap {
  float: left;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 64px;
  font-weight: 700;
  line-height: 0.75;
  margin-right: 6px;
  margin-top: 6px;
  color: #111827;
}
.first-paragraph {
  overflow: hidden;
}
.signature-block {
  margin-top: 24px;
}
.minister-name {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}
.minister-role {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin-top: 2px;
}
@media (max-width: 768px) {
  .minister-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .photo-stack-wrapper {
    width: 220px;
    height: 300px;
  }
  .photo-card {
    width: 170px;
    height: 220px;
  }
}
</style>
