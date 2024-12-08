// Carregamento da página
window.onload = function() {
    const loggedIn = localStorage.getItem("loggedIn");
    const loggedUsername = localStorage.getItem("username");

    // Se o usuário estiver logado
    if (loggedIn === "true" && loggedUsername) {
        logado(loggedUsername);
        alterarmodal(loggedUsername); 
    } else {
        const toast = new bootstrap.Toast(document.getElementById("toastIntroducao"), {
            delay: 8000  // Define o tempo do toast para 8 segundos
        });
        toast.show();
    }
    // Carrega a foto de perfil salva, caso exista
    const savedProfilePicture = localStorage.getItem("profilePicture");
    if (savedProfilePicture) {
        document.getElementById("currentProfilePicture").src = savedProfilePicture;
    } else {
        document.getElementById("currentProfilePicture").src = "https://via.placeholder.com/100";
    }
    // Aplica o tema salvo (caso tenha)
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
    return fetch('http://localhost:3000/pacientes')
        .then(response => response.json());
}

function saveDatabase(database) {
    return fetch('http://localhost:3000/pacientes', {
        method: 'PUT', // Altera os dados de forma geral
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(database),
    });
}

// Função para obter os dados do banco de dados
function getDatabase() {
    return fetch('http://localhost:3000/pacientes')
        .then(response => response.json());
}

// Função para salvar dados no banco de dados
function saveDatabase(newUser) {
    return fetch('http://localhost:3000/pacientes', {
        method: 'POST', // Altera os dados no banco
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
    });
}

// Função de registro
function register() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    // Verifica se os campos foram preenchidos
    if (!username || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Obter o banco de dados de usuários
    getDatabase()
        .then(database => {
            // Verifica se o usuário já existe
            const userExists = database.some(user => user.username === username);
            if (userExists) {
                alert("Usuário já registrado!");
                return;
            }

            // Adicionando novo usuário ao banco de dados
            const newUser = {
                username,
                password,
                role: "paciente",
                name: "",
                email: "",
                phone: "",
                profilePicture: "",
                cpf:""
            };

            // Salva o novo usuário no banco de dados (sem substituir os dados existentes)
            saveDatabase(newUser)
                .then(() => {
                    console.log("Usuário registrado:", newUser);

                    // Exibe o sucesso do cadastro
                    document.getElementById("registerSuccess").style.display = "block"; 

                    // Alerta notificando o novo cadastro
                    alert(`Novo usuário cadastrado: ${username}`);

                    // Limpar campos após o sucesso do registro
                    document.getElementById("registerUsername").value = '';
                    document.getElementById("registerPassword").value = '';

                    // Após 2 segundos, alterna para a seção de login
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
    localStorage.clear();
    document.getElementById("botaologin").src = "Imagens/User.png"; 
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
                <li class="list-group-item text-center">CPF: <strong>${userInfo.cpf || ''}</strong></li>  <!-- Verificando se o CPF existe -->
                <li class="list-group-item text-center">
                Senha: <strong id="passwordField" style="letter-spacing: 3px;">••••••••</strong>
                <button id="togglePassword" class="btn btn-sm btn-outline-primary ms-2">Mostrar</button>
                </li>
            </ul>
            <div class="modal-footer">
        `;
            document.getElementById("botaofechar").innerText = "Logout";
            document.getElementById("botaoEdicao").style.display = "";
            if (!userInfo.cpf) {
                showToastById("cpfRequiredToast", "Por favor, complete o campo CPF clicando em 'Editar Informações'.");
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

            // Alterando a visibilidade da senha
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
        // Tema Escuro
        document.getElementById("Logo-GilcoHealth").src = 'Imagens/LogoHeader.png';
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
        document.getElementById("Logo-GilcoHealth").src = 'Imagens/LogoHeader.png';
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
// Editor de informações {SPRINT2}
document.getElementById("profileEditForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const cpf = document.getElementById("userCpf").value; 
    const picture = document.getElementById("profilePicture").files[0];
    
    const loggedUsername = localStorage.getItem("username");

    fetch('http://localhost:3000/pacientes')
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
                        cpf, 
                        profilePicture: profilePictureData
                    };

                    fetch(`http://localhost:3000/pacientes/${database[userIndex].id}`, {
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
    const cpf = document.getElementById("userCpf").value; 
    const picture = document.getElementById("profilePicture").files[0];
    const saveButton = document.getElementById("saveButton");

    if (name && email && phone && cpf && picture) {
        saveButton.disabled = false;
    } else {
        saveButton.disabled = true;
    }
});

document.getElementById("profilePicture").addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
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
    delay: 8000 
});

// Função para alternar entre os temas
themeSwitchButton.addEventListener('click', function() {
    // Verifica se o tema atual é o 'claro' ou 'escuro'
    if (document.body.classList.contains('dark-theme')) {
        // Mudar para o tema claro
        document.body.classList.remove('dark-theme');
        themeSwitchButton.textContent = 'Claro';
        document.getElementById('theme-name').textContent = 'Claro'; // Atualiza o texto no toast

    } else {
        // Mudar para o tema escuro
        document.body.classList.add('dark-theme');
        themeSwitchButton.textContent = 'Escuro';
        document.getElementById('theme-name').textContent = 'Escuro'; // Atualiza o texto no toast
    }

    // Mostrar o toast de notificação
    themeToast.show();
    hideToastById("toastIntroducao");
    hideToastById("toastIntroducao");
});

// Requerimento de login para funcionlidades
function handleCardClick(event, targetUrl) {
    event.preventDefault(); 

    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn) {
        // Se o usuário estiver logado, redirecione para a página passada como argumento
        window.location.href = targetUrl;
    } else {
        // Exibe o toast vermelho informando que é necessário login
        showToastById("loginRequiredToast", "Você precisa estar logado para acessar esta funcionalidade!");
        hideToastById("toastIntroducao");
    }
}







