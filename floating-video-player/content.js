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

    /**
     * Utility function to create an SVG element safely
     * @returns {SVGElement}
     */
    async function createSVGElement() {
        const response = await fetch(chrome.runtime.getURL('images/pip-icon.svg'));
        const svgText = await response.text();
        const div = document.createElement('div');
        div.innerHTML = svgText.trim();
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
    async function setupButton(button) {
        // Set attributes
        button.className = 'ytp-button pip-button';
        button.setAttribute('title', 'Picture-in-Picture');
        button.setAttribute('aria-label', 'Picture-in-Picture');
        button.setAttribute('data-tooltip-target-id', 'ytp-pip-button');

        try {
            // Add SVG icon
            const svgIcon = await createSVGElement();
            if (!svgIcon) {
                throw new Error('SVG icon could not be created');
            }
            button.appendChild(svgIcon);
        } catch (error) {
            console.error('Error adding SVG icon:', error);
            // Fallback to text if SVG fails
            button.textContent = 'PiP';
        }
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
     * @returns {Promise<HTMLButtonElement>}
     */
    async function createPiPButton(video) {
        const button = document.createElement('button');
        await setupButton(button);
        button.addEventListener('click', createClickHandler(video));
        return button;
    }

    /**
     * Add PiP button to YouTube player controls
     */
    function addPiPButtonToYouTube() {
        const { SELECTORS, RETRY } = CONFIG;
        let attempts = 0;

        // First check if button already exists to avoid duplicates
        if (document.querySelector(SELECTORS.PIP_BUTTON)) {
            console.log('PiP button already exists, not adding another one');
            return;
        }

        const checkForControls = setInterval(async () => {
            attempts++;
            const rightControls = document.querySelector(SELECTORS.RIGHT_CONTROLS);
            const video = document.querySelector(SELECTORS.VIDEO);
            
            // Double-check that the button doesn't already exist before adding
            if (rightControls && video && !document.querySelector(SELECTORS.PIP_BUTTON)) {
                clearInterval(checkForControls);
                
                try {
                    const pipButton = await createPiPButton(video);
                    const fullscreenButton = rightControls.querySelector(SELECTORS.FULLSCREEN_BUTTON);
                    
                    // Final check before insertion to prevent race conditions
                    if (!document.querySelector(SELECTORS.PIP_BUTTON)) {
                        if (fullscreenButton) {
                            rightControls.insertBefore(pipButton, fullscreenButton);
                        } else {
                            rightControls.appendChild(pipButton);
                        }
                        console.log('PiP button added successfully');
                    }
                } catch (err) {
                    console.error('Error creating PiP button:', err);
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

        // Use debounce to prevent multiple rapid calls to addPiPButtonToYouTube
        const debouncedAddButton = debounce(() => {
            const { SELECTORS } = CONFIG;
            if (!document.querySelector(SELECTORS.PIP_BUTTON) && 
                document.querySelector(SELECTORS.RIGHT_CONTROLS)) {
                addPiPButtonToYouTube();
            }
        }, CONFIG.RETRY.DEBOUNCE_DELAY);

        // Handle dynamic page updates
        const observer = new MutationObserver(() => {
            debouncedAddButton();
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        // Cleanup on page unload
        window.addEventListener('unload', () => observer.disconnect());

        // Add a keydown event listener for the shortcut
        document.addEventListener('keydown', (event) => {
            // Prevent default action if the key is 'P'
            if (event.key === 'p' || event.key === 'P') {
                event.preventDefault(); // Prevent any default action
                const video = document.querySelector(CONFIG.SELECTORS.VIDEO);
                if (video) {
                    createClickHandler(video)(); // Trigger the PiP function
                    video.focus(); // Focus the video element
                }
            }
        });
    }

    // Start the script
    init();
})();