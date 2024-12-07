document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:3000/pacientes";
    const container = document.querySelector(".consultas-container");
    const prontuarioContainer = document.querySelector(".prontuario-info");

    // Função para criar os cartões de perfil para pacientes com prontuários
    const createProfileCard = (paciente) => {
        const profileCard = document.createElement("div");
        profileCard.classList.add(
            "row",
            "m-3",
            "p-2",
            "justify-content-lg-between",
            "align-items-center",
            "alert",
            "alert-primary"
        );
        profileCard.setAttribute("data-id", paciente.id);

        const consultaInfo = document.createElement("div");
        consultaInfo.classList.add("col-auto", "align-items-center");

        const dataConsulta = document.createElement("p");
        dataConsulta.classList.add("m-0", "fw-bold");
        dataConsulta.textContent = paciente.prontuarios[0].dataConsulta;

        const consultaOnline = document.createElement("p");
        consultaOnline.classList.add("m-0");
        consultaOnline.textContent = "Consulta Online";

        const pacienteNome = document.createElement("span");
        pacienteNome.classList.add("col-auto", "d-block", "fw-bold", "fs-5");
        pacienteNome.textContent = paciente.prontuarios[0].nome;

        const prontuarioLink = document.createElement("span");
        prontuarioLink.classList.add("col-auto", "text-primary", "mt-2", "m-md-0");
        prontuarioLink.style.cursor = "pointer";
        prontuarioLink.textContent = "Ver Prontuário";

        prontuarioLink.addEventListener("click", () => {
            displayProntuario(paciente, 0); // Exibe o primeiro prontuário
        });

        consultaInfo.appendChild(dataConsulta);
        consultaInfo.appendChild(consultaOnline);
        profileCard.appendChild(consultaInfo);
        profileCard.appendChild(pacienteNome);
        profileCard.appendChild(prontuarioLink);

        return profileCard;
    };

    // Função para exibir os detalhes do prontuário no painel lateral
    const displayProntuario = (paciente, index) => {
        const prontuario = paciente.prontuarios[index];
        if (!prontuario) return;

        prontuarioContainer.innerHTML = `
            <h4 class="text-primary opacity-50">Informações da Consulta</h4>
            <p><strong>Nome do Paciente:</strong> ${prontuario.nome}</p>
            <p><strong>Data de Nascimento:</strong> ${prontuario.nascimento}</p>
            <p><strong>Data da Consulta:</strong> ${prontuario.dataConsulta}</p>
            <p><strong>Sexo:</strong> ${prontuario.sexo}</p>
            <p><strong>Altura:</strong> ${prontuario.altura} cm</p>
            <p><strong>Peso:</strong> ${prontuario.peso} kg</p>
            <h4 class="text-primary opacity-50">Limites e Metas</h4>
            <p><strong>Limite de Carboidratos:</strong> ${prontuario.limites.carboidratos} g</p>
            <p><strong>Calorias Queimadas:</strong> ${prontuario.limites.caloriasQueimadas} kcal</p>
            <p><strong>Tipo de Diabetes:</strong> ${prontuario.limites.atividadeMinima || "Não especificado"}</p>
            <h4 class="text-primary opacity-50">Exames Realizados</h4>
            <p><strong>Glicemia em Jejum:</strong> ${prontuario.glicemias.jejum}</p>
            <p><strong>Glicemia Pós-Prandial:</strong> ${prontuario.glicemias.posPrandial || "Não especificado"}</p>
            <p><strong>Glicemia Noturna:</strong> ${prontuario.glicemias.noturna || "Não especificado"}</p>
            <h4 class="text-primary opacity-50">Observações e Histórico</h4>
            <p><strong>Medicamentos:</strong> ${prontuario.observacoes.medicamentos || "Nenhum"}</p>
            <p><strong>Recomendações:</strong> ${prontuario.observacoes.recomendacoes || "Nenhuma"}</p>
            <p><strong>Observações Gerais:</strong> ${prontuario.observacoes.gerais || "Nenhuma"}</p>
        `;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "mt-3");
        deleteButton.innerHTML = '<i class="fa-solid fa-trash fs-3"></i> Excluir Prontuário';

        deleteButton.addEventListener("click", () => {
            deleteProntuario(paciente.id, index);
        });

        prontuarioContainer.appendChild(deleteButton);

        // Adiciona navegação entre prontuários
        if (paciente.prontuarios.length > 1) {
            const prevButton = document.createElement("button");
            prevButton.classList.add("btn", "btn-secondary", "mt-3", "ms-3");
            prevButton.innerText = "← Prontuário Anterior";
            prevButton.disabled = index === 0;
            prevButton.addEventListener("click", () => {
                displayProntuario(paciente, index - 1);
            });

            const nextButton = document.createElement("button");
            nextButton.classList.add("btn", "btn-secondary", "mt-3", "ms-2");
            nextButton.innerText = "Prontuário Seguinte →";
            nextButton.disabled = index === paciente.prontuarios.length - 1;
            nextButton.addEventListener("click", () => {
                displayProntuario(paciente, index + 1);
            });

            prontuarioContainer.appendChild(prevButton);
            prontuarioContainer.appendChild(nextButton);
        }
    };

    // Função para carregar os pacientes com prontuários
    const loadPatientsWithProntuarios = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Erro ao carregar dados da API.");

            const pacientes = await response.json();
            const pacientesComProntuarios = pacientes.filter((p) => p.prontuarios && p.prontuarios.length > 0);

            container.innerHTML = ""; // Limpa o container
            if (pacientesComProntuarios.length === 0) {
                container.innerHTML = "<p>Nenhum prontuário encontrado.</p>";
                return;
            }

            pacientesComProntuarios.forEach((paciente) => {
                const profileCard = createProfileCard(paciente);
                container.appendChild(profileCard);
            });
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
            container.innerHTML = "<p>Erro ao carregar os prontuários. Tente novamente mais tarde.</p>";
        }
    };

    // Função para excluir o prontuário de um paciente
    const deleteProntuario = async (idPaciente, index) => {
        try {
            const response = await fetch(`${apiUrl}/${idPaciente}`);
            if (!response.ok) throw new Error("Erro ao carregar paciente para excluir prontuário.");

            const paciente = await response.json();

            const updatedProntuarios = [
                ...paciente.prontuarios.slice(0, index),
                ...paciente.prontuarios.slice(index + 1),
            ]; // Remove o prontuário selecionado

            const updateResponse = await fetch(`${apiUrl}/${idPaciente}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prontuarios: updatedProntuarios }),
            });

            if (!updateResponse.ok) throw new Error("Erro ao excluir o prontuário.");
            alert("Prontuário excluído com sucesso!");
            // Recarrega os pacientes e prontuários para refletir as mudanças
            loadPatientsWithProntuarios();
        } catch (error) {
            console.error("Erro ao excluir o prontuário:", error);
            alert("Erro ao excluir o prontuário. Tente novamente mais tarde.");
        }
    };

    // Inicializa o carregamento dos pacientes com prontuários
    loadPatientsWithProntuarios();
});
