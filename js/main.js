// ============================================
//   NAVIGATION BEHAVIOR
//   Two things happen here:
//   1. Nav becomes solid when user scrolls 20px
//   2. Hamburger toggles mobile menu open/closed
// ============================================

const nav        = document.getElementById('nav');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');

// --- Sticky scroll behavior ---
// Listen for scroll events on the window.
// When user has scrolled more than 20px, add 'scrolled' class.
// That class triggers the solid background in CSS.
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// --- Hamburger toggle ---
// When hamburger is clicked, toggle 'open' on both
// the button (animates to X) and the links (shows them).
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// --- Close menu when a link is clicked ---
// On mobile, clicking a link should close the menu.
// querySelectorAll gets every element with class nav__link.
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});