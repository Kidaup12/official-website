/**
 * 3D Tilt Effect for Service Cards
 * Adapts the 3D interaction logic to static HTML elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card-3d-inner');

    cards.forEach(card => {
        card.parentElement.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation angles (max 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.parentElement.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });
});
