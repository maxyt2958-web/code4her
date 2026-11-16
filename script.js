/* ===== SAHAYAK - Interactive Scripts ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== PARTICLE BACKGROUND =====
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = 0, mouseY = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 270 : 330; // purple or pink
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `'rgba(255, 255, 255, ' + (this.opacity * 0.2) + ')'`;
      ctx.fill();
    }
  }

  // Create particles
  const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // Track mouse for future interactive features
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });


  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


  // ===== MOBILE MENU TOGGLE =====
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Close menu on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });


  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ===== ACTIVE NAV LINK UPDATE =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = navMenu.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });


  // ===== SCROLL REVEAL (CSS-based, no JS opacity side effects) =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  // ===== ANIMATED COUNTERS =====
  const counterElements = document.querySelectorAll('[data-target]');
  let countersAnimated = new Set();

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated.has(entry.target)) {
        countersAnimated.add(entry.target);
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else if (target >= 1000) {
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      } else {
        el.textContent = Math.floor(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ===== SOS BUTTON (TELEGRAM INTEGRATION) =====
  const sosBtn = document.getElementById('sosBtn');
  if (sosBtn) {
    sosBtn.addEventListener('click', () => {
      const originalHTML = sosBtn.innerHTML;
      sosBtn.innerHTML = '<i data-lucide="loader"></i> Locating...';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      const sendWebhook = (locationData) => {
        sosBtn.innerHTML = '<i data-lucide="loader"></i> Sending...';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        const botToken = '8724759053:AAE9E_HvRBmqAs7S5AyMtLkwuOoO5dA5S04';
        const chatId = '5999899762';
        let messageText = '🚨 I am in danger!\n\n';
        
        if (locationData.maps_url) {
          messageText += `Location: ${locationData.maps_url}`;
        } else if (locationData.error) {
          messageText += `Location unavailable: ${locationData.error}`;
        }

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            disable_web_page_preview: false
          })
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          sosBtn.innerHTML = '<i data-lucide="check"></i> Sent!';
          if (typeof lucide !== 'undefined') lucide.createIcons();
          setTimeout(() => {
            sosBtn.innerHTML = originalHTML;
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }, 3000);
        })
        .catch(err => {
          console.error('Webhook Error:', err);
          sosBtn.innerHTML = '<i data-lucide="x"></i> Failed';
          if (typeof lucide !== 'undefined') lucide.createIcons();
          setTimeout(() => {
            sosBtn.innerHTML = originalHTML;
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }, 3000);
        });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              maps_url: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
            };
            sendWebhook(locationData);
          },
          (error) => {
            console.error("Location error:", error);
            sendWebhook({ error: error.message, status: "Location access denied or unavailable" });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        sendWebhook({ error: "Geolocation not supported by this browser" });
      }
    });
  }

  // ===== MAP TOGGLE BUTTONS =====
  const mapBtns = document.querySelectorAll('.map-toggle button');
  mapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mapBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });


  // ===== QUICK MESSAGE BUTTONS =====
  const quickMsgBtns = document.querySelectorAll('.quick-msg');
  quickMsgBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.background = 'rgba(255, 255, 255, 0.25)';
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.background = '';
        btn.style.transform = '';
      }, 300);
    });
  });


  // ===== FEATURE CARD GLOW ON HOVER =====
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.06), var(--bg-card-hover))`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

});
