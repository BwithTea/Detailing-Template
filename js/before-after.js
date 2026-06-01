// ============================================
//   BEFORE / AFTER SLIDER
//   
//   How the drag logic works:
//   1. User clicks/touches the slider container
//   2. We calculate where on the slider they clicked
//      as a percentage (0% = far left, 100% = far right)
//   3. We update the clip-path on the "after" image
//      to reveal that percentage of the image
//   4. We move the handle line to match
//   5. We do this on mousemove/touchmove for smoothness
// ============================================

function initSliders() {
  // Find all sliders on the page
  const sliders = document.querySelectorAll('.ba-slider');

  sliders.forEach(slider => {
    const afterImg = slider.querySelector('.ba-after');
    const handle   = slider.querySelector('.ba-handle');

    let isDragging = false;

    // Helper: calculate position as percentage from left
    function getPercent(clientX) {
      const rect    = slider.getBoundingClientRect();
      const x       = clientX - rect.left;         // pixels from left edge
      const percent = (x / rect.width) * 100;      // convert to percentage
      return Math.min(Math.max(percent, 2), 98);   // clamp between 2% and 98%
    }

    // Helper: update the visual position of handle + clip
    function setPosition(percent) {
      // clip-path cuts off the right side of the "after" image
      // inset(top right bottom left)
      afterImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left       = `${percent}%`;
    }

    // Mouse events
    slider.addEventListener('mousedown', e => {
      isDragging = true;
      setPosition(getPercent(e.clientX));
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      setPosition(getPercent(e.clientX));
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events (mobile)
    slider.addEventListener('touchstart', e => {
      isDragging = true;
      setPosition(getPercent(e.touches[0].clientX));
    });

    window.addEventListener('touchmove', e => {
      if (!isDragging) return;
      setPosition(getPercent(e.touches[0].clientX));
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

// Run after DOM is ready
initSliders();