document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:3000/pacientes";
    const container = document.querySelector(".consultas-container");
    const prontuarioContainer = document.querySelector(".prontuario-info");

    const createProfileCard = (paciente) => {
        const perfilDiv = document.createElement("div");
        perfilDiv.classList.add("row", "m-3", "p-2","justify-content-evenly","align-items-center","alert","alert-primary");
        perfilDiv.setAttribute("data-id", paciente.id);

        const consulta = document.createElement("div");
        consulta.classList.add("col-auto","align-items-center");

        const dataConsulta = document.createElement("p");
        dataConsulta.classList.add("m-0","fw-bold");
        dataConsulta.textContent = paciente.dataConsulta;

        const consultaOnline = document.createElement("p");
        consultaOnline.classList.add("m-0");
        consultaOnline.textContent = "Consulta Online";

        const pacienteSpan = document.createElement("span");
        pacienteSpan.classList.add("col-auto", "d-block", "fw-bold","fs-5");
        pacienteSpan.textContent = paciente.nome;

        const prontuarioSpan = document.createElement("span");
        prontuarioSpan.classList.add("col-auto", "text-primary","mt-2","m-md-0");
        prontuarioSpan.style.cursor = "pointer";
        prontuarioSpan.textContent = "Ver Prontuário";

        prontuarioSpan.addEventListener("click", () => {
            fillProntuario(paciente);
        });

        consulta.appendChild(dataConsulta);
        consulta.appendChild(consultaOnline)
        perfilDiv.appendChild(consulta);
        perfilDiv.appendChild(pacienteSpan);
        perfilDiv.appendChild(prontuarioSpan);

        return perfilDiv;
    };

    const fillProntuario = (paciente) => {
        prontuarioContainer.innerHTML = `
            <h4 class="text-primary opacity-50">Informações da consulta</h4>
            <p><strong>Nome do Paciente:</strong> ${paciente.nome}</p>
            <p><strong>Data de nascimento:</strong> ${paciente.nascimento}</p>
            <p><strong>Data da consulta:</strong> ${paciente.dataConsulta}</p>
            <p><strong>Sexo:</strong> ${paciente.sexo}</p>
            <p><strong>Altura:</strong> ${paciente.altura} cm</p>
            <p><strong>Peso:</strong> ${paciente.peso} kg</p>
            <h4 class="text-primary opacity-50">Limites e Metas</h4>
            <p><strong>Índice Glicêmico:</strong> ${paciente.limites.carboidratos} mg/dL</p>
            <p><strong>Calorias Queimadas:</strong> ${paciente.limites.caloriasQueimadas} kcal</p>
            <h4 class="text-primary opacity-50">Exames Realizados</h4>
            <p><strong>Glicemia em jejum:</strong> ${paciente.glicemias.jejum}</p>
            <p><strong>Glicemia pós-prandial:</strong> ${paciente.glicemias.posPrandial || "Não especificado"}</p>
            <p><strong>Glicemia noturna:</strong> ${paciente.glicemias.noturna || "Não especificado"}</p>
            <h4 class="text-primary opacity-50">Histórico e Observações</h4>
            <p><strong>Diabetes Mellitus:</strong> ${paciente.limites.atividadeMinima}</p>
            <p><strong>Medicamentos:</strong> ${paciente.observacoes.medicamentos || "Nenhum"}</p>
            <p><strong>Recomendações:</strong> ${paciente.observacoes.recomendacoes || "Nenhuma"}</p>
            <p><strong>Observações gerais:</strong> ${paciente.observacoes.gerais || "Nenhuma"}</p>
        `;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "mt-3");
        deleteButton.innerHTML = '<i class="fa-solid fa-trash fs-3"></i> Excluir Prontuário';

        deleteButton.addEventListener("click", () => {
            excluirProntuario(paciente.id);
        });

        prontuarioContainer.appendChild(deleteButton);
    };

    const loadProfiles = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Erro ao carregar dados da API.");
            const pacientes = await response.json();
            container.innerHTML = ""; 
            pacientes.forEach((paciente) => {
                const profileCard = createProfileCard(paciente);
                container.appendChild(profileCard);
            });
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    const excluirProntuario = (idPaciente) => {
        fetch(`${apiUrl}/${idPaciente}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Prontuário excluído:", data);
                alert("Prontuário excluído com sucesso!");
                loadProfiles();
            })
            .catch((error) => {
                console.error("Erro ao excluir:", error);
                alert("Erro ao excluir o prontuário.");
            });
    };

    loadProfiles();
});

function checkLogin() {
    const loggedIn = localStorage.getItem("loggedIn");

    // Se o usuário não estiver logado, redireciona para a página de login
    if (!loggedIn) {
        window.location.href = "../../InterfaceUsuário/Index.html";
    } else {
        // Se o usuário estiver logado, exibe um alerta informando que ele está logado
        const username = localStorage.getItem("username");
        if (username) {
            alert(`Você está logado como ${username}`);  // Exibe o alerta
            displayWelcomeMessage(username);  // Exibe a mensagem de boas-vindas
        }
    }
}

function displayWelcomeMessage(username) {
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bem-vindo, ${username}!`;
    }
}

// Chama a função checkLogin quando a página for carregada
document.addEventListener("DOMContentLoaded", checkLogin);
