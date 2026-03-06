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

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedTheme = localStorage.getItem('theme');
const initialDark = storedTheme ? storedTheme === 'dark' : prefersDark;

document.getElementById('year').textContent = new Date().getFullYear();

function setTheme(isDark) {
  body.classList.toggle('dark-mode', isDark);
  html.classList.toggle('dark', isDark);
  themeToggle.checked = isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  particleColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,1)';
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
  themeToggle.addEventListener('change', (e) => setTheme(e.target.checked));
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

