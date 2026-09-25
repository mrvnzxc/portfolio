<template>
  <div class="profile-planet">
    <div class="profile-planet__atmo" aria-hidden="true" />
    <img src="/profile.webp" alt="Profile photo" class="profile-planet__img">
    <span class="profile-planet__shade" aria-hidden="true" />
    <div class="profile-planet__orbit" aria-hidden="true">
      <div class="profile-planet__track">
        <span class="profile-planet__moon" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-planet {
  position: relative;
  width: 300px;
  height: 300px;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .profile-planet {
    width: 240px;
    height: 240px;
  }
}

.profile-planet__atmo {
  position: absolute;
  inset: -12%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(122 102 240 / 0.42) 0%, rgb(56 189 248 / 0.16) 46%, transparent 68%);
  filter: blur(6px);
}

.profile-planet__img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow:
    0 0 0 1px rgb(var(--c-nebula) / 0.45),
    0 0 0 8px rgb(var(--c-nebula) / 0.08),
    0 30px 60px -30px rgb(4 6 15 / 0.8);
}

/* Terminator shading so the photo reads as a lit sphere */
.profile-planet__shade {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 26%, transparent 50%, rgb(16 20 46 / 0.22) 100%);
  pointer-events: none;
}

html.dark .profile-planet__shade {
  background: radial-gradient(circle at 30% 26%, transparent 48%, rgb(4 6 15 / 0.45) 100%);
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
  border: 1px dashed rgb(var(--c-ion) / 0.4);
  animation: planet-orbit 26s linear infinite;
}

.profile-planet__moon {
  position: absolute;
  left: 50%;
  top: 0;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, rgb(var(--c-ion)) 62%);
  box-shadow: 0 0 12px 2px rgb(var(--c-ion) / 0.7);
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
