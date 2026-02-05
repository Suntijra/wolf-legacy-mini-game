// Prevent iOS Safari gestures that interfere with game controls
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// Prevent double-tap to zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Prevent pinch zoom with more aggressive approach
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent pull-to-refresh on the entire document
let startY = 0;
document.addEventListener('touchstart', (e) => {
  startY = e.touches[0].pageY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  const y = e.touches[0].pageY;
  // Check if we're at the top and trying to pull down
  if (document.documentElement.scrollTop === 0 && y > startY) {
    e.preventDefault();
  }
}, { passive: false });

console.log('🎮 Mobile game optimizations loaded - gestures disabled');
