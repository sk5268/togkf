document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            header.classList.toggle('nav-active');
        });
    }

    document.querySelectorAll('.nav-links li a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        header.classList.remove('nav-active');
    }));

    // Navbar Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');

    window.initLightbox = function () {
        if (!lightbox) return;

        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        const triggers = document.querySelectorAll('.lightbox-trigger');

        let currentIndex = 0;
        let images = [];

        // Rebuild images array
        images = Array.from(triggers).map(img => ({
            src: img.src,
            alt: img.alt,
            caption: img.nextElementSibling ? img.nextElementSibling.textContent : ''
        }));

        // Hide navigation buttons if there is 1 or fewer images
        if (images.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'block';
            if (nextBtn) nextBtn.style.display = 'block';
        }

        const openLightbox = (index) => {
            currentIndex = index;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt;
            lightboxCaption.textContent = images[currentIndex].caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scrolling
        };

        const showNext = () => {
            if (images.length === 0) return;
            currentIndex = (currentIndex + 1) % images.length;
            updateLightbox();
        };

        const showPrev = () => {
            if (images.length === 0) return;
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightbox();
        };

        const updateLightbox = () => {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = images[currentIndex].src;
                lightboxImg.alt = images[currentIndex].alt;
                lightboxCaption.textContent = images[currentIndex].caption;
                lightboxImg.style.opacity = '1';
            }, 200);
        };

        // Remove old listeners (cloning is a sledgehammer way, but simplest for this context to ensure no duplicate listeners if run multiple times on same elements, though here we expect new elements)
        // Actually, if we are calling this after DOM change, we assume new elements. 
        // But the static controls (close, next, prev) will get double listeners if we aren't careful.

        // Better approach: Assign listeners to static elements ONLY ONCE.
        // But this function might be called multiple times.
        // Let's us a flag or checking if listener is attached is hard.
        // We will just clear triggers listeners by assumption they are new.
        // For static buttons, we should move them OUT of this function or check a flag.

        triggers.forEach((trigger, index) => {
            // It's safe to add listener to new elements.
            trigger.onclick = () => openLightbox(index); // using onclick property overrides previous, preventing duplicates easily
        });

        // Static elements: ensure we don't duplicate listeners
        if (!lightbox.hasAttribute('data-listeners-attached')) {
            closeBtn.addEventListener('click', closeLightbox);

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showNext();
            });

            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showPrev();
            });

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });

            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('active')) return;

                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') showNext();
                if (e.key === 'ArrowLeft') showPrev();
            });

            // Add subtle transition for image change
            lightboxImg.style.transition = 'opacity 0.3s ease';

            lightbox.setAttribute('data-listeners-attached', 'true');
        }
    };

    // Initial call
    window.initLightbox();

});
