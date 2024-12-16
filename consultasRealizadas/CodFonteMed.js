window.onload = function () {
    const loggedIn = localStorage.getItem("loggedIn");
    const loggedUsername = localStorage.getItem("username");

    if (loggedIn === "true" && loggedUsername) {
        logado(loggedUsername);
        alterarmodal(loggedUsername);
    }
    const savedProfilePicture = localStorage.getItem("profilePicture");

    if (savedProfilePicture) {
        document.getElementById("currentProfilePicture").src = savedProfilePicture;
    } else {
        document.getElementById("currentProfilePicture").src = "https://via.placeholder.com/100";
    }
    applySavedTheme();
};

// Funções de Login e Cadastro
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

// Função para obter os dados do banco de dados
function getDatabase() {
    return fetch('http://localhost:3000/medicos')
        .then(response => response.json());
}

// Função para salvar dados no banco de dados
function saveDatabase(newUser) {
    return fetch('http://localhost:3000/medicos', {
        method: 'POST', // Altera os dados no banco
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
    });
}

// Função de registro
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
                role: "paciente",
                name: "",
                email: "",
                phone: "",
                profilePicture: "",
                cpf: ""
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
    document.getElementById("botaologin").src = "images/User-logado.png";
    document.getElementById("botaofechar").addEventListener("click", logout);
    alterarmodal(username);
}

function logout() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");

    document.getElementById("botaologin").src = "images/User.png";
    document.getElementById("botaofechar").innerText = "Login";

    window.location.href = "Index.html";
}

// Funções de Alteração do Modal e Exibição de Informações do Usuário
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
                  <li class="list-group-item text-center">CRM: <strong>${userInfo.crm || ''}</strong></li>  <!-- Verificando se o CPF existe -->
                  <li class="list-group-item text-center">
                  Senha: <strong id="passwordField" style="letter-spacing: 3px;">••••••••</strong>
                  <button id="togglePassword" class="btn btn-sm btn-outline-primary ms-2">Mostrar</button>
                  </li>
              </ul>
              <div class="modal-footer">
          `;
            document.getElementById("botaofechar").innerText = "Logout";
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

// Atualização do Tema
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-name').textContent = 'Escuro';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-name').textContent = 'Claro';
    }
    updateThemeStyles();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    document.getElementById('theme-name').textContent = isDarkMode ? 'Escuro' : 'Claro';
    updateThemeStyles();
}

function updateThemeStyles() {
    const themeLink = document.getElementById('theme-stylesheet');
    if (document.body.classList.contains('dark-mode')) {
        themeLink.href = 'styles-dark.css';
    } else {
        themeLink.href = 'styles.css';
    }
}
// Função para atualizar o estilo do tema
function updateThemeStyles() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        document.getElementById("Logo-GilcoHealth").src = 'images/LogoHeader.png';
        document.getElementById("Nav").style.backgroundColor = "#333";
        document.getElementById("offcanvasWithBothOptions").className = "offcanvas offcanvas-start text-bg-dark w-50";
        document.getElementById("modalHeader").style.backgroundColor = "#333";
        document.getElementById("exampleModalLabel").style.color = "white";
        document.getElementById("modalBody").style.backgroundColor = "#333";
        document.getElementById("modalFooter").style.backgroundColor = "#333";

        const navItems = document.querySelectorAll('#ListaNav .nav-link');
        navItems.forEach(item => {
            item.style.color = "white";
        });
        document.getElementById("theme-switch").innerText = "Escuro";
        document.getElementById("theme-switch").style.backgroundColor = "black";
        document.getElementById("theme-switch").style.color = "white";
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#333';
            card.style.color = "white";
        });
        document.getElementById("AlertaTemaB").style.backgroundColor = "#333";
        document.getElementById("AlertaTemaB").style.color = "white";
        document.getElementById("AlertaTemaH").style.backgroundColor = "#333";
        document.getElementById("AlertaTemaH").style.color = "white";
    } else {
        // Tema Claro
        document.getElementById("Logo-GilcoHealth").src = 'images/LogoHeader.png';
        document.getElementById("Nav").style.backgroundColor = "aliceblue";
        document.getElementById("offcanvasWithBothOptions").className = "offcanvas offcanvas-start w-50";
        document.getElementById("modalHeader").style.backgroundColor = "white";
        document.getElementById("exampleModalLabel").style.color = "black";
        document.getElementById("modalBody").style.backgroundColor = "white";
        document.getElementById("modalFooter").style.backgroundColor = "white";
        const navItems = document.querySelectorAll('#ListaNav .nav-link');
        navItems.forEach(item => {
            item.style.color = "black";
        });
        document.getElementById("theme-switch").innerText = "Claro";
        document.getElementById("theme-switch").style.backgroundColor = "white";
        document.getElementById("theme-switch").style.color = "black";
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = 'white';
            card.style.color = "black";
        });
        document.getElementById("AlertaTemaB").style.backgroundColor = "white";
        document.getElementById("AlertaTemaB").style.color = "black";
        document.getElementById("AlertaTemaH").style.backgroundColor = "white";
        document.getElementById("AlertaTemaH").style.color = "black";
    }
}
document.querySelector('#theme-switch').addEventListener('click', toggleTheme);

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

function showUsersInDOM() {
    showToastById("loadingToast", "Carregando...");

    fetch("http://localhost:3000/medicos")
        .then((response) => {
            if (!response.ok) {
                showToastById("loadingToast", "Servidor fechado ou inacessível. Tente novamente mais tarde.");
                throw new Error("Servidor fechado ou inacessível.");
            }
            return response.json();
        })
        .then((database) => {
            const userCardsContainer = document.getElementById("userCardsContainer");
            userCardsContainer.innerHTML = "";

            if (database.length === 0) {
                userCardsContainer.innerHTML = "<p class='text-center'>Nenhum usuário registrado.</p>";
            } else {
                database.forEach((user) => {
                    const card = document.createElement("div");
                    card.className = "col-12 col-md-4";
                    card.innerHTML = `
                          <div class="card d-flex flex-column" style="height: 100%; border-radius: 20px; max-width: 100%; ">
                              <img src="${user.profilePicture || 'https://via.placeholder.com/100'}" alt="Foto do Usuário" style="max-width: 100px; height: 100px; object-fit: cover;" class="rounded-circle mb-2 mx-auto">
                              <h5 class="text-center">${user.username}</h5>
                              <p class="text-center"><strong>Nome:</strong> ${user.name || "Não informado"}</p>
                              <p class="text-center"><strong>Email:</strong> ${user.email || "Não informado"}</p>
                              <p class="text-center"><strong>Telefone:</strong> ${user.phone || "Não informado"}</p>
                              <p class="text-center"><strong>Senha:</strong> ${user.password || "Não informado"}</p>
                              <p class="text-center"><strong>CPF:</strong> ${user.cpf || "Não informado"}</p>
                              <div class="d-flex justify-content-center mt-auto">
                                  <button class="btn btn-danger btn-sm" onclick="removeUser('${user.id}')">Remover</button>
                              </div>
                          </div>
                      `;
                    userCardsContainer.appendChild(card);
                });
            }
            showToastById("loadingToast", "Usuários atualizados com sucesso!");
            const toggleUsersButton = document.getElementById("toggleUsersButton");
            if (toggleUsersButton) {
                toggleUsersButton.innerHTML = "Atualizar Usuários";
            }
        })
        .catch((error) => {
            console.error("Erro ao acessar o servidor:", error);
            showToastById("loadingToast", "Erro ao carregar usuários. Verifique sua conexão ou tente novamente.");
        });
}

// Remove usuários
function removeUser(userId) {
    // Confirmação antes de remover
    const confirmDelete = confirm(`Deseja realmente remover o usuário com ID ${userId}?`);
    if (!confirmDelete) return;

    // Requisição para remover o usuário
    fetch(`http://localhost:3000/medicos/${userId}`, {
        method: 'DELETE',
    }).then(() => {
        // Atualiza a lista de usuários sem recarregar a página
        showUsersInDOM();
    }).catch((error) => {
        console.error('Erro ao remover o usuário:', error);
    });
}

// Editor de informações {SPRINT2}
document.getElementById("profileEditForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const cpf = document.getElementById("userCpf").value;  // Novo campo de CPF
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
                        cpf,  // Adicionando CPF
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

// Habilitando e desabilitando o botão de salvar com base na verificação de todos os campos
document.getElementById("profileEditForm").addEventListener("input", function () {
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const cpf = document.getElementById("userCpf").value;  // Verificando CPF também
    const picture = document.getElementById("profilePicture").files[0];
    const saveButton = document.getElementById("saveButton");

    if (name && email && phone && cpf && picture) {
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

// Selecionando o botão de troca de tema e o toast
const themeSwitchButton = document.getElementById('theme-switch');
const themeToast = new bootstrap.Toast(document.getElementById('theme-toast'), {
    delay: 8000 // Ajustando o delay para 8 segundos (8000 milissegundos)
});

// Função para alternar entre os temas
themeSwitchButton.addEventListener('click', function () {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        themeSwitchButton.textContent = 'Claro';
        document.getElementById('theme-name').textContent = 'Claro';

    } else {
        document.body.classList.add('dark-theme');
        themeSwitchButton.textContent = 'Escuro';
        document.getElementById('theme-name').textContent = 'Escuro';
    }

    // Mostrar o toast de notificação
    themeToast.show();
});

function handleCardClick(event, targetUrl) {
    event.preventDefault();

    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn) {
        window.location.href = targetUrl;
    } else {
        showToastById("loginRequiredToast", "Você precisa estar logado para acessar esta funcionalidade!");
    }
}
function checkLogin() {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
        window.location.href = "../../InterfaceUsuário/Index.html";
    } else {
        const username = localStorage.getItem("username");
        if (username) {
            showToast(`Exibibindo cálculo glicêmico para: ${username}`);
            displayWelcomeMessage(username);
        }
    }
}
document.addEventListener("DOMContentLoaded", checkLogin);