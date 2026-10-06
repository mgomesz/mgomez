/* ============================================================
   FIREBASE AUTHENTICATION
   AUXILIAR ADMINISTRATIVO

   ROLES:

   lqg        -> Administrador
   estudiante -> Estudiante
============================================================ */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
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

   LQG        -> Administrador
   estudiante -> Estudiante

   Cualquier otro usuario queda sin permiso.
============================================================ */

const ROLES_USUARIOS = {

  "lqg": "administrador",

  "estudiante": "estudiante"

};


/* ============================================================
   INICIALIZAR FIREBASE
============================================================ */

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);


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


      /*
         "todos" significa que cualquier
         usuario autorizado puede verlo.
      */

      if (
        permiso === "todos"
      ) {

        elemento.style.display =
          "";

        return;

      }


      /*
         Algunos elementos pueden tener
         varios roles separados por coma:

         administrador,lqg

         administrador,estudiante
      */

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
   LIMPIAR USUARIO Y CONTRASEÑA
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


  /*
     Cerrar contenido cargado anteriormente.
  */

  if (iframe) {

    iframe.src =
      "";

    iframe.classList.add(
      "oculto"
    );

  }


  /*
     Volver a mostrar la página de inicio.
  */

  if (fondo) {

    fondo.classList.remove(
      "oculto"
    );

  }


  /*
     Marcar Inicio como opción activa.
  */

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


  if (btnInicio) {

    btnInicio.classList.add(
      "activo"
    );

  }


  /*
     Cerrar submenús abiertos.
  */

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


  /*
     Mostrar nombre del usuario.
  */

  if (usuarioEmail) {

    usuarioEmail.textContent =
      nombreUsuario;

  }


  /*
     Aplicar permisos según el rol.
  */

  aplicarPermisosMenu(
    rol
  );


  /*
     Cada sesión comienza en Inicio.
  */

  restablecerInicio();


  /*
     Ocultar login.
  */

  if (loginScreen) {

    loginScreen.classList.add(
      "oculto-auth"
    );

  }


  /*
     Mostrar sistema.
  */

  if (appProtegida) {

    appProtegida.classList.remove(
      "oculto-auth"
    );

  }


  document.body.style.overflow =
    "";

}


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


      /* ------------------------------------------------------
         VALIDAR USUARIO
      ------------------------------------------------------ */

      if (!usuario) {

        mostrarError(
          "Ingrese su usuario."
        );


        limpiarCredenciales();


        loginUsuario.focus();


        return;

      }


      /* ------------------------------------------------------
         NO PERMITIR CORREOS
      ------------------------------------------------------ */

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


      /* ------------------------------------------------------
         VALIDAR CONTRASEÑA
      ------------------------------------------------------ */

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


        /* ----------------------------------------------------
           AUTENTICAR CON FIREBASE
        ---------------------------------------------------- */

        const credencial =
          await signInWithEmailAndPassword(
            auth,
            emailInterno,
            password
          );


        /* ----------------------------------------------------
           VERIFICAR QUE EL USUARIO ESTÉ AUTORIZADO
        ---------------------------------------------------- */

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


        /* ----------------------------------------------------
           LOGIN CORRECTO
        ---------------------------------------------------- */

        limpiarCredenciales();


      } catch (error) {

        mostrarError(
          mensajeErrorFirebase(error)
        );


        /*
           Si usuario o contraseña son incorrectos,
           se limpian ambos campos.
        */

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
   CERRAR SESIÓN
============================================================ */

if (btnCerrarSesion) {

  btnCerrarSesion.addEventListener(
    "click",
    async () => {

      try {

        btnCerrarSesion.disabled =
          true;


        /*
           Limpiar usuario y contraseña.
        */

        limpiarCredenciales();


        /*
           Cerrar sesión.
        */

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


      /*
         Si existe una cuenta en Firebase
         pero no está incluida en ROLES_USUARIOS,
         se cierra automáticamente la sesión.
      */

      if (
        rol === "sin-permiso"
      ) {

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


    } else {

      /* ------------------------------------------------------
         SIN SESIÓN
      ------------------------------------------------------ */

      limpiarCredenciales();


      restablecerInicio();


      mostrarLogin();

    }

  }
);