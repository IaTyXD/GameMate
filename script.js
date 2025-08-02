setTimeout(function() {
  const registroForm = document.getElementById("registroForm");
  const loginForm = document.getElementById("loginForm");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const feedbackMensaje = document.getElementById("feedbackMensaje");
  const loginFeedbackMensaje = document.getElementById("loginFeedbackMensaje");
  
  const userNameSpan = document.getElementById("userName");
  const userGamesP = document.getElementById("userGames");

  const auth = firebase.auth();
  const db = firebase.firestore();

  // ---------------------- Lógica de Registro ----------------------
  if (registroForm) {
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
  }

  // ---------------------- Lógica de Inicio de Sesión ----------------------
  if (loginForm) {
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
  }

  // ---------------------- Lógica de Cierre de Sesión ----------------------
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      auth.signOut().then(() => {
        console.log("Sesión cerrada");
      }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
    });
  }

  // ---------------------- Lógica para Cambiar la Interfaz de Usuario ----------------------
  auth.onAuthStateChanged(user => {
    if (user) {
      if (dashboard) dashboard.style.display = 'block';
      if (registroForm) registroForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'none';
      
      db.collection("usuarios").doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          console.log("Datos de usuario de Firestore:", userData);
      console.log("Juegos favoritos:", userData.juegos);
      
          if (userNameSpan) userNameSpan.innerHTML = userData.nombre;
          if (userGamesP) userGamesP.innerHTML = userData.juegos;
        } else {
          console.log("No se encontró el perfil del usuario.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos de Firestore:", error);
      });

    } else {
      if (dashboard) dashboard.style.display = 'none';
      if (registroForm) registroForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'block';
      if (userNameSpan) userNameSpan.innerHTML = "";
      if (userGamesP) userGamesP.innerHTML = "";
    }
  });
}, 500); // 500ms de retraso