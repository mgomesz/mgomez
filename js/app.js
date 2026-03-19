// === Función para cerrar todos los submenús ===
function closeAllMenus() {
  document.querySelectorAll('.has-sub.open').forEach(item => {
    item.classList.remove('open');
    const toggle = item.querySelector(':scope > .dd-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// === Toggle por clic para cualquier enlace con submenú ===
document.querySelectorAll('.has-sub > .dd-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    const item = toggle.parentElement;
    const submenu = item.querySelector(':scope > .submenu');

    if (!submenu) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const isOpen = item.classList.contains('open');

    // Cierra hermanos del mismo nivel
    item.parentElement.querySelectorAll(':scope > .has-sub').forEach(sibling => {
      if (sibling !== item) {
        sibling.classList.remove('open');
        const siblingToggle = sibling.querySelector(':scope > .dd-toggle');
        if (siblingToggle) {
          siblingToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Alterna el actual
    item.classList.toggle('open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
});

// === Cerrar menús al hacer clic fuera de la navegación ===
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) {
    closeAllMenus();
  }
});

// === Cerrar menús al hacer clic en enlaces reales de submenú ===
document.querySelectorAll('.submenu a').forEach(link => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href') || '';

    if (href !== '#' && href.trim() !== '') {
      closeAllMenus();
    }
  });
});