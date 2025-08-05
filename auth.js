

// Función para registrar un nuevo usuario
function registrarUsuario(email, password, nombre, juegos) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection("usuarios").doc(user.uid).set({
                nombre: nombre,
                juegos: juegos,
                photoURL: "https://via.placeholder.com/150"
            });
        });
}

// Función para iniciar sesión
function iniciarSesion(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

// Función para cerrar sesión
function cerrarSesion() {
    return auth.signOut();
}