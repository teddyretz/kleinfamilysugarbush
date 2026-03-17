const hamburger = document.querySelector('.nav__hamburger');
const links = document.querySelector('.nav__links');

if (hamburger && links) {
  hamburger.addEventListener('click', () => {
    links.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', links.classList.contains('open'));
  });
}
