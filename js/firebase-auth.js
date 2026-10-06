/* ============================================================
   FIREBASE AUTHENTICATION
   AUXILIAR ADMINISTRATIVO

   ROLES:

   lqg        -> Administrador
   estudiante -> Estudiante

   SEGURIDAD DE SESIÓN:

   - La sesión se conserva solamente durante la pestaña actual.
   - Al cerrar la pestaña/ventana, deberá iniciar sesión nuevamente.
   - 15 minutos sin actividad cierran automáticamente la sesión.
============================================================ */


import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* ============================================================
   CONFIGURACIÓN FIREBASE
============================================================ */

const firebaseConfig = {

  apiKey:
    "AIzaSyDRvGz3W_RpdlOfWYfH88YZVVOLNDWyFvA",

  authDomain:
    "auxiliar-administrativo-197cc.firebaseapp.com",

  projectId:
    "auxiliar-administrativo-197cc",

  storageBucket:
    "auxiliar-administrativo-197cc.firebasestorage.app",

  messagingSenderId:
    "529876753906",

  appId:
    "1:529876753906:web:5a363f29a6aa2d57c3df6b"

};


/* ============================================================
   DOMINIO INTERNO
============================================================ */

const DOMINIO_INTERNO =
  "@auxiliar.local";


/* ============================================================
   USUARIOS Y ROLES
============================================================ */

const ROLES_USUARIOS = {

  "lqg": "administrador",

  "estudiante": "estudiante"

};


/* ============================================================
   CONFIGURACIÓN DE INACTIVIDAD

   15 minutos = 15 * 60 * 1000 milisegundos
============================================================ */

const TIEMPO_INACTIVIDAD =
  15 * 60 * 1000;


/* ============================================================
   INICIALIZAR FIREBASE
============================================================ */

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);


/* ============================================================
   VARIABLES DEL TEMPORIZADOR
============================================================ */

let temporizadorInactividad = null;

let sesionCerradaPorInactividad = false;


/* ============================================================
   ELEMENTOS HTML
============================================================ */

const loginScreen =
  document.getElementById("loginScreen");

const appProtegida =
  document.getElementById("appProtegida");

const loginForm =
  document.getElementById("loginForm");

const loginUsuario =
  document.getElementById("loginUsuario");

const loginPassword =
  document.getElementById("loginPassword");

const loginButton =
  document.getElementById("loginButton");

const loginError =
  document.getElementById("loginError");

const usuarioEmail =
  document.getElementById("usuarioEmail");

const btnCerrarSesion =
  document.getElementById("btnCerrarSesion");

const togglePassword =
  document.getElementById("togglePassword");


/* ============================================================
   NORMALIZAR USUARIO
============================================================ */

function normalizarUsuario(usuario) {

  return (usuario || "")
    .trim()
    .toLowerCase();

}


/* ============================================================
   CONVERTIR USUARIO A CORREO INTERNO
============================================================ */

function obtenerCorreoInterno(usuario) {

  return (
    normalizarUsuario(usuario) +
    DOMINIO_INTERNO
  );

}


/* ============================================================
   OBTENER NOMBRE DE USUARIO
============================================================ */

function obtenerNombreUsuario(user) {

  if (
    !user ||
    !user.email
  ) {

    return "Usuario";

  }


  const email =
    user.email.toLowerCase();


  if (
    email.endsWith(
      DOMINIO_INTERNO
    )
  ) {

    return email.substring(
      0,
      email.length -
      DOMINIO_INTERNO.length
    );

  }


  return user.email;

}


/* ============================================================
   OBTENER ROL
============================================================ */

function obtenerRolUsuario(user) {

  const usuario =
    normalizarUsuario(
      obtenerNombreUsuario(user)
    );


  return (
    ROLES_USUARIOS[usuario] ||
    "sin-permiso"
  );

}


/* ============================================================
   APLICAR PERMISOS DEL MENÚ
============================================================ */

function aplicarPermisosMenu(rol) {

  const elementos =
    document.querySelectorAll(
      "[data-permiso]"
    );


  elementos.forEach(
    elemento => {

      const permiso =
        elemento.dataset.permiso || "";


      if (
        permiso === "todos"
      ) {

        elemento.style.display =
          "";

        return;

      }


      const rolesPermitidos =
        permiso
          .split(",")
          .map(
            item =>
              item.trim().toLowerCase()
          );


      if (
        rolesPermitidos.includes(
          rol
        )
      ) {

        elemento.style.display =
          "";

      } else {

        elemento.style.display =
          "none";

      }

    }
  );

}


/* ============================================================
   MOSTRAR ERROR
============================================================ */

function mostrarError(mensaje) {

  if (!loginError) {
    return;
  }


  loginError.textContent =
    mensaje;


  loginError.classList.add(
    "visible"
  );

}


/* ============================================================
   OCULTAR ERROR
============================================================ */

function ocultarError() {

  if (!loginError) {
    return;
  }


  loginError.textContent =
    "";


  loginError.classList.remove(
    "visible"
  );

}


/* ============================================================
   LIMPIAR CREDENCIALES
============================================================ */

function limpiarCredenciales() {

  if (loginUsuario) {

    loginUsuario.value =
      "";

  }


  if (loginPassword) {

    loginPassword.value =
      "";

  }

}


/* ============================================================
   RESTABLECER PÁGINA DE INICIO
============================================================ */

function restablecerInicio() {

  const iframe =
    document.getElementById(
      "contenido"
    );


  const fondo =
    document.getElementById(
      "fondo"
    );


  const btnInicio =
    document.getElementById(
      "btnInicio"
    );


  if (iframe) {

    iframe.src =
      "";

    iframe.classList.add(
      "oculto"
    );

  }


  if (fondo) {

    fondo.classList.remove(
      "oculto"
    );

  }


  document
    .querySelectorAll(
      ".menu a.activo"
    )
    .forEach(
      enlace => {

        enlace.classList.remove(
          "activo"
        );

      }
    );


  if (
    btnInicio &&
    btnInicio.closest("li")?.style.display !== "none"
  ) {

    btnInicio.classList.add(
      "activo"
    );

  }


  document
    .querySelectorAll(
      ".has-sub.open"
    )
    .forEach(
      item => {

        item.classList.remove(
          "open"
        );


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

      }
    );

}


/* ============================================================
   MOSTRAR LOGIN
============================================================ */

function mostrarLogin() {

  if (appProtegida) {

    appProtegida.classList.add(
      "oculto-auth"
    );

  }


  if (loginScreen) {

    loginScreen.classList.remove(
      "oculto-auth"
    );

  }


  document.body.style.overflow =
    "hidden";


  if (loginUsuario) {

    setTimeout(
      () => loginUsuario.focus(),
      100
    );

  }

}


/* ============================================================
   MOSTRAR SISTEMA
============================================================ */

function mostrarSistema(user) {

  const nombreUsuario =
    obtenerNombreUsuario(user);


  const rol =
    obtenerRolUsuario(user);


  if (usuarioEmail) {

    usuarioEmail.textContent =
      nombreUsuario;

  }


  aplicarPermisosMenu(
    rol
  );


  restablecerInicio();


  if (loginScreen) {

    loginScreen.classList.add(
      "oculto-auth"
    );

  }


  if (appProtegida) {

    appProtegida.classList.remove(
      "oculto-auth"
    );

  }


  document.body.style.overflow =
    "";

}


/* ============================================================
   DETENER TEMPORIZADOR DE INACTIVIDAD
============================================================ */

function detenerTemporizadorInactividad() {

  if (temporizadorInactividad) {

    clearTimeout(
      temporizadorInactividad
    );


    temporizadorInactividad =
      null;

  }

}


/* ============================================================
   CERRAR SESIÓN POR INACTIVIDAD
============================================================ */

async function cerrarSesionPorInactividad() {

  detenerTemporizadorInactividad();


  if (!auth.currentUser) {
    return;
  }


  try {

    sesionCerradaPorInactividad =
      true;


    await signOut(auth);


  } catch (error) {

    sesionCerradaPorInactividad =
      false;


    console.error(
      "Error al cerrar sesión por inactividad:",
      error
    );

  }

}


/* ============================================================
   REINICIAR TEMPORIZADOR
============================================================ */

function reiniciarTemporizadorInactividad() {

  /*
     Solo necesitamos contar inactividad
     cuando existe un usuario autenticado.
  */

  if (!auth.currentUser) {

    detenerTemporizadorInactividad();

    return;

  }


  detenerTemporizadorInactividad();


  temporizadorInactividad =
    setTimeout(
      cerrarSesionPorInactividad,
      TIEMPO_INACTIVIDAD
    );

}


/* ============================================================
   ACTIVIDAD DEL USUARIO

   Cualquier actividad reinicia los 15 minutos.
============================================================ */

[
  "mousedown",
  "keydown",
  "touchstart",
  "scroll"
].forEach(
  evento => {

    window.addEventListener(
      evento,
      reiniciarTemporizadorInactividad,
      {
        passive: true
      }
    );

  }
);


/* ============================================================
   MENSAJES DE ERROR FIREBASE
============================================================ */

function mensajeErrorFirebase(error) {

  const codigo =
    error?.code || "";


  switch (codigo) {

    case "auth/missing-password":

      return "Debe ingresar la contraseña.";


    case "auth/too-many-requests":

      return "Se realizaron demasiados intentos. Espere unos minutos e inténtelo nuevamente.";


    case "auth/network-request-failed":

      return "No fue posible conectar con el servicio. Revise su conexión a Internet.";


    case "auth/user-disabled":

      return "Este usuario se encuentra deshabilitado.";


    case "auth/invalid-email":

    case "auth/invalid-credential":

    case "auth/user-not-found":

    case "auth/wrong-password":

      return "Usuario o contraseña incorrectos.";


    default:

      console.error(
        "Firebase Authentication:",
        error
      );


      return "No fue posible iniciar sesión. Verifique sus datos e inténtelo nuevamente.";

  }

}


/* ============================================================
   CONFIGURAR PERSISTENCIA DE SESIÓN

   IMPORTANTE:
   browserSessionPersistence utiliza sessionStorage.

   La sesión se mantiene al RECARGAR la misma pestaña,
   pero no debe conservarse después de cerrar esa pestaña
   y abrir una nueva.
============================================================ */

async function configurarPersistencia() {

  try {

    await setPersistence(
      auth,
      browserSessionPersistence
    );


  } catch (error) {

    console.error(
      "No fue posible configurar la persistencia de sesión:",
      error
    );

  }

}


/* ============================================================
   INICIAR SESIÓN
============================================================ */

if (
  loginForm &&
  loginUsuario &&
  loginPassword
) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      ocultarError();


      const usuario =
        normalizarUsuario(
          loginUsuario.value
        );


      const password =
        loginPassword.value;


      if (!usuario) {

        mostrarError(
          "Ingrese su usuario."
        );


        limpiarCredenciales();


        loginUsuario.focus();


        return;

      }


      if (
        usuario.includes("@")
      ) {

        mostrarError(
          "Ingrese únicamente su nombre de usuario."
        );


        limpiarCredenciales();


        loginUsuario.focus();


        return;

      }


      if (!password) {

        mostrarError(
          "Ingrese su contraseña."
        );


        limpiarCredenciales();


        loginUsuario.focus();


        return;

      }


      const emailInterno =
        obtenerCorreoInterno(
          usuario
        );


      try {

        loginButton.disabled =
          true;


        loginButton.textContent =
          "Verificando...";


        /*
           Antes de autenticar configuramos
           la sesión para que sea temporal.
        */

        await setPersistence(
          auth,
          browserSessionPersistence
        );


        const credencial =
          await signInWithEmailAndPassword(
            auth,
            emailInterno,
            password
          );


        const rol =
          obtenerRolUsuario(
            credencial.user
          );


        if (
          rol === "sin-permiso"
        ) {

          await signOut(auth);


          limpiarCredenciales();


          mostrarError(
            "Este usuario no tiene permisos para acceder al sistema."
          );


          loginUsuario.focus();


          return;

        }


        limpiarCredenciales();


      } catch (error) {

        mostrarError(
          mensajeErrorFirebase(error)
        );


        limpiarCredenciales();


        loginUsuario.focus();


      } finally {

        loginButton.disabled =
          false;


        loginButton.textContent =
          "Iniciar sesión";

      }

    }
  );

}


/* ============================================================
   MOSTRAR / OCULTAR CONTRASEÑA
============================================================ */

if (
  togglePassword &&
  loginPassword
) {

  togglePassword.addEventListener(
    "click",
    () => {

      const mostrando =
        loginPassword.type ===
        "text";


      loginPassword.type =
        mostrando
          ? "password"
          : "text";


      togglePassword.setAttribute(
        "aria-label",
        mostrando
          ? "Mostrar contraseña"
          : "Ocultar contraseña"
      );


      togglePassword.setAttribute(
        "title",
        mostrando
          ? "Mostrar contraseña"
          : "Ocultar contraseña"
      );

    }
  );

}


/* ============================================================
   CERRAR SESIÓN MANUALMENTE
============================================================ */

if (btnCerrarSesion) {

  btnCerrarSesion.addEventListener(
    "click",
    async () => {

      try {

        btnCerrarSesion.disabled =
          true;


        /*
           Detenemos el temporizador.
        */

        detenerTemporizadorInactividad();


        /*
           Este cierre NO fue provocado
           por inactividad.
        */

        sesionCerradaPorInactividad =
          false;


        limpiarCredenciales();


        await signOut(auth);


      } catch (error) {

        console.error(
          "Error al cerrar sesión:",
          error
        );


        alert(
          "No fue posible cerrar la sesión."
        );


      } finally {

        btnCerrarSesion.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   DETECTAR ESTADO DE AUTENTICACIÓN
============================================================ */

onAuthStateChanged(
  auth,
  async user => {

    /* --------------------------------------------------------
       USUARIO AUTENTICADO
    -------------------------------------------------------- */

    if (user) {

      const rol =
        obtenerRolUsuario(
          user
        );


      if (
        rol === "sin-permiso"
      ) {

        detenerTemporizadorInactividad();


        await signOut(auth);


        limpiarCredenciales();


        mostrarError(
          "Este usuario no tiene permisos para acceder al sistema."
        );


        return;

      }


      ocultarError();


      limpiarCredenciales();


      mostrarSistema(
        user
      );


      /*
         Comenzamos a contar los
         15 minutos de inactividad.
      */

      reiniciarTemporizadorInactividad();


    } else {

      /* ------------------------------------------------------
         SIN SESIÓN
      ------------------------------------------------------ */

      detenerTemporizadorInactividad();


      limpiarCredenciales();


      restablecerInicio();


      mostrarLogin();


      /*
         Si Firebase cerró la sesión debido
         a nuestros 15 minutos de inactividad,
         mostramos la explicación.
      */

      if (
        sesionCerradaPorInactividad
      ) {

        mostrarError(
          "La sesión se cerró automáticamente por 15 minutos de inactividad. Inicie sesión nuevamente."
        );


        sesionCerradaPorInactividad =
          false;

      }

    }

  }
);


/* ============================================================
   CONFIGURACIÓN INICIAL
============================================================ */

configurarPersistencia();