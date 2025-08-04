document.addEventListener('DOMContentLoaded', function() {
  const registroForm = document.getElementById("registroForm");
  const loginForm = document.getElementById("loginForm");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const feedbackMensaje = document.getElementById("feedbackMensaje");
  const loginFeedbackMensaje = document.getElementById("loginFeedbackMensaje");
  
  const userNameSpan = document.getElementById("userName");
  const userGamesP = document.getElementById("userGames");
  const profileImageFile = document.getElementById("profileImageFile");
  const profilePic = document.getElementById("profilePic");

  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

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
          juegos: juegos,
          photoURL: "https://via.placeholder.com/150"
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

  logoutBtn.addEventListener('click', function() {
    auth.signOut().then(() => {
      console.log("Sesión cerrada");
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  });

  profileImageFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const user = auth.currentUser;

    if (user && file) {
      const storageRef = storage.ref(`profile_pictures/${user.uid}`);
      const uploadTask = storageRef.put(file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          // Puedes mostrar una barra de progreso aquí
        }, 
        (error) => {
          console.error("Error al subir la imagen:", error);
        }, 
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            db.collection("usuarios").doc(user.uid).update({
              photoURL: downloadURL
            }).then(() => {
              console.log("URL de la foto guardada en Firestore.");
              profilePic.src = downloadURL;
            }).catch((error) => {
              console.error("Error al guardar la URL en Firestore:", error);
            });
          });
        }
      );
    }
  });

  auth.onAuthStateChanged(user => {
    if (user) {
      dashboard.style.display = 'block';
      registroForm.style.display = 'none';
      loginForm.style.display = 'none';
      
      db.collection("usuarios").doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          userNameSpan.innerHTML = userData.nombre;
          userGamesP.innerHTML = userData.juegos;
          if (userData.photoURL) {
            profilePic.src = userData.photoURL;
          }
        } else {
          console.log("No se encontró el perfil del usuario.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos de Firestore:", error);
      });

    } else {
      dashboard.style.display = 'none';
      registroForm.style.display = 'block';
      loginForm.style.display = 'block';
      userNameSpan.innerHTML = "";
      userGamesP.innerHTML = "";
      profilePic.src = "https://via.placeholder.com/150";
    }
  });
});