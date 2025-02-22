/**
 * YouTube Picture-in-Picture Button
 * Adds a PiP button to YouTube's video player controls
 * @version 1.0.0
 */

(function() {
    // Configuration constants
    const CONFIG = {
        SELECTORS: {
            RIGHT_CONTROLS: '.ytp-right-controls',
            VIDEO: 'video.html5-main-video',
            PIP_BUTTON: '.pip-button',
            FULLSCREEN_BUTTON: '.ytp-fullscreen-button'
        },
        RETRY: {
            MAX_ATTEMPTS: 20,
            INTERVAL: 250,
            DEBOUNCE_DELAY: 250
        },
        BUTTON: {
            WIDTH: '36px',
            HEIGHT: '36px',
            PADDING: '8px'
        }
    };

    // SVG icon for the PiP button (matches YouTube's style)
    const PIP_ICON = `
        <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
            <path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L15,25 L15,15 L29,15 L29,25 L29,25 Z M12,7 L33,7 L33,27 L12,27 L12,7 L12,7 Z" 
                  fill="#fff"/>
        </svg>`;

    /**
     * Utility function to create an SVG element safely
     * @returns {SVGElement}
     */
    function createSVGElement() {
        const div = document.createElement('div');
        div.innerHTML = PIP_ICON.trim();
        return div.firstChild;
    }

    /**
     * Check if Picture-in-Picture is supported
     * @returns {boolean}
     */
    function isPiPSupported() {
        return document.pictureInPictureEnabled && 
               !!document.createElement('video').requestPictureInPicture;
    }

    /**
     * Utility function to debounce function calls
     * @param {Function} fn 
     * @param {number} delay 
     * @returns {Function}
     */
    function debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }

    /**
     * Set button attributes and styling
     * @param {HTMLButtonElement} button 
     */
    function setupButton(button) {
        // Set attributes
        button.className = 'ytp-button pip-button';
        button.setAttribute('title', 'Picture-in-Picture');
        button.setAttribute('aria-label', 'Picture-in-Picture');
        button.setAttribute('data-tooltip-target-id', 'ytp-pip-button');

        // Set styles
        Object.assign(button.style, {
            width: CONFIG.BUTTON.WIDTH,
            height: CONFIG.BUTTON.HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            verticalAlign: 'top',
            opacity: '1',
            visibility: 'visible',
            position: 'relative',
            zIndex: '1000',
            background: 'transparent',
            border: 'none',
            margin: '0',
            padding: CONFIG.BUTTON.PADDING,
            cursor: 'pointer',
            outline: 'none'
        });

        // Add SVG icon
        button.appendChild(createSVGElement());
    }

    /**
     * Handle PiP button click
     * @param {HTMLVideoElement} video 
     * @returns {Function}
     */
    function createClickHandler(video) {
        return async (e) => {
            e.stopPropagation();
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                    console.log('Exited PiP mode');
                } else if (document.pictureInPictureEnabled) {
                    await video.requestPictureInPicture();
                    console.log('Entered PiP mode');
                }
            } catch (err) {
                console.error('PiP Error:', err);
            }
        };
    }

    /**
     * Create and return a configured PiP button
     * @param {HTMLVideoElement} video 
     * @returns {HTMLButtonElement}
     */
    function createPiPButton(video) {
        const button = document.createElement('button');
        setupButton(button);
        button.addEventListener('click', createClickHandler(video));
        return button;
    }

    /**
     * Add PiP button to YouTube player controls
     */
    function addPiPButtonToYouTube() {
        const { SELECTORS, RETRY } = CONFIG;
        let attempts = 0;

        const checkForControls = setInterval(() => {
            attempts++;
            const rightControls = document.querySelector(SELECTORS.RIGHT_CONTROLS);
            const video = document.querySelector(SELECTORS.VIDEO);
            
            if (rightControls && video && !document.querySelector(SELECTORS.PIP_BUTTON)) {
                clearInterval(checkForControls);
                
                const pipButton = createPiPButton(video);
                const fullscreenButton = rightControls.querySelector(SELECTORS.FULLSCREEN_BUTTON);
                
                if (fullscreenButton) {
                    rightControls.insertBefore(pipButton, fullscreenButton);
                } else {
                    rightControls.appendChild(pipButton);
                }
            } else if (attempts >= RETRY.MAX_ATTEMPTS) {
                clearInterval(checkForControls);
                console.log('Failed to add PiP button: Maximum attempts reached');
            }
        }, RETRY.INTERVAL);
    }

    /**
     * Initialize the script
     */
    function init() {
        if (!isPiPSupported()) {
            console.log('Picture-in-Picture is not supported in this browser');
            return;
        }

        // Initial button addition
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            addPiPButtonToYouTube();
        } else {
            document.addEventListener('DOMContentLoaded', addPiPButtonToYouTube);
        }

        // Handle dynamic page updates
        const observer = new MutationObserver(
            debounce(() => {
                const { SELECTORS } = CONFIG;
                if (!document.querySelector(SELECTORS.PIP_BUTTON) && 
                    document.querySelector(SELECTORS.RIGHT_CONTROLS)) {
                    addPiPButtonToYouTube();
                }
            }, CONFIG.RETRY.DEBOUNCE_DELAY)
        );

        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        // Cleanup on page unload
        window.addEventListener('unload', () => observer.disconnect());
    }

    // Start the script
    init();
})();