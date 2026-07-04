/**
 * FOODIE - TESTIMONIAL CAROUSEL SCRIPTS
 * Custom-built slider with touch/drag support and autoplay
 */

document.addEventListener('DOMContentLoaded', () => {
  initTestimonialCarousel();
});

function initTestimonialCarousel() {
  const viewport = document.querySelector('.carousel-viewport');
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.carousel-arrow-prev');
  const nextBtn = document.querySelector('.carousel-arrow-next');
  const dotsContainer = document.querySelector('.carousel-dots');

  if (!viewport || !track || cards.length === 0) return;

  let currentIndex = 0;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  let autoplayInterval;
  let slideWidth = 0;
  let gap = 0;
  let visibleCards = 1;
  let maxIndex = 0;

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Set up indicator dots
  function setupDots() {
    dotsContainer.innerHTML = '';
    const dotsCount = maxIndex + 1;
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Update slide dimensions and constraints
  function updateDimensions() {
    slideWidth = cards[0].getBoundingClientRect().width;
    
    // Read actual gap from the layout
    if (cards.length > 1) {
      gap = cards[1].offsetLeft - (cards[0].offsetLeft + slideWidth);
    } else {
      gap = 0;
    }

    // Determine how many cards are fully/partially visible in viewport
    const viewportWidth = viewport.getBoundingClientRect().width;
    if (viewportWidth >= 1024) {
      visibleCards = 3;
    } else if (viewportWidth >= 768) {
      visibleCards = 2;
    } else {
      visibleCards = 1;
    }

    maxIndex = Math.max(0, cards.length - visibleCards);
    
    // Clamp currentIndex to valid range
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    setupDots();
    goToSlide(currentIndex, false); // Snap without transition
  }

  // Translate track to target index
  function goToSlide(index, animate = true) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    
    // Calculate translation offset
    const translateOffset = -(currentIndex * (slideWidth + gap));
    currentTranslate = translateOffset;
    prevTranslate = translateOffset;

    if (prefersReducedMotion) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${translateOffset}px)`;
    } else {
      track.style.transition = animate ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
      track.style.transform = `translateX(${translateOffset}px)`;
    }

    // Update pagination dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    // Toggle arrow button disabled state
    if (prevBtn && nextBtn) {
      prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
      prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      nextBtn.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
      nextBtn.style.pointerEvents = currentIndex === maxIndex ? 'none' : 'auto';
    }
  }

  // --- Drag & Swipe Handlers (Pointer Event API covers both Mouse and Touch) ---
  function getPositionX(event) {
    return event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
  }

  function startDrag(event) {
    if (event.type === 'mousedown') {
      // Prevent image/text selections during drag
      event.preventDefault();
    }
    isDragging = true;
    startX = getPositionX(event);
    
    // Stop autoplay during drag
    clearInterval(autoplayInterval);
    
    track.style.transition = 'none';
  }

  function drag(event) {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    const diff = currentX - startX;
    
    // Apply dynamic resisting drag at boundary edges (rubbery effect)
    let newTranslate = prevTranslate + diff;
    const minTranslate = -(maxIndex * (slideWidth + gap));
    const maxTranslate = 0;

    if (newTranslate > maxTranslate) {
      newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.3; // Dampen pull
    } else if (newTranslate < minTranslate) {
      newTranslate = minTranslate + (newTranslate - minTranslate) * 0.3;
    }

    currentTranslate = newTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;

    const dragDifference = currentTranslate - prevTranslate;

    // Check if drag exceeded 60px swipe threshold
    if (dragDifference < -60 && currentIndex < maxIndex) {
      goToSlide(currentIndex + 1);
    } else if (dragDifference > 60 && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex); // Snap back to current
    }

    restartAutoplay();
  }

  // --- Autoplay Controls ---
  function startAutoplay() {
    if (prefersReducedMotion || maxIndex === 0) return;
    
    autoplayInterval = setInterval(() => {
      if (currentIndex >= maxIndex) {
        goToSlide(0); // Loop back
      } else {
        goToSlide(currentIndex + 1);
      }
    }, 4500);
  }

  function restartAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  // Initialize event bindings
  window.addEventListener('resize', updateDimensions);
  
  // Touch Event Bindings
  viewport.addEventListener('touchstart', startDrag, { passive: true });
  viewport.addEventListener('touchmove', drag, { passive: true });
  viewport.addEventListener('touchend', endDrag);

  // Mouse Event Bindings
  viewport.addEventListener('mousedown', startDrag);
  viewport.addEventListener('mousemove', drag);
  viewport.addEventListener('mouseup', endDrag);
  viewport.addEventListener('mouseleave', endDrag);

  // Button Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      restartAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      restartAutoplay();
    });
  }

  // Hover pauses autoplay
  viewport.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  viewport.addEventListener('mouseleave', startAutoplay);

  // Trigger initial setup
  setTimeout(updateDimensions, 100);
  startAutoplay();
}
