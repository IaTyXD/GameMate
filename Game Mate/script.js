document.addEventListener('DOMContentLoaded', function() {
  const registroForm = document.getElementById("registroForm");
  const loginForm = document.getElementById("loginForm");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const feedbackMensaje = document.getElementById("feedbackMensaje");
  const loginFeedbackMensaje = document.getElementById("loginFeedbackMensaje");

  const auth = firebase.auth();
  const db = firebase.firestore();

  // ---------------------- Lógica de Registro ----------------------
  registroForm.addEventListener('submit', function(evento) {
    evento.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const nombre = document.getElementById("nombre").value;
    const juegos = document.getElementById("juegos").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        db.collection("usuarios").doc(user.uid).set({
          nombre: nombre,
          juegos: juegos
        })
        .then(() => {
          feedbackMensaje.innerHTML = `¡Perfil de ${nombre} creado con éxito!`;
          registroForm.reset();
        })
        .catch((error) => {
          console.error("Error al guardar en Firestore:", error);
        });
      })
      .catch((error) => {
        const errorMessage = error.message;
        feedbackMensaje.innerHTML = `Error: ${errorMessage}`;
      });
  });

  // ---------------------- Lógica de Inicio de Sesión ----------------------
  loginForm.addEventListener('submit', function(evento) {
    evento.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        loginForm.reset();
        loginFeedbackMensaje.innerHTML = `¡Inicio de sesión exitoso!`;
      })
      .catch((error) => {
        const errorMessage = error.message;
        loginFeedbackMensaje.innerHTML = `Error: ${errorMessage}`;
      });
  });

  // ---------------------- Lógica de Cierre de Sesión ----------------------
  logoutBtn.addEventListener('click', function() {
    auth.signOut().then(() => {
      console.log("Sesión cerrada");
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  });

  // ---------------------- Lógica para Cambiar la Interfaz de Usuario ----------------------
  auth.onAuthStateChanged(user => {
    if (user) {
      dashboard.style.display = 'block';
      registroForm.style.display = 'none';
      loginForm.style.display = 'none';
    } else {
      dashboard.style.display = 'none';
      registroForm.style.display = 'block';
      loginForm.style.display = 'block';
    }
  });
});