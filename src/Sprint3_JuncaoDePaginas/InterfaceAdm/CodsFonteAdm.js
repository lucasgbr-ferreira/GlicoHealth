// Função para exibir User:Pacientes
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
                                <button class="btn btn-danger btn-sm" onclick="removePac('${user.id}')">Remover</button>
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
function removePac(userId) {
    const confirmDelete = confirm(`Deseja realmente remover o usuário com ID ${userId}?`);
    if (!confirmDelete) return;
    fetch(`http://localhost:3000/pacientes/${userId}`, {
        method: 'DELETE',
    }).then(() => {
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
            requestsContainer.innerHTML = '';
            data.forEach(request => {
                const card = document.createElement('div');
                card.classList.add('col-md-4');
                card.classList.add('mb-4');

                // Define a cor do header com base no status da requisição
                let headerColor = '';
                let statusText = '';
                if (request.status === 'aceita') {
                    headerColor = 'bg-success'; 
                    statusText = 'Aceita'; 
                } else if (request.status === 'recusada') {
                    headerColor = 'bg-danger'; 
                    statusText = 'Recusada'; 
                } else {
                    headerColor = 'bg-warning'; 
                    statusText = 'Pendente'; 
                }

                // Criando HTML para o card da requisição
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
        body: JSON.stringify({ status: 'aceita' })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Requisição aceita:', data);
        alert('Requisição aceita!');
        displayRequestsInDOM();
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
        body: JSON.stringify({ status: 'recusada' })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Requisição recusada:', data);
        alert('Requisição recusada!');
        displayRequestsInDOM(); 
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
            cardElement.remove();
            alert('Requisição removida com sucesso!');
        } else {
            alert('Erro ao remover a requisição.');
        }
    })
    .catch(error => {
    });
}

//Função para mostrar Users:Médicos
function showMedicsInDOM() {
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
            const medicsCardsContainer = document.getElementById("medicsCardsContainer");
            medicsCardsContainer.innerHTML = "";

            if (database.length === 0) {
                medicsCardsContainer.innerHTML = "<p class='text-center'>Nenhum médico registrado.</p>";
            } else {
                database.forEach((medic) => {
                    const card = document.createElement("div");
                    card.className = "col-12 col-md-4";
                    card.innerHTML = `
                        <div class="card d-flex flex-column" style="height: 100%; border-radius: 20px; max-width: 100%; ">
                            <img src="${medic.profilePicture || 'https://via.placeholder.com/100'}" alt="Foto do Usuário" style="max-width: 100px; height: 100px; object-fit: cover;" class="rounded-circle mb-2 mx-auto">
                            <h5 class="text-center">${medic.username}</h5>
                            <p class="text-center"><strong>Nome:</strong> ${medic.name || "Não informado"}</p>
                            <p class="text-center"><strong>Email:</strong> ${medic.email || "Não informado"}</p>
                            <p class="text-center"><strong>Telefone:</strong> ${medic.phone || "Não informado"}</p>
                            <p class="text-center"><strong>Senha:</strong> ${medic.password || "Não informado"}</p>
                            <p class="text-center"><strong>CPF:</strong> ${medic.crm || "Não informado"}</p>
                            <div class="d-flex justify-content-center mt-auto">
                                <button class="btn btn-danger btn-sm" onclick="removeUser('${medic.id}')">Remover</button>
                            </div>
                        </div>
                    `;
                    medicsCardsContainer.appendChild(card);
                });
            }
            showToastById("loadingToast", "Médicos atualizados com sucesso!");
            const toggleMedicsButton = document.getElementById("toggleMedicsButton");
            if (toggleMedicsButton) {
                toggleMedicsButton.innerHTML = "Atualizar Médicos";
            }
        })
        .catch((error) => {
            console.error("Erro ao acessar o servidor:", error);
            showToastById("loadingToast", "Erro ao carregar médicos. Verifique sua conexão ou tente novamente.");
        });
}
function removeUser(medicID) {
    const confirmDelete = confirm(`Deseja realmente remover o usuário com ID ${medicID}?`);
    if (!confirmDelete) return;

    fetch(`http://localhost:3000/medicos/${medicID}`, {
        method: 'DELETE',
    }).then(() => {
        showUsersInDOM();
    }).catch((error) => {
        console.error('Erro ao remover o usuário:', error);
    });
}



  
