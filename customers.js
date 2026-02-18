/**
 * Kidaflow Customer Success Page - JavaScript
 * Handles scroll animations and interactive elements
 */

// ===== Scroll-based Fade-in Animation =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add slight stagger effect for grid items
                setTimeout(() => {
                    entry.target.classList.add('fade-in-visible');
                }, index * 100);

                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in-up class
    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // ===== Smooth Scroll for Navigation Links =====
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ===== Enhanced Card Interaction =====
    const customerCards = document.querySelectorAll('.customer-card');
    customerCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add subtle tilt effect on hover (optional)
            card.style.transition = 'all 0.3s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });

        // Make entire card clickable
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link
            if (e.target.tagName !== 'A') {
                const link = card.querySelector('.read-more');
                if (link) {
                    window.location.href = link.getAttribute('href');
                }
            }
        });
    });

    // ===== Mobile Menu Toggle =====
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Create overlay element
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);

    if (mobileMenuBtn && navLinks) {
        // Toggle menu
        const toggleMenu = (shouldOpen) => {
            if (shouldOpen) {
                navLinks.classList.add('active');
                menuOverlay.classList.add('active');
                document.body.classList.add('menu-open');
                mobileMenuBtn.innerHTML = '✕';
            } else {
                navLinks.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                mobileMenuBtn.innerHTML = '☰';
            }
        };

        // Menu button click
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navLinks.classList.contains('active');
            toggleMenu(!isActive);
        });

        // Close menu when clicking on a link
        const navLinkItems = navLinks.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Close menu when clicking overlay
        menuOverlay.addEventListener('click', () => {
            toggleMenu(false);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu(false);
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    toggleMenu(false);
                }
            }, 250);
        });
    }

    // ===== Lazy Loading for Images =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===== Parallax Effect for Hero Section (Optional) =====
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
            }
        });
    }

    // ===== Analytics Tracking (Optional) =====
    const trackEvent = (eventName, eventData) => {
        // Placeholder for analytics integration
        // Example: gtag('event', eventName, eventData);
        console.log('Event tracked:', eventName, eventData);
    };

    // Track customer story clicks
    const storyLinks = document.querySelectorAll('.read-more');
    storyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const cardTitle = link.closest('.customer-card')?.querySelector('.customer-quote')?.textContent;
            trackEvent('customer_story_click', {
                story_title: cardTitle,
                story_url: link.getAttribute('href')
            });
        });
    });

    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.btn-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('cta_click', {
                button_text: button.textContent,
                button_location: 'customer_success_page'
            });
        });
    });

    console.log('Kidaflow Customer Success Page initialized successfully! 🚀');
});

// ===== Page Performance Monitoring =====
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page loaded in ${pageLoadTime}ms`);
    }
});
