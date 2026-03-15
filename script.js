// Theme toggle with persistence and floating dust
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const html = document.documentElement;
const canvas = document.getElementById('dust-canvas');
const ctx = canvas.getContext('2d');
const particles = [];
const shootingStars = [];
let animationId = null;
let particleColor = '#ffffff';
let toastHideTimeout = null;

const storedTheme = localStorage.getItem('theme');
// Default to dark on first visit; afterwards respect saved preference
const initialDark = storedTheme ? storedTheme === 'dark' : true;

document.getElementById('year').textContent = new Date().getFullYear();

function setTheme(isDark) {
  body.classList.toggle('dark-mode', isDark);
  html.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  particleColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,1)';
}

function toggleTheme() {
  const nextIsDark = !body.classList.contains('dark-mode');
  setTheme(nextIsDark);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles(count = 160) {
  particles.length = 0;
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.3,
    });
  }
}

let lastShootingStarTime = 0;

function spawnShootingStar() {
  const fromLeft = Math.random() < 0.5;
  const startX = fromLeft ? -120 : canvas.width + 120;
  const startY = Math.random() * (canvas.height * 0.4);
  const speed = Math.random() * 6 + 10; // faster so it crosses the whole screen

  const vx = fromLeft ? speed : -speed;
  const vy = speed * (Math.random() * 0.18 + 0.06);

  shootingStars.push({
    x: startX,
    y: startY,
    vx,
    vy,
    length: Math.random() * 140 + 100,
    life: 1,
    // slower decay so stars live long enough to cross the viewport
    decay: Math.random() * 0.002 + 0.002,
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = particleColor;
  particles.forEach((p) => {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      // Respawn anywhere with fresh velocity so stars don't cluster
      p.x = Math.random() * canvas.width;
      p.y = Math.random() * canvas.height;
      p.vx = (Math.random() - 0.5) * 0.3;
      p.vy = (Math.random() - 0.5) * 0.3;
      p.alpha = Math.random() * 0.5 + 0.3;
      p.r = Math.random() * 1.4 + 0.6;
    }
  });
  // Shooting stars
  const now = performance.now();
  if (now - lastShootingStarTime > 3500 && Math.random() > 0.4) {
    spawnShootingStar();
    lastShootingStarTime = now;
  }

  ctx.globalAlpha = 1;
  shootingStars.forEach((s, index) => {
    ctx.save();
    const gradient = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 4, s.y - s.vy * 4);
    const isDark = body.classList.contains('dark-mode');
    if (isDark) {
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(1, 'rgba(148,163,184,0)');
    } else {
      // Slightly darker head color so shooting stars are visible on light background
      gradient.addColorStop(0, 'rgba(15,23,42,0.9)');
      gradient.addColorStop(1, 'rgba(148,163,184,0)');
    }
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * (s.length / 10), s.y - s.vy * (s.length / 10));
    ctx.stroke();
    ctx.restore();

    s.x += s.vx;
    s.y += s.vy;
    s.life -= s.decay;

    if (s.life <= 0 || s.x < -200 || s.x > canvas.width + 200 || s.y > canvas.height + 200) {
      shootingStars.splice(index, 1);
    }
  });

  animationId = requestAnimationFrame(draw);
}

function startDust() {
  resizeCanvas();
  createParticles();
  if (!animationId) draw();
}

function stopDust() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}
window.addEventListener('resize', resizeCanvas);

setTheme(initialDark);
startDust();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = !navMenu.classList.contains('hidden');
    navMenu.classList.toggle('hidden', isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

// Scroll reveal animations
const revealElements = document.querySelectorAll('.reveal-on-scroll');

if ('IntersectionObserver' in window && revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      threshold: 0.15,
    },
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback: show all elements if IntersectionObserver isn't available
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

// Animated skill bars
const skillBars = document.querySelectorAll('.skill-bar');

function animateSkillBar(bar) {
  const percent = parseInt(bar.dataset.percent, 10) || 0;
  const fill = bar.querySelector('.skill-bar-fill');
  const label = bar.querySelector('.skill-percentage');
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / 1000, 1); // 1 second
    const current = Math.floor(progress * percent);
    if (fill) fill.style.width = `${current}%`;
    if (label) label.textContent = `${current}%`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window && skillBars.length > 0) {
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const bar = entry.target;
        const fill = bar.querySelector('.skill-bar-fill');
        const label = bar.querySelector('.skill-percentage');

        if (entry.isIntersecting) {
          if (fill) fill.style.width = '0%';
          if (label) label.textContent = '0%';
          animateSkillBar(bar);
        } else {
          if (fill) fill.style.width = '0%';
          if (label) label.textContent = '0%';
        }
      });
    },
    {
      threshold: 0.4,
    },
  );

  skillBars.forEach((bar) => barObserver.observe(bar));
}

// Simple form validation feedback
const form = document.getElementById('contact-form');
const emailInput = document.getElementById('email');

// Toast helpers
const toastEl = document.getElementById('toast-content');
const toastTitleEl = document.getElementById('toast-title');
const toastMessageEl = document.getElementById('toast-message');
const toastIconEl = document.getElementById('toast-icon');

function showToast({ title, message, variant }) {
  if (!toastEl || !toastTitleEl || !toastMessageEl || !toastIconEl) return;

  // Clear any pending hide
  if (toastHideTimeout) {
    clearTimeout(toastHideTimeout);
    toastHideTimeout = null;
  }

  toastTitleEl.textContent = title;
  toastMessageEl.textContent = message;

  // Reset variant classes (using Tailwind utility class names)
  toastEl.classList.remove(
    'border-emerald-500',
    'bg-emerald-600/95',
    'text-emerald-50',
    'border-red-500',
    'bg-red-600/95',
    'text-red-50',
  );

  if (variant === 'error') {
    toastEl.classList.add('border-red-500', 'bg-red-600/95', 'text-red-50');
    toastIconEl.textContent = '!';
  } else {
    toastEl.classList.add('border-emerald-500', 'bg-emerald-600/95', 'text-emerald-50');
    toastIconEl.textContent = '✓';
  }

  toastEl.classList.remove('hidden');
  // Force reflow so the transition always plays
  // eslint-disable-next-line no-unused-expressions
  toastEl.offsetHeight;
  toastEl.classList.add('toast-show');

  toastHideTimeout = setTimeout(() => {
    toastEl.classList.remove('toast-show');
    toastHideTimeout = setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 250);
  }, 4000);
}
if (form) {
  form.addEventListener('submit', (event) => {
    // Custom email validation
    if (emailInput) {
      const emailValue = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        event.preventDefault();
        event.stopPropagation();
        showToast({
          title: 'Invalid email',
          message: 'Please enter a valid email address (e.g. you@example.com).',
          variant: 'error',
        });
        emailInput.focus();
        return;
      }
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    const formData = new FormData(form);
    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          const name = document.getElementById('name').value || 'friend';
          showToast({
            title: 'Message sent',
            message: `Thanks, ${name}! Your message has been sent.`,
            variant: 'success',
          });
          form.reset();
        } else {
          showToast({
            title: 'Something went wrong',
            message: 'There was a problem sending your message. Please try again later.',
            variant: 'error',
          });
        }
      })
      .catch(() => {
        showToast({
          title: 'Network error',
          message: 'Please check your connection and try again.',
          variant: 'error',
        });
      });

    form.classList.add('was-validated');
  });
}

// Typewriter effect for name
const typewriterElement = document.getElementById('typewriter-name');
if (typewriterElement) {
  const fullText = typewriterElement.textContent;
  // Set data attribute and min-height so layout stays fixed
  typewriterElement.setAttribute('data-full-text', fullText);
  const fullHeight = typewriterElement.offsetHeight;
  typewriterElement.style.minHeight = `${fullHeight}px`;

  let currentIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100; // milliseconds per character

  function typeWriter() {
    if (!isDeleting && currentIndex < fullText.length) {
      // Typing forward
      typewriterElement.textContent = fullText.substring(0, currentIndex + 1);
      currentIndex++;
      setTimeout(typeWriter, typeSpeed);
    } else if (!isDeleting && currentIndex === fullText.length) {
      // Finished typing, wait then start deleting
      setTimeout(() => {
        isDeleting = true;
        typeWriter();
      }, 3000);
    } else if (isDeleting && currentIndex > 0) {
      // Deleting backward
      currentIndex--;
      typewriterElement.textContent = fullText.substring(0, currentIndex);
      setTimeout(typeWriter, typeSpeed / 2);
    } else if (isDeleting && currentIndex === 0) {
      // Finished deleting, wait then type again
      isDeleting = false;
      setTimeout(typeWriter, 500);
    }
  }

  // Start the typewriter effect
  typeWriter();
}

// Lightbox for certificates and competition photos
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxImageWrapper = document.getElementById('lightbox-image-wrapper');
const lightboxPdfWrapper = document.getElementById('lightbox-pdf-wrapper');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxPdf = document.getElementById('lightbox-pdf');

function openImageLightbox(src) {
  if (!lightboxOverlay || !lightboxImageWrapper || !lightboxImage || !lightboxPdfWrapper) return;
  lightboxPdfWrapper.classList.add('hidden');
  lightboxPdf.src = '';
  lightboxImageWrapper.classList.remove('hidden');
  lightboxImage.src = src;
  lightboxOverlay.classList.remove('hidden');
  lightboxOverlay.classList.add('flex');
}

function openPdfLightbox(src) {
  if (!lightboxOverlay || !lightboxPdfWrapper || !lightboxPdf || !lightboxImageWrapper) return;
  lightboxImageWrapper.classList.add('hidden');
  lightboxImage.src = '';
  lightboxPdfWrapper.classList.remove('hidden');
  lightboxPdf.src = src;
  lightboxOverlay.classList.remove('hidden');
  lightboxOverlay.classList.add('flex');
}

function closeLightbox() {
  if (!lightboxOverlay) return;
  lightboxOverlay.classList.add('hidden');
  lightboxOverlay.classList.remove('flex');
  if (lightboxPdf) lightboxPdf.src = '';
}

if (lightboxClose && lightboxOverlay) {
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (event) => {
    if (event.target === lightboxOverlay) {
      closeLightbox();
    }
  });
}

document.querySelectorAll('[data-lightbox-img]').forEach((el) => {
  el.addEventListener('click', () => {
    const src = el.getAttribute('data-lightbox-img');
    if (src) openImageLightbox(src);
  });
});

document.querySelectorAll('[data-lightbox-pdf]').forEach((el) => {
  el.addEventListener('click', () => {
    const src = el.getAttribute('data-lightbox-pdf');
    if (src) openPdfLightbox(src);
  });
});

// === Gallery: inertial infinite carousel (transform-based, no scrollLeft) ===
// Base image list used for the infinite gallery & lightbox navigation
const galleryBaseImages = [
  'me1.jpg',
  'me2.jpg',
  'me3.jpg',
  'me4.jpg',
  'me5.jpg',
  'me6.jpg',
];

const galleryContainer = document.getElementById('gallery-container');
const galleryTrack = document.getElementById('gallery-track');

if (galleryContainer && galleryTrack && galleryBaseImages.length > 0) {
  // --- 1. Build repeated segments for infinite effect ---
  function createSegment() {
    const fragment = document.createDocumentFragment();
    galleryBaseImages.forEach((src, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      // Responsive frame sizes:
      // - Mobile: smaller centered frame
      // - Tablet: ~2 per row
      // - Desktop: ~3–4 per row
      item.className =
        'gallery-item relative aspect-[2/3] w-10/12 max-w-xs mx-auto flex-none overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:w-2/3 sm:max-w-sm md:w-1/3 md:max-w-none lg:w-1/4';
      item.setAttribute('data-gallery-index', String(index));

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Gallery photo ${index + 1}`;
      img.draggable = false;
      img.className = 'h-full w-full object-cover select-none pointer-events-none gallery-image';

      item.appendChild(img);
      fragment.appendChild(item);
    });
    return fragment;
  }

  // Use multiple segments so wrapping can happen far from edges
  const SEGMENT_COUNT = 6;
  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    galleryTrack.appendChild(createSegment());
  }

  // --- 2. Layout measurements for wrapping ---
  let segmentWidth = 0;

  function recalcSegmentWidth() {
    const items = galleryTrack.querySelectorAll('.gallery-item');
    if (items.length === 0) return;
    let width = 0;
    for (let i = 0; i < galleryBaseImages.length && i < items.length; i += 1) {
      const rect = items[i].getBoundingClientRect();
      width += rect.width;
      // add horizontal gap (Tailwind gap-4 → 16px) except after last item
      if (i < galleryBaseImages.length - 1) width += 16;
    }
    segmentWidth = width;
  }

  recalcSegmentWidth();
  window.addEventListener('resize', () => {
    recalcSegmentWidth();
  });

  // --- 3. Inertia engine using translateX ---
  let positionX = 0; // logical position in px
  let velocityX = 0; // px per frame
  let isDraggingGallery = false;
  let dragStartX = 0;
  let dragStartPositionX = 0;
  let lastPointerX = 0;
  let lastPointerTime = 0;
  let dragDistance = 0; // accumulated absolute movement to differentiate drag vs. click
  let rafId = 0;

  const FRICTION = 0.95;
  const MIN_VELOCITY = 0.1;

  function applyTransform() {
    // Very gentle wrapping to keep numbers bounded, but only when far off-screen
    if (segmentWidth > 0) {
      const span = segmentWidth * SEGMENT_COUNT;
      if (span > 0) {
        const maxOffset = span * 0.75;
        if (positionX > maxOffset || positionX < -maxOffset) {
          positionX = ((positionX + span / 2) % span) - span / 2;
        }
      }
    }

    galleryTrack.style.transform = `translateX(${positionX}px)`;
  }

  function step() {
    rafId = 0;

    if (!isDraggingGallery) {
      // Apply velocity with friction when not dragging
      if (Math.abs(velocityX) > MIN_VELOCITY) {
        positionX += velocityX;
        velocityX *= FRICTION;
      } else {
        velocityX = 0;
      }
    }

    applyTransform();

    if (isDraggingGallery || Math.abs(velocityX) > MIN_VELOCITY) {
      rafId = requestAnimationFrame(step);
    }
  }

  function ensureAnimationRunning() {
    if (rafId === 0) {
      rafId = requestAnimationFrame(step);
    }
  }

  // --- 4. Pointer-driven drag system ---
  function getClientX(event) {
    if (event.touches && event.touches[0]) return event.touches[0].clientX;
    if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientX;
    return event.clientX;
  }

  function onPointerDown(event) {
    // Only react to primary button on desktop
    if (event.button != null && event.button !== 0) return;
    isDraggingGallery = true;
    galleryTrack.classList.add('cursor-grabbing');
    dragStartX = getClientX(event);
    dragStartPositionX = positionX;
    lastPointerX = dragStartX;
    lastPointerTime = performance.now();
    dragDistance = 0;
    velocityX = 0;
    ensureAnimationRunning();
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDraggingGallery) return;
    const clientX = getClientX(event);
    const now = performance.now();
    const dx = clientX - lastPointerX;
    const dt = now - lastPointerTime || 16;

    // Instant response: follow pointer
    const dragDelta = clientX - dragStartX;
    positionX = dragStartPositionX + dragDelta;

    // Velocity in px per frame (normalized to ~60fps)
    velocityX = (dx / (dt / 16)) || 0;

    dragDistance += Math.abs(dx);

    lastPointerX = clientX;
    lastPointerTime = now;

    ensureAnimationRunning();
    event.preventDefault();
  }

  function onPointerUp() {
    if (!isDraggingGallery) return;
    isDraggingGallery = false;
    galleryTrack.classList.remove('cursor-grabbing');
    ensureAnimationRunning();
  }

  galleryTrack.addEventListener('mousedown', onPointerDown);
  galleryTrack.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('mouseleave', onPointerUp);
  window.addEventListener('touchend', onPointerUp);
  window.addEventListener('touchcancel', onPointerUp);

  // --- 5. Lightbox viewer for gallery images ---
  const galleryLightboxOverlay = document.createElement('div');
  galleryLightboxOverlay.id = 'gallery-lightbox';
  galleryLightboxOverlay.className =
    'fixed inset-0 z-50 hidden items-center justify-center bg-black/80 px-4';

  galleryLightboxOverlay.innerHTML = `
    <div class="relative flex max-h-[92vh] w-full max-w-5xl items-center justify-center">
      <button
        type="button"
        data-gallery-close
        class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-slate-100 shadow-lg shadow-black/50 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        ✕
      </button>
      <button
        type="button"
        data-gallery-prev
        class="absolute left-2 sm:left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-slate-100 shadow-md shadow-black/40 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        type="button"
        data-gallery-next
        class="absolute right-2 sm:right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-slate-100 shadow-md shadow-black/40 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="Next image"
      >
        ›
      </button>
      <div
        class="gallery-lightbox-image-wrapper flex max-h-[92vh] w-full items-center justify-center rounded-2xl bg-slate-900/90 p-3 shadow-2xl shadow-black/60"
      >
        <img
          data-gallery-image
          alt="Gallery preview"
          class="max-h-[80vh] w-full max-w-full rounded-xl object-contain opacity-0 transition-opacity duration-200 ease-out"
        />
      </div>
    </div>
  `;

  document.body.appendChild(galleryLightboxOverlay);

  const galleryLightboxImage = galleryLightboxOverlay.querySelector('[data-gallery-image]');
  const galleryLightboxClose = galleryLightboxOverlay.querySelector('[data-gallery-close]');
  const galleryLightboxPrev = galleryLightboxOverlay.querySelector('[data-gallery-prev]');
  const galleryLightboxNext = galleryLightboxOverlay.querySelector('[data-gallery-next]');

  let currentGalleryIndex = 0;

  function showGalleryImage(index) {
    if (!galleryLightboxImage) return;
    const total = galleryBaseImages.length;
    currentGalleryIndex = ((index % total) + total) % total;
    const src = galleryBaseImages[currentGalleryIndex];

    galleryLightboxImage.style.opacity = '0';
    requestAnimationFrame(() => {
      galleryLightboxImage.src = src;
      requestAnimationFrame(() => {
        galleryLightboxImage.style.opacity = '1';
      });
    });
  }

  function openGalleryLightbox(index) {
    showGalleryImage(index);
    galleryLightboxOverlay.classList.remove('hidden');
    galleryLightboxOverlay.classList.add('flex');
  }

  function closeGalleryLightbox() {
    galleryLightboxOverlay.classList.add('hidden');
    galleryLightboxOverlay.classList.remove('flex');
  }

  function showNextGalleryImage() {
    showGalleryImage(currentGalleryIndex + 1);
  }

  function showPrevGalleryImage() {
    showGalleryImage(currentGalleryIndex - 1);
  }

  if (galleryLightboxClose) {
    galleryLightboxClose.addEventListener('click', closeGalleryLightbox);
  }

  if (galleryLightboxNext) {
    galleryLightboxNext.addEventListener('click', showNextGalleryImage);
  }

  if (galleryLightboxPrev) {
    galleryLightboxPrev.addEventListener('click', showPrevGalleryImage);
  }

  galleryLightboxOverlay.addEventListener('click', (event) => {
    if (event.target === galleryLightboxOverlay) {
      closeGalleryLightbox();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && galleryLightboxOverlay.classList.contains('flex')) {
      closeGalleryLightbox();
    } else if (event.key === 'ArrowRight' && galleryLightboxOverlay.classList.contains('flex')) {
      showNextGalleryImage();
    } else if (event.key === 'ArrowLeft' && galleryLightboxOverlay.classList.contains('flex')) {
      showPrevGalleryImage();
    }
  });

  // Attach click handlers to open lightbox (stop propagation so drag doesn't interfere)
  galleryTrack.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      // If the user dragged more than a few pixels, treat it as a drag-only interaction,
      // not a click, to avoid accidental lightbox opens when releasing.
      if (dragDistance > 8) {
        return;
      }
      const rawIndex = Number(item.getAttribute('data-gallery-index')) || 0;
      openGalleryLightbox(rawIndex);
    });
  });
}

