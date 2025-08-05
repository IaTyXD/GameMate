const firebaseConfig = {
    apiKey: "AIzaSyA9waDvb4x1AUb1ndk_NFDfn2CjKq2HW2E",
    authDomain: "gamemate-2a419.firebaseapp.com",
    projectId: "gamemate-2a419",
    storageBucket: "gamemate-2a419.appspot.com",
    messagingSenderId: "149749345149",
    appId: "1:149749345149:web:89d3d5ebd73cf5a65afa14",
    measurementId: "G-1ZHF3RHG3Y"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

function renderGallery(galleryUrls, user, editMode = false) {
    const galleryGrid = document.getElementById("gallery-grid");
    const galeriaEditList = document.getElementById("galeria-edit-list");
    
    if (galleryGrid) galleryGrid.innerHTML = '';
    if (galeriaEditList) galeriaEditList.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const url = galleryUrls[i] || 'https://via.placeholder.com/70x70.png?text=%2B';
        const imageElement = document.createElement('img');
        imageElement.src = url;
        imageElement.className = 'gallery-image';
        
        if (galleryGrid) galleryGrid.appendChild(imageElement);

        if (editMode && galeriaEditList) {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'file';
            input.className = 'oculto';
            input.accept = 'image/*';

            label.innerHTML = `<img src="${url}" class="gallery-image-edit">`;
            label.appendChild(input);
            galeriaEditList.appendChild(label);

            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                subirFotoDeGaleria(file, user, i)
                    .then(newUrl => {
                        galleryUrls[i] = newUrl;
                        renderGallery(galleryUrls, user, true);
                    });
            });
        }
    }
}

function subirFotoDeGaleria(file, user, index) {
    if (!user) {
        console.error("No hay usuario autenticado.");
        return Promise.reject("No hay usuario autenticado.");
    }
    const storageRef = storage.ref(`users/${user.uid}/gallery/${index}`);
    return storageRef.put(file)
        .then(() => storageRef.getDownloadURL())
        .then(downloadURL => {
            return db.collection("usuarios").doc(user.uid).get()
                .then(doc => {
                    const gallery = doc.data().galeria || Array(9).fill(null);
                    gallery[index] = downloadURL;
                    return db.collection("usuarios").doc(user.uid).update({ galeria: gallery });
                })
                .then(() => downloadURL);
        });
}

function loadTabContent(tabName) {
    const tabContentContainer = document.getElementById('tab-content-container');
    if (!tabContentContainer) return;

    fetch(`./paneles/${tabName}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar el archivo: ${response.statusText}`);
            return response.text();
        })
        .then(html => {
            tabContentContainer.innerHTML = html;
            
            const oldScript = document.querySelector('script[data-tab-script]');
            if (oldScript) {
                oldScript.remove();
            }

            // La ruta del script ha sido corregida
            const newScript = document.createElement('script');
            newScript.src = `./paneles/${tabName}.js`;
            newScript.setAttribute('data-tab-script', 'true');
            newScript.onload = () => {
                console.log(`Script ${tabName}.js cargado.`);
            };
            document.body.appendChild(newScript);
        })
        .catch(error => {
            tabContentContainer.innerHTML = `<p class="error-message">Error al cargar la pestaña: ${error.message}</p>`;
            console.error('Error al cargar la pestaña:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('login-section');
    const registroForm = document.getElementById("registroForm");
    const loginForm = document.getElementById("loginForm");
    const dashboard = document.getElementById("dashboard");
    const welcomeMessage = document.getElementById("welcome-message");
    const welcomeUserName = document.getElementById("welcomeUserName");

    const logoutBtn = document.getElementById("logoutBtn");
    const userNameSpan = document.getElementById("userName");
    const userGamesP = document.getElementById("userGames");
    const userDescripcionP = document.getElementById("userDescripcion");
    const profileImageFile = document.getElementById("profileImageFile");
    const profilePic = document.getElementById("profilePic");
    const editarJuegosBtn = document.getElementById("editar-juegos-btn");
    const editarJuegosContainer = document.getElementById("editar-juegos-container");
    const nuevoJuegoInput = document.getElementById("nuevo-juego-input");
    const guardarJuegosBtn = document.getElementById("guardar-juegos-btn");
    const juegosDisplay = document.getElementById("juegos-display");
    const editarFotoBtn = document.getElementById("editar-foto-btn");
    const editarDescripcionBtn = document.getElementById("editar-descripcion-btn");
    const editarDescripcionContainer = document.getElementById("editar-descripcion-container");
    const nuevaDescripcionInput = document.getElementById("nueva-descripcion-input");
    const guardarDescripcionBtn = document.getElementById("guardar-descripcion-btn");
    const descripcionDisplay = document.getElementById("descripcion-display");
    const editarGaleriaBtn = document.getElementById("editar-galeria-btn");
    const galeriaEdicionContainer = document.getElementById("galeria-edicion-container");
    const editarObjetivosBtn = document.getElementById("editar-objetivos-btn");
    const editarObjetivosContainer = document.getElementById("editar-objetivos-container");
    const guardarObjetivosBtn = document.getElementById("guardar-objetivos-btn");
    const userObjetivosSpan = document.getElementById("userObjetivos");
    const objetivosDisplay = document.getElementById("objetivos-display");

    const tabsContainer = document.querySelector('.tabs-container');

    if (registroForm) {
        registroForm.addEventListener('submit', function(evento) {
            evento.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const nombre = document.getElementById("nombre").value;
            const juegos = document.getElementById("juegos").value;
            const descripcion = ""; 
            const objetivos = "";
            const galeria = Array(9).fill(null);

            registrarUsuario(email, password, nombre, juegos, descripcion, objetivos, galeria)
                .then(() => {
                    feedbackMensaje.innerHTML = `¡Perfil de ${nombre} creado con éxito!`;
                    registroForm.reset();
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    feedbackMensaje.innerHTML = `Error: ${errorMessage}`;
                });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(evento) {
            evento.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            iniciarSesion(email, password)
                .then(() => {
                    loginForm.reset();
                    loginFeedbackMensaje.innerHTML = `¡Inicio de sesión exitoso!`;
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    loginFeedbackMensaje.innerHTML = `Error: ${errorMessage}`;
                });
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            if (loginSection) loginSection.classList.add('oculto');
            if (dashboard) dashboard.classList.remove('oculto');

            loadTabContent('buscar_jugadores');

            db.collection("usuarios").doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        if (welcomeUserName) welcomeUserName.innerHTML = userData.nombre;
                        if (welcomeMessage) welcomeMessage.classList.remove('oculto');
                        
                        setTimeout(() => {
                            if (welcomeMessage) welcomeMessage.classList.add('oculto');
                            if (dashboard) dashboard.classList.remove('oculto');
                            if (userNameSpan) userNameSpan.innerHTML = userData.nombre;
                            if (userGamesP) userGamesP.innerHTML = userData.juegos;
                            if (userDescripcionP) userDescripcionP.innerHTML = userData.descripcion || "Sin descripción";
                            if (userObjetivosSpan) userObjetivosSpan.innerHTML = userData.objetivos || "Sin objetivos";
                            if (userData.photoURL && profilePic) {
                                profilePic.src = userData.photoURL;
                            }
                            renderGallery(userData.galeria || Array(9).fill(null), user);
                        }, 2000);
                    }
                })
                .catch((error) => {
                    console.error("Error al obtener los datos de Firestore:", error);
                });
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', cerrarSesion);
            }
            if (editarFotoBtn) {
                editarFotoBtn.addEventListener('click', () => {
                    if (profileImageFile) profileImageFile.click();
                });
            }
            if (profileImageFile) {
                profileImageFile.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    const user = auth.currentUser;
                    subirFotoDePerfil(file, user, (downloadURL) => {
                        if (profilePic) profilePic.src = downloadURL;
                    });
                });
            }
            if (editarDescripcionBtn) {
                editarDescripcionBtn.addEventListener('click', () => {
                    if (editarDescripcionContainer) editarDescripcionContainer.classList.remove('oculto');
                    if (descripcionDisplay) descripcionDisplay.classList.add('oculto');
                    if (nuevaDescripcionInput && userDescripcionP) nuevaDescripcionInput.value = userDescripcionP.innerHTML;
                });
            }
            if (guardarDescripcionBtn) {
                guardarDescripcionBtn.addEventListener('click', () => {
                    const nuevaDescripcion = nuevaDescripcionInput.value;
                    db.collection("usuarios").doc(user.uid).update({
                        descripcion: nuevaDescripcion
                    })
                    .then(() => {
                        if (userDescripcionP) userDescripcionP.innerHTML = nuevaDescripcion;
                        if (editarDescripcionContainer) editarDescripcionContainer.classList.add('oculto');
                        if (descripcionDisplay) descripcionDisplay.classList.remove('oculto');
                    });
                });
            }
            if (editarJuegosBtn) {
                editarJuegosBtn.addEventListener('click', () => {
                    if (editarJuegosContainer) editarJuegosContainer.classList.remove('oculto');
                    if (juegosDisplay) juegosDisplay.classList.add('oculto');
                    if (nuevoJuegoInput && userGamesP) nuevoJuegoInput.value = userGamesP.innerHTML;
                });
            }
            if (guardarJuegosBtn) {
                guardarJuegosBtn.addEventListener('click', () => {
                    const nuevosJuegos = nuevoJuegoInput.value;
                    db.collection("usuarios").doc(user.uid).update({
                        juegos: nuevosJuegos
                    })
                    .then(() => {
                        if (userGamesP) userGamesP.innerHTML = nuevosJuegos;
                        if (editarJuegosContainer) editarJuegosContainer.classList.add('oculto');
                        if (juegosDisplay) juegosDisplay.classList.remove('oculto');
                    });
                });
            }
            if (editarGaleriaBtn) {
                editarGaleriaBtn.addEventListener('click', () => {
                    if (galeriaEdicionContainer) galeriaEdicionContainer.classList.toggle('oculto');
                    const isEditMode = !galeriaEdicionContainer.classList.contains('oculto');
                    db.collection("usuarios").doc(user.uid).get()
                        .then(doc => {
                            renderGallery(doc.data().galeria || Array(9).fill(null), user, isEditMode);
                        });
                });
            }
            if (editarObjetivosBtn) {
                editarObjetivosBtn.addEventListener('click', () => {
                    if (editarObjetivosContainer) editarObjetivosContainer.classList.remove('oculto');
                    if (objetivosDisplay) objetivosDisplay.classList.add('oculto');
                });
            }
            if (guardarObjetivosBtn) {
                guardarObjetivosBtn.addEventListener('click', () => {
                    const selectedObjetivo = document.querySelector('input[name="objetivo"]:checked');
                    if (selectedObjetivo) {
                        const nuevoObjetivo = selectedObjetivo.value;
                        db.collection("usuarios").doc(user.uid).update({
                            objetivos: nuevoObjetivo
                        })
                        .then(() => {
                            if (userObjetivosSpan) userObjetivosSpan.innerHTML = nuevoObjetivo;
                            if (editarObjetivosContainer) editarObjetivosContainer.classList.add('oculto');
                            if (objetivosDisplay) objetivosDisplay.classList.remove('oculto');
                        });
                    }
                });
            }
            
            if (tabsContainer) {
                tabsContainer.addEventListener('click', (event) => {
                    if (event.target.classList.contains('tab-btn')) {
                        const activeTab = document.querySelector('.tab-btn.active');
                        if (activeTab) {
                            activeTab.classList.remove('active');
                        }
                        event.target.classList.add('active');
                        const tabName = event.target.dataset.tab;
                        loadTabContent(tabName);
                    }
                });
            }
        } else {
            if (dashboard) dashboard.classList.add('oculto');
            if (loginSection) loginSection.classList.remove('oculto');
        }
    });
});