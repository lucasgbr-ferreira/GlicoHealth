function showUsersInDOM() {
    showToastById("loadingToast", "Carregando...");

    fetch("http://localhost:3000/pacientes")
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
            const toggleUsersButton = document.getElementById("toggleUsersButtonPac");
            if (toggleUsersButton) {
                toggleUsersButton.innerHTML = "Atualizar Usuários";
            }
        })
        .catch((error) => {
            console.error("Erro ao acessar o servidor:", error);
            showToastById("loadingToast", "Erro ao carregar usuários. Verifique sua conexão ou tente novamente.");
        });
}
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
function removeUser(userId) {
    // Confirmação antes de remover
    const confirmDelete = confirm(`Deseja realmente remover o usuário com ID ${userId}?`);
    if (!confirmDelete) return;

    // Requisição para remover o usuário
    fetch(`http://localhost:3000/pacientes/${userId}`, {
        method: 'DELETE',
    }).then(() => {
        // Atualiza a lista de usuários sem recarregar a página
        showUsersInDOM();
    }).catch((error) => {
        console.error('Erro ao remover o usuário:', error);
    });
}

// Função para exibir as requisições na interface
function displayRequestsInDOM() {
    showToastById("loadingToast", "Carregando...");

    fetch('http://localhost:3000/requisicoes')
        .then(response => response.json())
        .then(data => {
            const requestsContainer = document.getElementById('requestsCardsContainer');
            requestsContainer.innerHTML = ''; // Limpa o contêiner antes de adicionar novos cards

            // Loop para criar um card para cada requisição
            data.forEach(request => {
                const card = document.createElement('div');
                card.classList.add('col-md-4');
                card.classList.add('mb-4');

                // Define a cor do header com base no status da requisição
                let headerColor = '';
                let statusText = '';
                if (request.status === 'aceita') {
                    headerColor = 'bg-success'; // Cor verde para aceito
                    statusText = 'Aceita'; // Texto do status
                } else if (request.status === 'recusada') {
                    headerColor = 'bg-danger'; // Cor vermelha para recusado
                    statusText = 'Recusada'; // Texto do status
                } else {
                    headerColor = 'bg-warning'; // Cor amarela para pendente
                    statusText = 'Pendente'; // Texto do status
                }

                // Cria o HTML para o card da requisição
                card.innerHTML = `
                    <div class="card">
                        <div class="card-header ${headerColor}">
                            <strong>Requisição de: ${request.username}</strong> - Status: ${statusText}
                        </div>
                        <div class="card-body">
                            <p><strong>Role:</strong> ${request.role}</p>
                            <p><strong>Username:</strong> ${request.username}</p>
                            <p><strong>Senha:</strong> ${request.password}</p>
                            <p><strong>Comentário:</strong> ${request.comment}</p>
                            <div class="text-center">
                                <button id="acceptButton_${request.id}" class="btn btn-success">Aceitar</button>
                                <button id="rejectButton_${request.id}" class="btn btn-danger">Recusar</button>
                                <button id="removeButton_${request.id}" class="btn btn-warning">Remover</button>
                            </div>
                        </div>
                    </div>
                `;
                requestsContainer.appendChild(card);
                showToastById("loadingToast", "Requisições atualizadas com sucesso!");
                const toggleUsersButton = document.getElementById("toggleUsersButtonReq");
                if (toggleUsersButton) {
                    toggleUsersButton.innerHTML = "Atualizar Requisições";
                }

                document.getElementById(`acceptButton_${request.id}`).addEventListener('click', function() {
                    acceptRequest(request.id);
                });

                document.getElementById(`rejectButton_${request.id}`).addEventListener('click', function() {
                    rejectRequest(request.id);
                });

                document.getElementById(`removeButton_${request.id}`).addEventListener('click', function() {
                    removeRequest(request.id, card);
                });
            });
        })
        .catch(error => {
            showToastById("loadingToast", "Servidor fechado ou inacessível. Tente novamente mais tarde.");
        });
}
function acceptRequest(requestId) {
    fetch(`http://localhost:3000/requisicoes/${requestId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'aceita' }) // Status como "aceita"
    })
    .then(response => response.json())
    .then(data => {
        console.log('Requisição aceita:', data);
        alert('Requisição aceita!');
        displayRequestsInDOM();  // Atualiza a lista de requisições e a cor do card
    })
    .catch(error => {
    });
}
function rejectRequest(requestId) {
    fetch(`http://localhost:3000/requisicoes/${requestId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'recusada' }) // Status como "recusada"
    })
    .then(response => response.json())
    .then(data => {
        console.log('Requisição recusada:', data);
        alert('Requisição recusada!');
        displayRequestsInDOM();  // Atualiza a lista de requisições e a cor do card
    })
    .catch(error => {
    });
}
function removeRequest(requestId, cardElement) {
    fetch(`http://localhost:3000/requisicoes/${requestId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            // Se a requisição foi bem-sucedida, removemos o card da interface
            cardElement.remove();
            alert('Requisição removida com sucesso!');
        } else {
            alert('Erro ao remover a requisição.');
        }
    })
    .catch(error => {
    });
}
