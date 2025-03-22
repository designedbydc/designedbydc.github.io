/**
 * designedbyDC - Main JavaScript
 */

// DOM elements
const body = document.body;
const loader = document.querySelector('.loader');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Fade in the body and fade out loader
    setTimeout(() => {
        body.style.opacity = 1;
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 500);
});

/**
 * Smooth scroll to target element
 * @param {string} targetId - The ID of the target element
 */
function smoothScroll(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Handle smooth scroll for elements with data-scroll-target attribute
 * @param {Event} e - Click event
 */
function handleSmoothScroll(e) {
    const targetId = e.currentTarget.getAttribute('data-scroll-target');
    if (targetId) {
        smoothScroll(targetId);
    }
}

/**
 * Handle scroll events for animations
 */
function handleScroll() {
    // Add animations or effects based on scroll position
    // Currently unused but prepared for future additions
}

// Handle the "View Projects" button if it exists
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('show-projects')) {
        smoothScroll('projects');
    }
}); 