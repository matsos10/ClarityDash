// ===== Countdown Timer =====
function initCountdown(endTime, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const key = 'cd_end_' + elementId;
  let end = localStorage.getItem(key);
  if (!end) {
    end = Date.now() + endTime;
    localStorage.setItem(key, end);
  }
  end = parseInt(end);

  function update() {
    const diff = end - Date.now();
    if (diff <= 0) {
      el.querySelector('[data-h]').textContent = '00';
      el.querySelector('[data-m]').textContent = '00';
      el.querySelector('[data-s]').textContent = '00';
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.querySelector('[data-h]').textContent = String(h).padStart(2, '0');
    el.querySelector('[data-m]').textContent = String(m).padStart(2, '0');
    el.querySelector('[data-s]').textContent = String(s).padStart(2, '0');
    requestAnimationFrame(update);
  }
  update();
}

// ===== FAQ Accordion =====
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');
      document.querySelectorAll('.faq-question').forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });
}

// ===== Smooth Scroll CTA =====
function initSmoothScroll() {
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = document.querySelector(el.dataset.scroll);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== Form Validation =====
function initForms() {
  document.querySelectorAll('form[data-funnel]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.textContent = 'Traitement en cours...';
      btn.disabled = true;
      const next = form.dataset.next;
      setTimeout(() => { if (next) window.location.href = next; }, 1400);
    });
  });
}

// ===== Scroll Reveal =====
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initFaq();
  initSmoothScroll();
  initForms();
  initReveal();

  // Page-specific countdown
  if (document.getElementById('countdown-main')) {
    initCountdown(2 * 3600000, 'countdown-main'); // 2 hours
  }
  if (document.getElementById('countdown-upsell')) {
    initCountdown(15 * 60000, 'countdown-upsell'); // 15 minutes
  }
});
