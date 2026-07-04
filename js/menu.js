/**
 * FOODIE - MENU & OFFERS FILTERING SCRIPTS
 * Smooth card transitions when switching categories independently
 */

document.addEventListener('DOMContentLoaded', () => {
  initFilters('menu');
  initFilters('offers');
});

/**
 * Filter items within a specific section with smooth fade transitions
 * @param {string} sectionId - The ID of the container section
 */
function initFilters(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const filterBtns = section.querySelectorAll('.filter-btn');
  const cards = section.querySelectorAll('.menu-card');

  if (filterBtns.length === 0 || cards.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      // Update active button state within this section only
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Check if user prefers reduced motion (if so, skip animations)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
        return;
      }

      // Animate filter
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const isMatch = filterValue === 'all' || category === filterValue;

        if (isMatch) {
          // If hidden, prepare for fade-in
          if (card.classList.contains('hidden')) {
            card.classList.remove('hidden');
            // Force browser reflow to register the removal of 'hidden' before transitioning
            void card.offsetWidth; 
          }
          
          card.classList.remove('fade-out');
          card.classList.add('fade-in');
        } else {
          // Fade out mismatching items
          card.classList.remove('fade-in');
          card.classList.add('fade-out');

          // Wait for transition to complete before hiding layout
          if (card.timeoutId) {
            clearTimeout(card.timeoutId);
          }

          card.timeoutId = setTimeout(() => {
            if (card.classList.contains('fade-out')) {
              card.classList.add('hidden');
            }
          }, 300); // Matches CSS transition-duration (300ms)
        }
      });
    });
  });
}
