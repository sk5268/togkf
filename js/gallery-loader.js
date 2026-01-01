document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gallery-container');
    if (!container || !window.galleryData) return;

    window.galleryData.forEach((event, index) => {
        // Create Section
        const section = document.createElement('section');
        section.className = 'content-section gallery-section fade-in-section';
        section.setAttribute('aria-labelledby', `event-${index}-title`);

        // Create Container
        const innerContainer = document.createElement('div');
        innerContainer.className = 'container';
        section.appendChild(innerContainer);

        // Title
        const title = document.createElement('h2');
        title.id = `event-${index}-title`;
        title.className = 'event-title';
        // Format the title from directory name (checking if it has underscores)
        // "Okinawa Budosai_November_2025" -> "Okinawa Budosai November 2025"
        title.textContent = event.name.replace(/_/g, ' ');
        innerContainer.appendChild(title);

        // Grid
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        grid.setAttribute('role', 'list');
        innerContainer.appendChild(grid);

        // Photos
        event.photos.forEach(photo => {
            const figure = document.createElement('figure');
            figure.className = 'gallery-item';
            figure.setAttribute('role', 'listitem');

            const img = document.createElement('img');
            img.src = `togkf-gallery/${event.folder}/${photo}`;
            img.alt = photo; // Fallback alt
            img.loading = 'lazy';
            img.className = 'lightbox-trigger';

            const caption = document.createElement('figcaption');
            caption.className = 'gallery-caption';
            // Caption is just filename for now, maybe stripped of extension
            caption.textContent = photo.replace(/\.[^/.]+$/, "");

            figure.appendChild(img);
            figure.appendChild(caption);
            grid.appendChild(figure);
        });

        container.appendChild(section);
    });

    // Initialize lightbox after all content is loaded
    if (window.initLightbox) {
        window.initLightbox();
    }
});
