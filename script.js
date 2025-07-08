document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevents page reload for this example

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to the clicked link
            this.classList.add('active');
        });
    });
});
