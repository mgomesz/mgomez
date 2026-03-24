function closeAllMenus() {
  document.querySelectorAll('.has-sub.open').forEach(item => {
    item.classList.remove('open');

    const toggle = item.querySelector(':scope > .dd-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function disableHoverTemporarily() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  nav.classList.add('no-hover');

  setTimeout(() => {
    nav.classList.remove('no-hover');
  }, 300);
}

function mostrarInicio(e) {
  if (e) e.preventDefault();

  const iframe = document.getElementById('contenido');
  const fondo = document.getElementById('fondo');

  disableHoverTemporarily();
  closeAllMenus();

  if (iframe) {
    iframe.src = '';
    iframe.classList.add('oculto');
  }

  if (fondo) {
    fondo.classList.remove('oculto');
  }
}

function cargarContenido(url, e) {
  if (e) e.preventDefault();

  const iframe = document.getElementById('contenido');
  const fondo = document.getElementById('fondo');

  disableHoverTemporarily();
  closeAllMenus();

  if (iframe) {
    iframe.src = url;
    iframe.classList.remove('oculto');
  }

  if (fondo) {
    fondo.classList.add('oculto');
  }
}

document.querySelectorAll('.has-sub > .dd-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    const item = toggle.parentElement;
    const submenu = item.querySelector(':scope > .submenu');

    if (!submenu) return;

    // En escritorio funciona por hover
    if (window.innerWidth > 900) return;

    e.preventDefault();
    e.stopPropagation();

    const isOpen = item.classList.contains('open');

    item.parentElement.querySelectorAll(':scope > .has-sub').forEach(sibling => {
      if (sibling !== item) {
        sibling.classList.remove('open');

        const siblingToggle = sibling.querySelector(':scope > .dd-toggle');
        if (siblingToggle) {
          siblingToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    item.classList.toggle('open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) {
    closeAllMenus();
  }
});

document.querySelectorAll('.submenu a').forEach(link => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href') || '';

    if (href !== '#' && href.trim() !== '') {
      disableHoverTemporarily();
      closeAllMenus();
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btnInicio = document.getElementById('btnInicio');

  if (btnInicio) {
    btnInicio.addEventListener('click', mostrarInicio);
  }
});