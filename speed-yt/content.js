// Wait for the YouTube player to load
function waitForPlayer() {
  const player = document.querySelector('.html5-video-player');
  const rightControls = document.querySelector('.ytp-right-controls');
  const video = document.querySelector('video');
  
  if (player && rightControls && video) {
    addSpeedControl(rightControls);
  } else {
    setTimeout(waitForPlayer, 500);
  }
}

// Create and add speed control button
function addSpeedControl(rightControls) {
  // Check if control already exists to avoid duplicates
  if (document.querySelector('.speed-btn')) return;

  const video = document.querySelector('video');
  const settingsButton = document.querySelector('.ytp-settings-button');
  
  if (!rightControls || !settingsButton) {
    console.log('Right controls or settings button not found');
    return;
  }

  // Create single button (no container div)
  const button = document.createElement('button');
  button.className = 'speed-btn';
  
  // Speed options array
  const speeds = [1, 1.5, 2];
  let currentIndex = speeds.indexOf(video.playbackRate) !== -1 ? 
    speeds.indexOf(video.playbackRate) : 0;
  
  // Set initial text
  button.textContent = `${video.playbackRate}x`;

  // Click handler to cycle through speeds
  button.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[currentIndex];
    video.playbackRate = newSpeed;
    button.textContent = `${newSpeed}x`;
  });

  // Add event listener to track YouTube's native speed changes
  video.addEventListener('ratechange', () => {
    // Update button text to match current playback rate
    button.textContent = `${video.playbackRate}x`;
    
    // Update currentIndex if the new speed is in our speeds array
    const newIndex = speeds.indexOf(video.playbackRate);
    if (newIndex !== -1) {
      currentIndex = newIndex;
    }
  });

  try {
    // Insert speed control before the settings button
    rightControls.insertBefore(button, settingsButton);
  } catch (error) {
    console.log('Error inserting speed control:', error);
    rightControls.appendChild(button);
  }
}

// Start the extension
waitForPlayer();

// Listen for video changes (for YouTube's single-page navigation)
const observer = new MutationObserver(() => {
  waitForPlayer();
});
observer.observe(document.body, { childList: true, subtree: true });