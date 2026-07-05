/* main.js - animations and interactivity for Bzza Projects Hub */
(function () {
  'use strict';

  /* ===== Scroll animations ===== */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-in');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ===== Nav scroll effect ===== */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  /* ===== Progress bar animation ===== */
  function animateProgress() {
    var bar = document.querySelector('.progress-bar');
    if (!bar) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          bar.style.width = '45%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(bar);
  }

  /* ===== Typing animation for hero ===== */
  var typewriterDone = false;
  function initTypewriter() {
    if (typewriterDone) return;
    typewriterDone = true;
    var phrases = [
      'Innovating the Future',
      'Building Amazing Products',
      'Empowering Developers',
      'Open Source First'
    ];
    var el = document.getElementById('typer');
    if (!el) return;

    var phraseIdx = 0;
    var charIdx = 0;
    var deleting = false;
    var pauseTime = 3000;

    function getPhrases() {
      if (window.__I18N__ && window.__I18N__['hero.sub']) {
        var sub = window.__I18N__['hero.sub'];
        return [sub, 'Innovating the Future', 'Building Amazing Products', 'Empowering Developers', 'Open Source First'];
      }
      return phrases;
    }

    function type() {
      var allPhrases = getPhrases();
      var current = allPhrases[phraseIdx % allPhrases.length];
      if (!deleting) {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(type, pauseTime);
          return;
        }
        setTimeout(type, 150);
      } else {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx++;
          setTimeout(type, 500);
          return;
        }
        setTimeout(type, 80);
      }
    }
    setTimeout(type, 1500);
  }

  /* ===== Particle effect on hero ===== */
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = 50;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        o: Math.random() * 0.5 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108, 92, 231, ' + p.o + ')';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      /* Draw connections */
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(108, 92, 231, ' + (0.15 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ===== Boot ===== */
  function boot() {
    initScrollAnimations();
    initNavScroll();
    animateProgress();
    initTypewriter();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Re-run typewriter on language change */
  document.addEventListener('languagechange', function () {
    typewriterDone = false;
    setTimeout(initTypewriter, 100);
  });
})();
