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


// ============================================
//   GALLERY LIGHTBOX
// ============================================

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80", label: "Ceramic Coating" },
  { src: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&q=80", label: "Full Detail" },
  { src: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80", label: "Paint Correction" },
  { src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80", label: "Exterior Detail" },
  { src: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1200&q=80", label: "Interior Detail" },
  { src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80", label: "Headlight Restore" },
  { src: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80", label: "Ceramic Coating" },
  { src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80", label: "Full Detail" },
  { src: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80", label: "Paint Correction" },
];

let currentPhoto = 0;

function openLightbox(index) {
  currentPhoto = index;
  const lightbox = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = galleryPhotos[index].src;
  document.getElementById('lightboxLabel').textContent = galleryPhotos[index].label;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function prevPhoto(e) {
  e.stopPropagation();
  currentPhoto = (currentPhoto - 1 + galleryPhotos.length) % galleryPhotos.length;
  document.getElementById('lightboxImg').src = galleryPhotos[currentPhoto].src;
  document.getElementById('lightboxLabel').textContent = galleryPhotos[currentPhoto].label;
}

function nextPhoto(e) {
  e.stopPropagation();
  currentPhoto = (currentPhoto + 1) % galleryPhotos.length;
  document.getElementById('lightboxImg').src = galleryPhotos[currentPhoto].src;
  document.getElementById('lightboxLabel').textContent = galleryPhotos[currentPhoto].label;
}

// Close lightbox with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevPhoto(e);
  if (e.key === 'ArrowRight') nextPhoto(e);
});