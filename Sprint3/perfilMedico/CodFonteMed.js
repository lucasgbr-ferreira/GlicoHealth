document.getElementById("btn-agenda").addEventListener("click", function() {
    checkLogin("btn-agenda");
});

document.getElementById("btn-prontuarios").addEventListener("click", function() {
    checkLogin("btn-prontuarios");
});

function checkLogin(btn) {
    const loggedIn = localStorage.getItem("loggedIn");

    if (!loggedIn) {
        showToastById("loginRequiredToast", "Você precisa estar logado para acessar esta funcionalidade!");
    }
    else if (btn === "btn-prontuarios") {
        window.location.href = "../consultasRealizadas/consultasRealizadas.html";
    }
    else if (btn === "btn-agenda") {
        window.location.href = "../preenchimentoAgenda/agendaMedico.html";
    }
}

document.getElementById("btn-prontuarios").addEventListener("mouseover", function () {
    document.getElementById("col-visivel").style.opacity = "0";
    document.getElementById("col-invisivel").style.opacity = "1";  
});

document.getElementById("btn-prontuarios").addEventListener("mouseout", function () {
    document.getElementById("col-visivel").style.opacity = "1";
    document.getElementById("col-invisivel").style.opacity = "0";
});


function showToastById(toastId, message = "") {
    const toastElement = document.getElementById(toastId);

    if (toastElement) {
        if (message) {
            const toastBody = toastElement.querySelector(".toast-body");
            if (toastBody) toastBody.textContent = message;
        }

        const toast = new bootstrap.Toast(toastElement, {
            delay: 10000,
        });
        toast.show();
    } else {
        console.error(`Toast com ID '${toastId}' não encontrado!`);
    }
}
function hideToastById(toastId) {
    const toastElement = document.getElementById(toastId);

    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement);
        toast.hide();
    } else {
        console.error(`Toast com ID '${toastId}' não encontrado!`);
    }
}

window.onload = function () {
    const loggedIn = localStorage.getItem("loggedIn");
    const loggedUsername = localStorage.getItem("username");

    if (loggedIn === "true" && loggedUsername) {
        logado(loggedUsername);
        alterarmodal(loggedUsername);
    } else {
        const toast = new bootstrap.Toast(document.getElementById("toastIntroducao"), {
            delay: 8000  
        });
        toast.show();
    }
    const savedProfilePicture = localStorage.getItem("profilePicture");
    if (savedProfilePicture) {
        document.getElementById("currentProfilePicture").src = savedProfilePicture;
    } else {
        document.getElementById("currentProfilePicture").src = "https://via.placeholder.com/100";
    }
    applySavedTheme();
};


function toggleSection() {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    loginSection.style.display = loginSection.style.display === "none" ? "block" : "none";
    registerSection.style.display = registerSection.style.display === "none" ? "block" : "none";
}

function getDatabase() {
    return fetch('http://localhost:3000/medicos')
        .then(response => response.json());
}

function saveDatabase(database) {
    return fetch('http://localhost:3000/medicos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(database),
    });
}

function getDatabase() {
    return fetch('http://localhost:3000/medicos')
        .then(response => response.json());
}

function saveDatabase(newUser) {
    return fetch('http://localhost:3000/medicos', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
    });
}

function register() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    if (!username || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    getDatabase()
        .then(database => {
            const userExists = database.some(user => user.username === username);
            if (userExists) {
                alert("Usuário já registrado!");
                return;
            }

            const newUser = {
                username,
                password,
                role: "medico",
                name: "",
                email: "",
                phone: "",
                profilePicture: "",
                crm: ""
            };

            saveDatabase(newUser)
                .then(() => {
                    console.log("Usuário registrado:", newUser);

                    document.getElementById("registerSuccess").style.display = "block";

                    alert(`Novo usuário cadastrado: ${username}`);

                    document.getElementById("registerUsername").value = '';
                    document.getElementById("registerPassword").value = '';

                    setTimeout(() => {
                        toggleSection();
                        document.getElementById("registerSuccess").style.display = "none";
                    }, 2000);
                })
                .catch(error => {
                    console.error("Erro ao salvar o banco de dados:", error);
                    alert("Ocorreu um erro ao registrar o usuário.");
                });
        })
        .catch(error => {
            console.error("Erro ao obter os dados do banco de dados:", error);
            alert("Erro ao verificar a disponibilidade de username.");
        });
}

function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    getDatabase().then(database => {
        const user = database.find(user => user.username === username && user.password === password);

        if (user) {
            alert("Login bem-sucedido!");
            document.getElementById("loginError").style.display = "none";
            logado(username);
            alterarmodal(username);
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", username);
        } else {
            document.getElementById("loginError").style.display = "block";
        }
    });
}

function logado(username) {
    document.getElementById("botaologin").src = "Imagens/User-logado.png";
    document.getElementById("botaofechar").addEventListener("click", logout);
    alterarmodal(username);
}

function logout() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");

    document.getElementById("botaologin").src = "Imagens/User.png";
    document.getElementById("botaofechar").innerText = "Login";

    window.location.href = "Index.html";
}

function alterarmodal(username) {
    const modalBody = document.querySelector('.modal-body');
    getDatabase().then(database => {
        const userInfo = database.find(user => user.username === username);
        console.log("Usuário Encontrado:", userInfo);

        if (userInfo) {
            modalBody.innerHTML = `
            <h2 class="text-center text-success">Você está logado, ${userInfo.username}!</h2>
            <p class="text-center" style="color: gray;">Aqui estão suas informações:</p>
            
            <!-- Exibindo a imagem de perfil -->
            <img id="userProfilePicture" class="rounded-circle mb-2 d-block mx-auto" src="${userInfo.profilePicture || 'https://via.placeholder.com/100'}" alt="Imagem de Perfil" style="max-width: 100px; height: 100px;object-fit: cover;">
            
            <ul class="list-group">
                <li class="list-group-item text-center">Usuário: <strong>${userInfo.username}</strong></li>
                <li class="list-group-item text-center">Nome: <strong>${userInfo.name}</strong></li>
                <li class="list-group-item text-center">Telefone: <strong>${userInfo.phone}</strong></li>
                <li class="list-group-item text-center">Email: <strong>${userInfo.email}</strong></li>
                <li class="list-group-item text-center">CRM: <strong>${userInfo.crm || ''}</strong></li> 
                <li class="list-group-item text-center">
                Senha: <strong id="passwordField" style="letter-spacing: 3px;">••••••••</strong>
                <button id="togglePassword" class="btn btn-sm btn-outline-primary ms-2">Mostrar</button>
                </li>
            </ul>
            <div class="modal-footer">
        `;
            document.getElementById("botaofechar").innerText = "Logout";
            document.getElementById("botaoEdicao").style.display = "";
            if (!userInfo.crm) {
                showToastById("crmRequiredToast", "Por favor, complete o campo CRM clicando em 'Editar Informações'.");
            }

        } else {
            modalBody.innerHTML = `
                <h2 class="text-center text-danger">Erro ao carregar informações!</h2>
                <p class="text-danger text-center">Usuário não encontrado no banco de dados.</p>`;
            document.getElementById("botaofechar").innerText = "Logout";
        }
    });
}
function fecharModal() {
    $('#exampleModal').modal('hide');
    const toastElement = document.getElementById('formToast');
    const toast = new bootstrap.Toast(toastElement, {
        delay: 10000
    });
    toast.show();
    const themeToastElement = document.getElementById('theme-toast');
    const themeToast = new bootstrap.Toast(themeToastElement);
    themeToast.hide();
}

// Ocultador de senha
document.addEventListener("click", function (event) {
    if (event.target.id === "togglePassword") {
        const passwordField = document.getElementById("passwordField");
        const loggedUsername = localStorage.getItem("username");

        if (!loggedUsername) {
            console.error("Nenhum usuário está logado.");
            return;
        }

        getDatabase().then(database => {
            const user = database.find(user => user.username === loggedUsername);

            if (!user) {
                console.error("Usuário logado não encontrado no banco de dados.");
                return;
            }

            if (passwordField.textContent === "••••••••") {
                passwordField.textContent = user.password;
                event.target.textContent = "Ocultar";
            } else {
                passwordField.textContent = "••••••••";
                event.target.textContent = "Mostrar";
            }
        });
    }
});
document.getElementById("profileEditForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const crm = document.getElementById("userCrm").value;
    const picture = document.getElementById("profilePicture").files[0];

    const loggedUsername = localStorage.getItem("username");

    fetch('http://localhost:3000/medicos')
        .then(response => response.json())
        .then(database => {
            const userIndex = database.findIndex(user => user.username === loggedUsername);
            if (userIndex !== -1) {
                const reader = new FileReader();

                reader.onload = function (event) {
                    const profilePictureData = picture ? event.target.result : null;

                    const updatedUser = {
                        ...database[userIndex],
                        name,
                        email,
                        phone,
                        crm,
                        profilePicture: profilePictureData
                    };

                    fetch(`http://localhost:3000/medicos/${database[userIndex].id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedUser),
                    }).then(() => {
                        alert("Alterações salvas com sucesso!");
                        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasWithBothOptions"));
                        offcanvas.hide();
                    });
                };

                if (picture) {
                    reader.readAsDataURL(picture);
                } else {
                    reader.onload();
                }
            } else {
                alert("Erro: Usuário não encontrado!");
            }
        });
});

document.getElementById("profileEditForm").addEventListener("input", function () {
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const crm = document.getElementById("userCrm").value;
    const picture = document.getElementById("profilePicture").files[0];
    const saveButton = document.getElementById("saveButton");

    if (name && email && phone && crm && picture) {
        saveButton.disabled = false;
    } else {
        saveButton.disabled = true;
    }
});

document.getElementById("profilePicture").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById("currentProfilePicture").src = e.target.result;
            const modalProfilePicture = document.getElementById("userProfilePicture");
            if (modalProfilePicture) {
                modalProfilePicture.src = e.target.result;
            }
        };

        reader.readAsDataURL(file);
    }
});