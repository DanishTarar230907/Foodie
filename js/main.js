/**
 * FOODIE - MAIN SCRIPTS
 * Sticky header, Mobile Menu, and Scroll Reveals
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initScrollReveals();
});

/**
 * Sticky Header Transition on Scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Run on load in case page is already scrolled
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Mobile Navigation (Hamburger + Slide-in Sidebar)
 */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const links = document.querySelectorAll('.mobile-nav-link, .mobile-nav .btn');

  if (!toggle || !mobileNav || !overlay) return;

  const toggleMenu = () => {
    toggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  };

  const closeMenu = () => {
    toggle.classList.remove('active');
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * Scroll Reveal Animations (using IntersectionObserver)
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Instantly activate all reveal elements if reduced motion is requested
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    root: null, // Viewport
    rootMargin: '0px 0px -60px 0px', // Trigger slightly before element is fully in view
    threshold: 0.1 // Trigger when 10% of element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}
