/* ================================================
   Home Page Interactions
   Carousel & Accordion Logic
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initInfiniteScroll();
    initMobileMenu();
    initTilt();
    initFadeIn();
});

/* ===== Scroll-based Fade-in Animation ===== */
function initFadeIn() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(element => {
        observer.observe(element);
    });
}

/* ===== Mobile Menu Toggle ===== */
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('active');
            btn.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        });

        const links = nav.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                btn.innerHTML = '☰';
            });
        });
    }
}

/* ===== Testimonial Carousel ===== */
const initInfiniteScroll = () => {
    const track = document.querySelector('.infinite-scroll-track');
    const container = document.querySelector('.infinite-scroll-wrapper');
    if (!track || !container) return;

    // Clone children to ensure seamless scrolling
    // We duplicate the content enough times to fill width + scroll buffer
    const items = Array.from(track.children);

    items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });

    // Optional: Add another set if content is short
    items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });

    container.classList.add('scrolling-active');
};

/* ===== Coded 3D Tilt & Glass Light Effect ===== */
function initTilt() {
    const cards = document.querySelectorAll('.service-card-3d');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (Slightly higher for more impact)
            const rotateX = ((y - centerY) / centerY) * -20;
            const rotateY = ((x - centerX) / centerX) * 20;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // --- Dynamic Glass Light Reflection ---
            // Create or update a light spot based on mouse position
            let light = card.querySelector('.glass-light');
            if (!light) {
                light = document.createElement('div');
                light.className = 'glass-light';
                card.querySelector('.tilt-inner').appendChild(light);
            }

            const lightX = (x / rect.width) * 100;
            const lightY = (y / rect.height) * 100;

            light.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
            const light = card.querySelector('.glass-light');
            if (light) light.style.background = 'transparent';
        });
    });
}
