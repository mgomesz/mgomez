/* ============================================================
   CONFIGURACIÓN
============================================================ */

const BREAKPOINT_MOVIL = 900;


/* ============================================================
   DETERMINAR MODO MÓVIL / TABLET
============================================================ */

function esModoMovil() {

  return window.innerWidth <= BREAKPOINT_MOVIL;

}


/* ============================================================
   CERRAR TODOS LOS SUBMENÚS
============================================================ */

function closeAllMenus() {

  document
    .querySelectorAll(".has-sub.open")
    .forEach(item => {

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
   DESACTIVAR HOVER TEMPORALMENTE
============================================================ */

function disableHoverTemporarily() {

  const nav =
    document.querySelector(".nav");


  if (!nav) {
    return;
  }


  nav.classList.add("no-hover");


  setTimeout(() => {

    nav.classList.remove("no-hover");

  }, 300);

}


/* ============================================================
   ABRIR / CERRAR MENÚ PRINCIPAL MÓVIL
============================================================ */

function toggleMenuMovil() {

  const menu =
    document.getElementById("menu");


  const boton =
    document.getElementById("menuToggle");


  if (!menu || !boton) {
    return;
  }


  const abierto =
    menu.classList.toggle("activo");


  boton.classList.toggle(
    "activo",
    abierto
  );


  boton.setAttribute(
    "aria-expanded",
    String(abierto)
  );


  boton.setAttribute(
    "aria-label",
    abierto
      ? "Cerrar menú de navegación"
      : "Abrir menú de navegación"
  );


  if (!abierto) {

    closeAllMenus();

  }

}


/* ============================================================
   CERRAR MENÚ MÓVIL
============================================================ */

function cerrarMenuMovil() {

  const menu =
    document.getElementById("menu");


  const boton =
    document.getElementById("menuToggle");


  if (menu) {

    menu.classList.remove("activo");

  }


  if (boton) {

    boton.classList.remove("activo");


    boton.setAttribute(
      "aria-expanded",
      "false"
    );


    boton.setAttribute(
      "aria-label",
      "Abrir menú de navegación"
    );

  }


  closeAllMenus();

}


/* ============================================================
   MOSTRAR PÁGINA DE INICIO
============================================================ */

function mostrarInicio(e) {

  if (e) {

    e.preventDefault();

  }


  const iframe =
    document.getElementById("contenido");


  const fondo =
    document.getElementById("fondo");


  disableHoverTemporarily();


  closeAllMenus();


  if (esModoMovil()) {

    cerrarMenuMovil();

  }


  if (iframe) {

    iframe.src = "";

    iframe.classList.add("oculto");

  }


  if (fondo) {

    fondo.classList.remove("oculto");

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


  disableHoverTemporarily();


  closeAllMenus();


  if (esModoMovil()) {

    cerrarMenuMovil();

  }


  if (iframe) {

    iframe.src = url;

    iframe.classList.remove("oculto");

  }


  if (fondo) {

    fondo.classList.add("oculto");

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


          /*
           * En escritorio se conserva
           * el comportamiento mediante hover.
           */

          if (!esModoMovil()) {

            return;

          }


          const item =
            toggle.parentElement;


          const submenu =
            item.querySelector(
              ":scope > .submenu"
            );


          if (!submenu) {

            return;

          }


          e.preventDefault();

          e.stopPropagation();


          const estaAbierto =
            item.classList.contains(
              "open"
            );


          /*
           * Cerrar elementos hermanos
           * del mismo nivel.
           */

          const padre =
            item.parentElement;


          if (padre) {

            padre
              .querySelectorAll(
                ":scope > .has-sub"
              )
              .forEach(sibling => {


                if (sibling !== item) {


                  sibling.classList.remove(
                    "open"
                  );


                  const siblingToggle =
                    sibling.querySelector(
                      ":scope > .dd-toggle"
                    );


                  if (siblingToggle) {

                    siblingToggle.setAttribute(
                      "aria-expanded",
                      "false"
                    );

                  }

                }

              });

          }


          /*
           * Abrir o cerrar seleccionado.
           */

          item.classList.toggle(
            "open",
            !estaAbierto
          );


          toggle.setAttribute(
            "aria-expanded",
            String(!estaAbierto)
          );

        }
      );

    });

}


/* ============================================================
   CLIC FUERA DEL MENÚ
============================================================ */

function configurarClickExterior() {

  document.addEventListener(
    "click",
    e => {


      if (
        !e.target.closest(".nav")
      ) {


        closeAllMenus();


        if (esModoMovil()) {

          cerrarMenuMovil();

        }

      }

    }
  );

}


/* ============================================================
   LINKS DE LOS SUBMENÚS
============================================================ */

function configurarLinksSubmenu() {

  document
    .querySelectorAll(
      ".submenu a"
    )
    .forEach(link => {


      link.addEventListener(
        "click",
        () => {


          /*
           * Si este enlace abre otro
           * submenú, no cerramos todavía.
           */

          if (
            link.classList.contains(
              "dd-toggle"
            )
          ) {

            return;

          }


          const href =
            link.getAttribute("href") || "";


          /*
           * Enlaces normales.
           */

          if (
            href !== "#" &&
            href.trim() !== ""
          ) {


            disableHoverTemporarily();


            closeAllMenus();


            if (esModoMovil()) {

              cerrarMenuMovil();

            }

          }

        }
      );

    });

}


/* ============================================================
   CONTROL DE CAMBIO DE TAMAÑO
============================================================ */

function configurarResize() {

  let ultimoModoMovil =
    esModoMovil();


  window.addEventListener(
    "resize",
    () => {


      const modoActual =
        esModoMovil();


      /*
       * Solamente reiniciamos el menú
       * cuando se cruza el breakpoint.
       */

      if (
        modoActual !== ultimoModoMovil
      ) {


        closeAllMenus();


        const menu =
          document.getElementById(
            "menu"
          );


        const boton =
          document.getElementById(
            "menuToggle"
          );


        if (menu) {

          menu.classList.remove(
            "activo"
          );

        }


        if (boton) {


          boton.classList.remove(
            "activo"
          );


          boton.setAttribute(
            "aria-expanded",
            "false"
          );


          boton.setAttribute(
            "aria-label",
            "Abrir menú de navegación"
          );

        }


        ultimoModoMovil =
          modoActual;

      }

    }
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
        e.key === "Escape"
      ) {


        closeAllMenus();


        if (esModoMovil()) {

          cerrarMenuMovil();

        }

      }

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
       BOTÓN INICIO
    ======================================================== */

    if (btnInicio) {

      btnInicio.addEventListener(
        "click",
        mostrarInicio
      );

    }


    /* ========================================================
       BOTÓN HAMBURGUESA
    ======================================================== */

    if (menuToggle) {

      menuToggle.addEventListener(
        "click",
        e => {


          e.preventDefault();

          e.stopPropagation();


          toggleMenuMovil();

        }
      );

    }


    /* ========================================================
       CONFIGURACIONES
    ======================================================== */

    configurarSubmenus();

    configurarClickExterior();

    configurarLinksSubmenu();

    configurarResize();

    configurarEscape();

  }
);