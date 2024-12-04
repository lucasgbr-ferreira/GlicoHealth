//Carregamento da página
window.onload = function() {
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

// Login e Cadastro {SPRINT1}
function toggleSection() {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    loginSection.style.display = loginSection.style.display === "none" ? "block" : "none";
    registerSection.style.display = registerSection.style.display === "none" ? "block" : "none";
}
function getDatabase() {
    const database = localStorage.getItem("userDatabase");
    return database ? JSON.parse(database) : [];
}

function saveDatabase(database) {
    localStorage.setItem("userDatabase", JSON.stringify(database));
}
function register() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    if (username && password) {
        const database = getDatabase();
        
        const userExists = database.some(user => user.username === username);
        if (userExists) {
            alert("Usuário já registrado!");
            return;
        }
        // Adicionando novo usuário
        database.push({ username, password });
        saveDatabase(database);
        console.log("Usuário registrado:", { username, password });

        document.getElementById("registerSuccess").style.display = "block";
        setTimeout(() => {
            toggleSection();
            document.getElementById("registerSuccess").style.display = "none";
        }, 2000);
    } else {
        alert("Por favor, preencha todos os campos.");
    }
}
function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const database = getDatabase();

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

    window.location.href = "../InterfaceUsuário/Index.html"; 
}

// Coreções Modal
const database = getDatabase();
const loggedUsername = localStorage.getItem("username");

function alterarmodal(username) {
    const modalBody = document.querySelector('.modal-body');
    const database = getDatabase();
    
    // Encontrando usuário no banco de dados
    function findUserByUsername(username) {
        return database.find(user => user.username === username);
    }
    const userInfo = findUserByUsername(username);
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
            <li class="list-group-item text-center">
            Senha: <strong id="passwordField" style="letter-spacing: 3px;">••••••••</strong>
            <button id="togglePassword" class="btn btn-sm   btn-outline-primary ms-2">Mostrar</button>
            </li>

        </ul>
        <div class="modal-footer">
    `;
            document.getElementById("botaofechar").innerText = "Logout";
            document.getElementById("botaoEdicao").style.display = "";
    } else {
        modalBody.innerHTML = `
            <h2 class="text-center text-danger">Erro ao carregar informações!</h2>
            <p class="text-danger text-center">Usuário não encontrado no banco de dados.</p>`;
    }
}
// Ocultador de senha
document.addEventListener("click", function (event) {
    if (event.target.id === "togglePassword") {
        const passwordField = document.getElementById("passwordField");
        const database = getDatabase();
        const loggedUsername = localStorage.getItem("username");
    
        if (!loggedUsername) {
            console.error("Nenhum usuário está logado.");
            return;
        }
        const user = database.find(user => user.username === loggedUsername);
        
        if (!user) {
            console.error("Usuário logado não encontrado no banco de dados.");
            return;
        }

        // Alterarando a visibilidade da senha
        if (passwordField.textContent === "••••••••") {
            passwordField.textContent = user.password;
            event.target.textContent = "Ocultar";
        } else {
            passwordField.textContent = "••••••••";
            event.target.textContent = "Mostrar";
        }
    }
});
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

// Alterar cor de tema (Função dinâmica)
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

    
    const toastElement = document.getElementById('theme-toast');
    const toast = new bootstrap.Toast(toastElement, {
        delay: 8000 
    });
    toast.show();
}
function updateThemeStyles() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        // Tema Escuro
        document.getElementById("Logo-GilcoHealth").src = 'images/Logo-GilcoHealth.png';
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
        document.getElementById("Logo-GilcoHealth").src = 'images/Logo-GilcoHealth.png';
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

//Controlador de acesso: Usuários Pacientes {SPRINT2}
function showUsersInDOM() {
    const database = getDatabase();
    const userCardsContainer = document.getElementById("userCardsContainer");

    userCardsContainer.innerHTML = "";

    if (database.length === 0) {
        userCardsContainer.innerHTML = "<p class='text-center'>Nenhum usuário registrado.</p>";
    } else {
        database.forEach((user, index) => {
            const card = document.createElement("div");
            card.className = "col-md-4";
            document.getElementById("toggleUsersButton").innerHTML ="Atualizar usuários"

            card.innerHTML = `
            <div class="card d-flex flex-column" style="height: 100%; border-radius: 20px; max-width: 100%;">
                <img src="${user.profilePicture || 'https://via.placeholder.com/100'}" alt="Foto do Usuário" style="max-width: 100px; height: 100px; object-fit: cover;" class="rounded-circle mb-2 mx-auto">
                <h5 class="text-center">${user.username}</h5>
                <p class="text-center"><strong>Nome:</strong> ${user.name || "Não informado"}</p>
                <p class="text-center"><strong>Email:</strong> ${user.email || "Não informado"}</p>
                <p class="text-center"><strong>Telefone:</strong> ${user.phone || "Não informado"}</p>
                <p class="text-center"><strong>Senha:</strong> ${user.password || "Não informado"}</p>
                <div class="d-flex justify-content-center mt-auto">
                    <button class="btn btn-danger btn-sm" onclick="removeUser(${index})">Remover</button>
                </div>
            </div>
        `;

            userCardsContainer.appendChild(card);
        });
    }
}
// Remove usuários
function removeUser(index) {
    const database = getDatabase();

    const confirmDelete = confirm(`Deseja realmente remover o usuário ${database[index].username}?`);
    if (!confirmDelete) return;

    database.splice(index, 1);
    saveDatabase(database);
    showUsersInDOM();
}
function showToastById() {
    const toastElement = document.getElementById("updateToast");
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement, {
            delay: 7000 
        });
        toast.show();
    } else {
        console.error("Toast não encontrado!");
    }
}


// Editor de informações {SPRINT2}
document.getElementById("profileEditForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const picture = document.getElementById("profilePicture").files[0];

    
    const loggedUsername = localStorage.getItem("username");
    const database = getDatabase();

    // Encontrar e atualizar usuário
    const userIndex = database.findIndex(user => user.username === loggedUsername);
    if (userIndex !== -1) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const profilePictureData = picture ? event.target.result : null;

            
            database[userIndex] = {
                ...database[userIndex],
                name,
                email,
                phone,
                profilePicture: profilePictureData 
            };

            saveDatabase(database);
            console.log("Usuário atualizado:", database[userIndex]);

            alert("Alterações salvas com sucesso!");
            const offcanvas = bootstrap.Offcanvas.getInstance(
                document.getElementById("offcanvasWithBothOptions")
            );
            offcanvas.hide();
        };

        // Lendo imagem
        if (picture) {
            reader.readAsDataURL(picture);
        } else {
            reader.onload();
        }
    } else {
        alert("Erro: Usuário não encontrado!");
    }
});
// Salvamento das informações editadas pelo usuário
document.getElementById("profileEditForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const picture = document.getElementById("profilePicture").files[0];

    if (!name || !email || !phone || !picture) {
        alert("Por favor, preencha todos os campos antes de salvar, incluindo a foto!");
        return; 
    }
});
function saveChangesAndReload() {
    localStorage.setItem("showModalAfterReload", "true");
    window.location.reload();
}
// Habilitando e desabilitando botão de salvar
document.getElementById("profileEditForm").addEventListener("input", function () {
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const picture = document.getElementById("profilePicture").files[0];
    const saveButton = document.getElementById("saveButton");

    if (name && email && phone && picture) {
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
            // Atualizando a imagem no offcanvas
            document.getElementById("currentProfilePicture").src = e.target.result;
            const modalProfilePicture = document.getElementById("userProfilePicture");
            if (modalProfilePicture) {
                modalProfilePicture.src = e.target.result;
            }

            // Salvando a imagem no localStorage
            const loggedInUsername = localStorage.getItem("username");
            if (loggedInUsername) {
                const database = localStorage.getItem("userDatabase");
                const users = database ? JSON.parse(database) : [];

                const userIndex = users.findIndex(user => user.username === loggedInUsername);
                if (userIndex !== -1) {
                    users[userIndex].profilePicture = e.target.result;
                    localStorage.setItem("userDatabase", JSON.stringify(users));
                }
            }
        };

        reader.readAsDataURL(file);
    }
});
