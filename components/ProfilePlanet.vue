<template>
  <div class="profile-planet">
    <div class="profile-planet__atmo" aria-hidden="true" />
    <span class="profile-fig__axes" aria-hidden="true" />
    <img src="/profile.webp" alt="Profile photo" class="profile-planet__img">
    <span class="profile-planet__shade" aria-hidden="true" />
    <div class="profile-planet__orbit" aria-hidden="true">
      <div class="profile-planet__track">
        <span class="profile-planet__moon" />
      </div>
    </div>

    <!-- Ground Control only: the photo drawn as a dimensioned figure -->
    <span class="profile-fig__ext" aria-hidden="true" />
    <div class="profile-fig__dim" aria-hidden="true">
      <span class="profile-fig__dim-label">Ø <span class="md:hidden">240</span><span class="hidden md:inline 2xl:hidden">300</span><span class="hidden 2xl:inline">360</span></span>
    </div>
    <p class="profile-fig__caption" aria-hidden="true">Fig. 1 — J. M. Bautista</p>
  </div>
</template>

<style scoped>
.profile-planet {
  /* Where the Ground Control dimension line sits, as a share of the photo height */
  --dim-top: 130%;
  position: relative;
  width: 300px;
  height: 300px;
  flex-shrink: 0;
}

/* Large monitors: a bigger planet to fill the full-screen hero */
@media (min-width: 1536px) {
  .profile-planet {
    width: 360px;
    height: 360px;
  }
}

@media (max-width: 767px) {
  .profile-planet {
    --dim-top: 114%;
    width: 240px;
    height: 240px;
  }
}

/* ---------- Space (dark) ---------- */
.profile-planet__atmo {
  position: absolute;
  inset: -12%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(122 102 240 / 0.42) 0%, rgb(56 189 248 / 0.16) 46%, transparent 68%);
  filter: blur(6px);
}

/* Terminator shading so the photo reads as a lit sphere */
.profile-planet__shade {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 26%, transparent 48%, rgb(4 6 15 / 0.45) 100%);
  pointer-events: none;
}

html:not(.dark) .profile-planet__atmo,
html:not(.dark) .profile-planet__shade {
  display: none;
}

/* ---------- Shared: photo + orbit ---------- */
.profile-planet__img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  /* Ground Control: an inked circle with an offset construction line */
  box-shadow:
    0 0 0 1.5px rgb(var(--c-ink)),
    0 0 0 8px #fff,
    0 0 0 9px rgb(var(--c-ink) / 0.3);
}

html.dark .profile-planet__img {
  box-shadow:
    0 0 0 1px rgb(var(--c-nebula) / 0.45),
    0 0 0 8px rgb(var(--c-nebula) / 0.08),
    0 30px 60px -30px rgb(4 6 15 / 0.8);
}

/* Tilted orbit wide enough that it never crosses the photo */
.profile-planet__orbit {
  position: absolute;
  inset: -20%;
  z-index: 3;
  transform: rotate(-16deg) scaleY(0.92);
  pointer-events: none;
}

.profile-planet__track {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px dashed rgb(var(--c-ion) / 0.45);
  animation: planet-orbit 26s linear infinite;
}

/* Ground Control: an orange survey marker instead of a glowing moon */
.profile-planet__moon {
  position: absolute;
  left: 50%;
  top: 0;
  width: 9px;
  height: 9px;
  margin: -4.5px 0 0 -4.5px;
  rotate: 45deg;
  border: 1.5px solid rgb(var(--c-ink));
  background: var(--signal);
}

html.dark .profile-planet__moon {
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  rotate: 0deg;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, rgb(var(--c-ion)) 62%);
  box-shadow: 0 0 12px 2px rgb(var(--c-ion) / 0.7);
}

/* ---------- Ground Control (light) figure annotations ---------- */
/* Centre-line ticks at N / E / S / W, stopping short of the photo */
.profile-fig__axes {
  --ax: rgb(var(--c-ink) / 0.45);
  position: absolute;
  inset: -24%;
  pointer-events: none;
  background:
    linear-gradient(var(--ax), var(--ax)) left center / 15% 1px no-repeat,
    linear-gradient(var(--ax), var(--ax)) right center / 15% 1px no-repeat,
    linear-gradient(var(--ax), var(--ax)) center top / 1px 15% no-repeat,
    linear-gradient(var(--ax), var(--ax)) center bottom / 1px 15% no-repeat;
}

/* Extension lines from the photo's widest points down to the dimension line */
.profile-fig__ext {
  position: absolute;
  left: 0;
  right: 0;
  top: 56%;
  height: calc(var(--dim-top) + 4% - 56%);
  border-inline: 1px solid rgb(var(--c-ink) / 0.35);
  pointer-events: none;
}

.profile-fig__dim {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--dim-top);
  height: 1px;
  background: rgb(var(--c-ink) / 0.75);
}

.profile-fig__dim::before,
.profile-fig__dim::after {
  content: '';
  position: absolute;
  top: -4px;
  border-block: 4.5px solid transparent;
}

.profile-fig__dim::before {
  left: 0;
  border-right: 9px solid rgb(var(--c-ink));
}

.profile-fig__dim::after {
  right: 0;
  border-left: 9px solid rgb(var(--c-ink));
}

.profile-fig__dim-label {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  background: var(--paper);
  padding: 0 0.5rem;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--c-ink));
}

.profile-fig__caption {
  position: absolute;
  left: 50%;
  top: calc(var(--dim-top) + 16px);
  translate: -50% 0;
  white-space: nowrap;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--c-muted));
}

html.dark .profile-fig__axes,
html.dark .profile-fig__ext,
html.dark .profile-fig__dim,
html.dark .profile-fig__caption {
  display: none;
}

@keyframes planet-orbit {
  to {
    rotate: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-planet__track {
    animation: none;
  }
}
</style>
