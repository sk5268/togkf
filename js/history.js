// ================================================
// IMMERSIVE SCROLL EXPERIENCE - JAVASCRIPT
// ================================================

document.addEventListener('DOMContentLoaded', () => {


    // Initialize scroll animations
    initScrollAnimations();

    // Initialize progress dots
    initProgressDots();

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});





// ================================================
// SCROLL ANIMATIONS
// ================================================
function initScrollAnimations() {
    const sections = document.querySelectorAll('.history-section, .conclusion-section');
    const sectionTexts = document.querySelectorAll('.section-text');
    const karateElements = document.querySelectorAll('.karate-element');
    const conclusionContent = document.querySelector('.conclusion-content');

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -10% 0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate text
                const text = entry.target.querySelector('.section-text');
                if (text) text.classList.add('visible');

                // Animate karate element
                const karateEl = entry.target.querySelector('.karate-element');
                if (karateEl) karateEl.classList.add('visible');

                // Animate conclusion
                if (entry.target.classList.contains('conclusion-section')) {
                    const content = entry.target.querySelector('.conclusion-content');
                    if (content) content.classList.add('visible');
                }

                // Update progress dots
                const sectionIndex = entry.target.getAttribute('data-section-index');
                updateProgressDots(parseInt(sectionIndex));
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// ================================================
// PROGRESS DOTS
// ================================================
function initProgressDots() {
    const dots = document.querySelectorAll('.progress-dot');
    const sections = document.querySelectorAll('[data-section-index]');

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const sectionIndex = dot.getAttribute('data-section');
            const targetSection = document.querySelector(`[data-section-index="${sectionIndex}"]`);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function updateProgressDots(activeIndex) {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        const dotIndex = parseInt(dot.getAttribute('data-section'));
        if (dotIndex === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// ================================================
// PARALLAX FLOATING KANJI
// ================================================
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const kanjiElements = document.querySelectorAll('.floating-kanji');

    kanjiElements.forEach((kanji, index) => {
        const speed = (index + 1) * 0.05;
        const yPos = scrollY * speed;
        kanji.style.transform = `translateY(${yPos}px) rotate(${scrollY * 0.02}deg)`;
    });

    // Update belt indicator position
    const beltIndicator = document.getElementById('beltIndicator');
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / docHeight;
    const clipValue = 100 - (scrollProgress * 100);
    beltIndicator.style.clipPath = `inset(${clipValue}% 0 0 0)`;
});

// ================================================
// SMOOTH HEADER TRANSITION
// ================================================
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
