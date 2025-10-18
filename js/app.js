document.addEventListener('DOMContentLoaded', () => {
  // === Menú hamburguesa (móvil) ===
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.menu');

  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // === Dropdown por clic para botones de primer nivel ===
  document.querySelectorAll('.has-sub').forEach(item => {
    const btn = item.querySelector('.dd-toggle');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));

      // Cerrar otros del mismo nivel
      if (open) {
        item.parentElement.querySelectorAll(':scope > .has-sub').forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const obtn = other.querySelector(':scope > .dd-toggle, :scope > a[aria-expanded]');
            if (obtn) obtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  });

  // === Toggle por clic para <a> que tienen submenú debajo (cualquier nivel) ===
  document.querySelectorAll('.submenu .has-sub > a').forEach(link => {
    link.addEventListener('click', (e) => {
      const li = link.parentElement;
      const sub = li.querySelector(':scope > .submenu');
      if (sub) {
        e.preventDefault();
        e.stopPropagation();
        const open = li.classList.toggle('open');
        link.setAttribute('aria-expanded', String(open));

        // Cerrar hermanos del mismo nivel
        if (open) {
          li.parentElement.querySelectorAll(':scope > .has-sub').forEach(sib => {
            if (sib !== li) {
              sib.classList.remove('open');
              const sibA = sib.querySelector(':scope > a[aria-expanded], :scope > .dd-toggle');
              if (sibA) sibA.setAttribute('aria-expanded', 'false');
            }
          });
        }
      }
    });
  });

  // === Cerrar todo si el clic fue fuera de la barra de navegación ===
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav')) {
      document.querySelectorAll('.has-sub.open').forEach(item => {
        item.classList.remove('open');
        const btn = item.querySelector('.dd-toggle, a[aria-expanded]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // === Evitar salto de página con enlaces de placeholder "#" (opcional) ===
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

  // === Cerrar menús al seguir un enlace de submenú ===
  function closeAllMenus() {
    document.querySelectorAll('.has-sub.open').forEach(li => {
      li.classList.remove('open');
      const btn = li.querySelector('.dd-toggle, a[aria-expanded]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  document.querySelectorAll('.submenu a').forEach(a => {
    a.addEventListener('click', () => {
      closeAllMenus();
    });
  });
});
