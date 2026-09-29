/* ============================================================
   CONFIGURACIÓN
============================================================ */

const BREAKPOINT_MOVIL = 900;


/* ============================================================
   DETERMINAR MODO MÓVIL
============================================================ */

function esModoMovil() {

  return window.innerWidth <= BREAKPOINT_MOVIL;

}


/* ============================================================
   ABRIR SIDEBAR
============================================================ */

function abrirSidebar() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("sidebarOverlay");

  const boton =
    document.getElementById("menuToggle");


  if (sidebar) {

    sidebar.classList.add("activo");

  }


  if (overlay) {

    overlay.classList.add("activo");

  }


  if (boton) {

    boton.setAttribute(
      "aria-expanded",
      "true"
    );

    boton.setAttribute(
      "aria-label",
      "Cerrar menú de navegación"
    );

  }


  document.body.style.overflow = "hidden";

}


/* ============================================================
   CERRAR SIDEBAR
============================================================ */

function cerrarSidebar() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("sidebarOverlay");

  const boton =
    document.getElementById("menuToggle");


  if (sidebar) {

    sidebar.classList.remove("activo");

  }


  if (overlay) {

    overlay.classList.remove("activo");

  }


  if (boton) {

    boton.setAttribute(
      "aria-expanded",
      "false"
    );

    boton.setAttribute(
      "aria-label",
      "Abrir menú de navegación"
    );

  }


  document.body.style.overflow = "";

}


/* ============================================================
   ALTERNAR SIDEBAR
============================================================ */

function toggleSidebar() {

  const sidebar =
    document.getElementById("sidebar");


  if (!sidebar) {

    return;

  }


  if (
    sidebar.classList.contains("activo")
  ) {

    cerrarSidebar();

  } else {

    abrirSidebar();

  }

}


/* ============================================================
   CERRAR SUBMENÚS
============================================================ */

function cerrarSubmenus(excepto = null) {

  document
    .querySelectorAll(".has-sub.open")
    .forEach(item => {

      if (item === excepto) {

        return;

      }


      item.classList.remove("open");


      const toggle =
        item.querySelector(
          ":scope > .dd-toggle"
        );


      if (toggle) {

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    });

}


/* ============================================================
   MARCAR OPCIÓN ACTIVA
============================================================ */

function marcarActivo(elemento) {

  document
    .querySelectorAll(
      ".menu a.activo"
    )
    .forEach(link => {

      link.classList.remove("activo");

    });


  if (elemento) {

    elemento.classList.add("activo");

  }

}


/* ============================================================
   MOSTRAR INICIO
============================================================ */

function mostrarInicio(e) {

  if (e) {

    e.preventDefault();

  }


  const iframe =
    document.getElementById("contenido");

  const fondo =
    document.getElementById("fondo");

  const btnInicio =
    document.getElementById("btnInicio");


  cerrarSubmenus();


  marcarActivo(btnInicio);


  if (iframe) {

    iframe.src = "";

    iframe.classList.add("oculto");

  }


  if (fondo) {

    fondo.classList.remove("oculto");

  }


  if (esModoMovil()) {

    cerrarSidebar();

  }

}


/* ============================================================
   CARGAR CONTENIDO EN IFRAME
============================================================ */

function cargarContenido(url, e) {

  if (e) {

    e.preventDefault();

  }


  if (!url) {

    return;

  }


  const iframe =
    document.getElementById("contenido");

  const fondo =
    document.getElementById("fondo");


  let enlace = null;


  if (
    e &&
    e.currentTarget
  ) {

    enlace = e.currentTarget;

  }


  marcarActivo(enlace);


  cerrarSubmenus();


  if (iframe) {

    iframe.src = url;

    iframe.classList.remove("oculto");

  }


  if (fondo) {

    fondo.classList.add("oculto");

  }


  if (esModoMovil()) {

    cerrarSidebar();

  }

}


/* ============================================================
   CONFIGURAR SUBMENÚS
============================================================ */

function configurarSubmenus() {

  document
    .querySelectorAll(
      ".has-sub > .dd-toggle"
    )
    .forEach(toggle => {


      toggle.addEventListener(
        "click",
        e => {

          e.preventDefault();

          e.stopPropagation();


          const item =
            toggle.parentElement;


          if (!item) {

            return;

          }


          const estabaAbierto =
            item.classList.contains(
              "open"
            );


          cerrarSubmenus(item);


          item.classList.toggle(
            "open",
            !estabaAbierto
          );


          toggle.setAttribute(
            "aria-expanded",
            String(!estabaAbierto)
          );

        }
      );

    });

}


/* ============================================================
   LINKS NORMALES
============================================================ */

function configurarLinks() {

  document
    .querySelectorAll(
      ".menu a"
    )
    .forEach(link => {


      if (
        link.classList.contains(
          "dd-toggle"
        )
      ) {

        return;

      }


      link.addEventListener(
        "click",
        () => {


          const onclick =
            link.getAttribute("onclick");


          /*
           * Los enlaces que utilizan
           * cargarContenido() ya se
           * gestionan desde esa función.
           */

          if (
            onclick &&
            onclick.includes(
              "cargarContenido"
            )
          ) {

            return;

          }


          /*
           * Inicio se gestiona desde
           * mostrarInicio().
           */

          if (
            link.id === "btnInicio"
          ) {

            return;

          }


          /*
           * Enlaces externos.
           */

          marcarActivo(link);


          cerrarSubmenus();


          if (esModoMovil()) {

            cerrarSidebar();

          }

        }
      );

    });

}


/* ============================================================
   OVERLAY
============================================================ */

function configurarOverlay() {

  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (!overlay) {

    return;

  }


  overlay.addEventListener(
    "click",
    cerrarSidebar
  );

}


/* ============================================================
   TECLA ESC
============================================================ */

function configurarEscape() {

  document.addEventListener(
    "keydown",
    e => {


      if (
        e.key !== "Escape"
      ) {

        return;

      }


      cerrarSubmenus();


      if (esModoMovil()) {

        cerrarSidebar();

      }

    }
  );

}


/* ============================================================
   CAMBIO DE TAMAÑO
============================================================ */

function configurarResize() {

  let modoAnterior =
    esModoMovil();


  window.addEventListener(
    "resize",
    () => {


      const modoActual =
        esModoMovil();


      if (
        modoActual === modoAnterior
      ) {

        return;

      }


      cerrarSidebar();

      cerrarSubmenus();


      modoAnterior =
        modoActual;

    }
  );

}


/* ============================================================
   INICIALIZAR
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    const btnInicio =
      document.getElementById(
        "btnInicio"
      );


    const menuToggle =
      document.getElementById(
        "menuToggle"
      );


    /* ========================================================
       INICIO
    ======================================================== */

    if (btnInicio) {

      btnInicio.addEventListener(
        "click",
        mostrarInicio
      );


      /*
       * Inicio aparece seleccionado
       * al cargar el sistema.
       */

      btnInicio.classList.add(
        "activo"
      );

    }


    /* ========================================================
       BOTÓN MENÚ MÓVIL
    ======================================================== */

    if (menuToggle) {

      menuToggle.addEventListener(
        "click",
        e => {

          e.preventDefault();

          e.stopPropagation();


          toggleSidebar();

        }
      );

    }


    /* ========================================================
       CONFIGURACIONES
    ======================================================== */

    configurarSubmenus();

    configurarLinks();

    configurarOverlay();

    configurarEscape();

    configurarResize();

  }
);