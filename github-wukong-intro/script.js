/* ================================================================
   美猴王誤入天宮 — Interactive Engine
   Particles, Scroll Effects, Animations
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticleSystem();
    initScrollReveal();
    initNavigation();
    initParallax();
    initSkillLevels();
    initCounterAnimation();
    initCursorTrail();
    initCardGlow();
});

/* ================================================================
   1. Golden Particle System (Canvas)
   ================================================================ */

function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let embers = [];
    const PARTICLE_COUNT = 60;
    const EMBER_COUNT = 25;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.15 - 0.1;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.opacitySpeed = Math.random() * 0.005 + 0.002;
            this.opacityDir = 1;
            this.hue = 38 + Math.random() * 15;    // gold range
            this.saturation = 65 + Math.random() * 20;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Twinkle
            this.opacity += this.opacitySpeed * this.opacityDir;
            if (this.opacity >= 0.6) this.opacityDir = -1;
            if (this.opacity <= 0.05) this.opacityDir = 1;

            // Reset if out of bounds
            if (this.y < -10 || this.y > canvas.height + 10 ||
                this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
                this.y = canvas.height + 10;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, 65%, ${this.opacity})`;
            ctx.fill();

            // Glow
            if (this.size > 1) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, 65%, ${this.opacity * 0.15})`;
                ctx.fill();
            }
        }
    }

    class Ember {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = -(Math.random() * 0.8 + 0.3);
            this.life = 1;
            this.decay = Math.random() * 0.003 + 0.001;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.wobble += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobble) * 0.3;
            this.y += this.speedY;
            this.life -= this.decay;

            if (this.life <= 0) {
                this.reset();
            }
        }

        draw() {
            const alpha = this.life * 0.6;
            // Inner bright core
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(45, 100%, 80%, ${alpha})`;
            ctx.fill();

            // Outer glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(30, 80%, 50%, ${alpha * 0.2})`;
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
    for (let i = 0; i < EMBER_COUNT; i++) {
        embers.push(new Ember());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        embers.forEach(e => {
            e.update();
            e.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ================================================================
   2. Scroll Reveal (IntersectionObserver)
   ================================================================ */

function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ================================================================
   3. Navigation - Active State on Scroll
   ================================================================ */

function initNavigation() {
    const sections = document.querySelectorAll('.realm');
    const navNodes = document.querySelectorAll('.nav-node');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navNodes.forEach(node => {
                    node.classList.toggle('active', node.dataset.section === id);
                });
            }
        });
    }, {
        // Active = the section crossing the middle of the viewport (works for sections taller than the screen)
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));

    // Smooth scroll on nav click
    navNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(node.dataset.section);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ================================================================
   4. Parallax Background Movement
   ================================================================ */

function initParallax() {
    const realms = document.querySelectorAll('.realm');

    // Subtle mouse-based parallax on hero
    const gateSection = document.querySelector('.realm-gate');
    if (gateSection) {
        const gateBg = gateSection.querySelector('.realm-bg');
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            if (gateBg) {
                gateBg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
            }
        });
    }

    // Scroll-based parallax for all backgrounds
    window.addEventListener('scroll', () => {
        realms.forEach(realm => {
            const bg = realm.querySelector('.realm-bg');
            if (!bg || bg.classList.contains('realm-bg-dark')) return;

            const rect = realm.getBoundingClientRect();
            const scrolled = rect.top / window.innerHeight;
            const parallaxY = scrolled * 40;

            bg.style.transform = `translateY(${parallaxY}px) scale(1.05)`;
        });
    }, { passive: true });
}

/* ================================================================
   5. Skill Orb Levels (CSS custom property)
   ================================================================ */

function initSkillLevels() {
    const orbs = document.querySelectorAll('.skill-orb');
    orbs.forEach(orb => {
        const level = orb.dataset.level || 0;
        orb.style.setProperty('--level', level);
    });
}

/* ================================================================
   6. Counter Animation (Stats)
   ================================================================ */

function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                animateCounter(el, 0, target, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(el, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * eased);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ================================================================
   7. Cursor Trail Effect
   ================================================================ */

function initCursorTrail() {
    // Only on desktop
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const trail = document.createElement('div');
    trail.classList.add('cursor-trail');
    document.body.appendChild(trail);

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateTrail() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;

        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';

        requestAnimationFrame(updateTrail);
    }

    updateTrail();
}

/* ================================================================
   8. Card Glow Follow Effect
   ================================================================ */

function initCardGlow() {
    const cards = document.querySelectorAll('.about-card, .project-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const glow = card.querySelector('.card-glow, .project-ember');
            if (glow && glow.classList.contains('card-glow')) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 168, 67, 0.08) 0%, transparent 50%)`;
                glow.style.opacity = '1';
            }

            // Subtle 3D tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -3;
            const rotateY = (x - centerX) / centerX * 3;

            card.style.transform = `translateY(-4px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.opacity = '0';
            }
        });
    });
}

/* ================================================================
   9. Typing Effect for Gate Subtitle (optional enhancement)
   ================================================================ */

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/* ================================================================
   10. Audio Toggle (placeholder — no actual audio file)
   ================================================================ */

document.getElementById('audio-toggle')?.addEventListener('click', function() {
    const onIcon = this.querySelector('.audio-on');
    const offIcon = this.querySelector('.audio-off');

    if (onIcon.style.display !== 'none') {
        onIcon.style.display = 'none';
        offIcon.style.display = 'block';
    } else {
        onIcon.style.display = 'block';
        offIcon.style.display = 'none';
    }
});

/* ================================================================
   11. Smooth Section Transitions on Scroll
   ================================================================ */

(function() {
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollEffects();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    function updateScrollEffects() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // Fade out hero content as user scrolls
        const gateContent = document.querySelector('.gate-content');
        if (gateContent) {
            const fadeStart = 0;
            const fadeEnd = vh * 0.5;
            const progress = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
            gateContent.style.opacity = 1 - progress;
            gateContent.style.transform = `translateY(${progress * 50}px)`;
        }

        // Update fog layers based on scroll
        const fogLayers = document.querySelectorAll('.fog-layer');
        fogLayers.forEach((layer, i) => {
            const speed = (i + 1) * 0.02;
            layer.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }
})();
