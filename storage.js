

// Función para subir la foto de perfil del usuario
function subirFotoDePerfil(file, user, callback) {
    if (!user || !file) {
        return;
    }

    const storageRef = storage.ref(`profile_pictures/${user.uid}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        (snapshot) => {
            // Se puede agregar una barra de progreso si es necesario
        }, 
        (error) => {
            console.error("Error al subir la imagen:", error);
        }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                const db = firebase.firestore();
                db.collection("usuarios").doc(user.uid).update({
                    photoURL: downloadURL
                }).then(() => {
                    console.log("URL de la foto guardada en Firestore.");
                    if (callback) {
                        callback(downloadURL);
                    }
                }).catch((error) => {
                    console.error("Error al guardar la URL en Firestore:", error);
                });
            });
        }
    );
}