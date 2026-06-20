'use strict';

const html        = document.documentElement;
const nav         = document.querySelector('.navbar');
const themeToggle = document.getElementById('themeToggle');
const typedText   = document.getElementById('typedText');
const yearEl      = document.getElementById('year');
const canvas      = document.getElementById('particleCanvas');
const ctx         = canvas ? canvas.getContext('2d') : null;

if (yearEl) yearEl.textContent = new Date().getFullYear();

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'dark'
      ? '<i class="bi bi-moon-stars" aria-hidden="true"></i>'
      : '<i class="bi bi-sun" aria-hidden="true"></i>';
    themeToggle.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  try { localStorage.setItem('portfolio-theme', theme); } catch (_) {  }
}

(function () {
  let saved = 'dark';
  try { saved = localStorage.getItem('portfolio-theme') || 'dark'; } catch (_) {}
  applyTheme(saved);
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

const phrases = [
  'Personal websites',
  'Landing pages',
  'Responsive UI',
  'GitHub Pages sites',
  'Portfolio layouts',
];

let phraseIndex = 0;

function rotateSpecialty() {
  if (!typedText) return;
  typedText.classList.add('is-changing');
  phraseIndex = (phraseIndex + 1) % phrases.length;
  setTimeout(() => {
    typedText.textContent = phrases[phraseIndex];
    typedText.classList.remove('is-changing');
  }, 220);
}

setInterval(rotateSpecialty, 2800);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('visible');

    if (entry.target.classList.contains('skill-card')) {
      entry.target.querySelectorAll('.skill-item').forEach((item) => {
        const value = item.dataset.skill;
        const labelSpan = item.querySelector('span');
        const bar       = item.querySelector('.progress-bar');
        if (labelSpan) labelSpan.dataset.value = `${value}%`;
        if (bar) {
          requestAnimationFrame(() => {
            bar.style.width = `${value}%`;
          });
        }
      });
    }

    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .skill-card').forEach((el) => {
  revealObserver.observe(el);
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    document.querySelectorAll('.project-item').forEach((item) => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hide', !show);
    });
  });
});

const contactForm  = document.getElementById('contactForm');
const submitBtn    = document.getElementById('submitBtn');
const formSuccess  = document.getElementById('formSuccess');
const formError    = document.getElementById('formError');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.classList.add('was-validated');
      contactForm.querySelectorAll(':invalid')[0]?.focus();
      return;
    }

    const honeypot = contactForm.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    const btnLabel   = submitBtn.querySelector('.btn-label');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnLabel.classList.add('d-none');
    btnLoading.classList.remove('d-none');
    submitBtn.disabled = true;
    formSuccess.classList.add('d-none');
    formError.classList.add('d-none');

    try {
      const data     = new FormData(contactForm);
      const endpoint = contactForm.getAttribute('action');

      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        contactForm.reset();
        contactForm.classList.remove('was-validated');
        formSuccess.classList.remove('d-none');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        const json = await res.json().catch(() => ({}));
        console.error('Formspree error:', json);
        formError.classList.remove('d-none');
      }
    } catch (err) {
      console.error('Network error:', err);
      formError.classList.remove('d-none');
    } finally {
      btnLabel.classList.remove('d-none');
      btnLoading.classList.add('d-none');
      submitBtn.disabled = false;
    }
  });
}

if (canvas && ctx) {
  const particles    = [];
  const PARTICLE_COUNT = window.matchMedia('(max-width: 768px)').matches ? 40 : 70;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        radius: Math.random() * 1.6 + 0.4,
        speedX: (Math.random() - 0.5) * 0.22,
        speedY: (Math.random() - 0.5) * 0.22,
        alpha:  Math.random() * 0.38 + 0.12,
      });
    }
  }

  let animId;
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > canvas.width)  p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,173,197,${p.alpha})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(drawParticles);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      drawParticles();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      createParticles();
    }, 200);
  }, { passive: true });

  resizeCanvas();
  createParticles();
  drawParticles();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(animId);
    canvas.style.display = 'none';
  }
}

(function () {
  const navbarMenu    = document.getElementById('navbarMenu');
  const navbarToggler = document.querySelector('.navbar-toggler');

  if (!navbarMenu || !navbarToggler) return;

  function openMenu() {
    navbarMenu.classList.add('show');
    navbarToggler.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    navbarMenu.classList.remove('show');
    navbarToggler.setAttribute('aria-expanded', 'false');
  }

  function isMobile() {
    return window.innerWidth < 992;
  }

  navbarToggler.addEventListener('click', (e) => {
    if (!isMobile()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const isOpen = navbarMenu.classList.contains('show');
    isOpen ? closeMenu() : openMenu();
  }, true);

  navbarMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (isMobile() && navbarMenu.classList.contains('show')) closeMenu();
    });
  });

  navbarMenu.addEventListener('click', (e) => {
    const actionable = e.target.closest('a, button');
    if (actionable && isMobile() && navbarMenu.classList.contains('show')) {
      closeMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (isMobile() && navbarMenu.classList.contains('show') &&
        !navbarMenu.contains(e.target) && !navbarToggler.contains(e.target)) {
      closeMenu();
    }
  });
})();


const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('main > section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-50% 0px -45% 0px' });

sections.forEach((s) => sectionObserver.observe(s));