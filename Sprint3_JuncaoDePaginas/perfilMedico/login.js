// Login e Cadastro
function toggleSection() {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    loginSection.style.display = loginSection.style.display === "none" ? "block" : "none";
    registerSection.style.display = registerSection.style.display === "none" ? "block" : "none";
}

function register() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    if (username && password) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        document.getElementById("registerSuccess").style.display = "block";
        setTimeout(() => {
            toggleSection(); 
            document.getElementById("registerSuccess").style.display = "none";
        }, 2000);
    }
}

function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    if (username === storedUsername && password === storedPassword) {
        alert("Login bem-sucedido!");
        document.getElementById("loginError").style.display = "none";
        alterarmodal();
        logado();
        updateProfile(username); // Atualiza o nome na tela
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

function logado() {
    document.getElementById("botaologin").src = "/Sprint1/InterfaceUsuário/Imagens/User-logado.png"
    document.getElementById("botaofechar").innerText = "Logout"
}

// Atualizando informações após o login 
function updateProfile(username) {
    document.getElementById("profileUsername-1").innerText = username; // Atualiza o nome no bem vindo 
    document.getElementById("profileUsername-2").innerText = username; // Atualiza o nome do perfil 
    document.getElementById("userProfile").style.display = "block"; // Exibe a seção de perfil
}

// Coreções Modal
const modal = document.getElementById('exampleModal');
modal.addEventListener('show.bs.modal', function () {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.style.display = 'none'; // Oculta o backdrop ao abrir o modal
    }
});

modal.addEventListener('hidden.bs.modal', function () {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove(); // Remove o backdrop quando o modal for fechado
    }
});

function alterarmodal() {
    const modalBody = document.querySelector('.modal-body');
    const userInfo = {
        username: localStorage.getItem("username"),
    };
    modalBody.innerHTML = `
        <h2 class="text-center text-success">Bem-vindo, ${userInfo.username}!</h2>
        <p class="text-muted text-center">Seu login foi bem-sucedido.</p>
        <p class="text-center">Aqui estão suas informações:</p>
        <ul class="list-group">
            <li class="list-group-item">Usuário: <strong>${userInfo.username}</strong></li>
        </ul>`;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}
