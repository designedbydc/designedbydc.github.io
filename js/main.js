/**
 * designedbyDC - Main JavaScript
 */

// DOM elements
const body = document.body;
const loader = document.querySelector('.loader');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize application
 */
function initializeApp() {
    // Set up loader and fade in
    setTimeout(() => {
        body.style.opacity = 1; // Fade in the body
        setTimeout(() => {
            loader.style.display = 'none'; // Hide loader after fade in
        }, 500);
    }, 1000);

    // Add scroll listener for future scroll animations
    window.addEventListener('scroll', handleScroll);
    
    // Handle any buttons with smooth scroll functionality
    const scrollButtons = document.querySelectorAll('[data-scroll-target]');
    scrollButtons.forEach(btn => {
        btn.addEventListener('click', handleSmoothScroll);
    });
}

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