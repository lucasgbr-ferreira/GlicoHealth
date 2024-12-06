document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.querySelector("#modalPaciente button[type='submit']");
    const modalPaciente = document.getElementById("modalPaciente");

    // Armazenar os CPFs em um array (inicialmente vazio ou preenchido com dados do servidor)
    let cpfs = [];

    const textFields = ["nomePaciente", "alimentosRestritos", "observacoesGerais", "medicamentosPrescritos", "recomendacoes"];
    textFields.forEach(function (id) {
        const input = document.getElementById(id);
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-ZáéíóúçãõÁÉÍÓÚÇÃÕ \n\r\t]/g, "");
        });
    });

    // Preenche o array de CPFs ao carregar os dados dos pacientes
    async function carregarCpfs() {
        try {
            const response = await fetch("http://localhost:3000/pacientes");
            const pacientes = await response.json();
            cpfs = pacientes.map(paciente => paciente.cpf); // Extrai todos os CPFs
        } catch (error) {
            console.error("Erro ao carregar CPFs:", error);
            alert("Erro ao carregar os dados dos pacientes.");
        }
    }

    // Chama a função para carregar os CPFs ao iniciar a página
    carregarCpfs();

    saveButton.addEventListener("click", async function (event) {
        event.preventDefault();

        let hasErrors = false;

        const fields = [
            { id: "cpfPaciente", message: "CPF do Paciente" },
            { id: "nomePaciente", message: "Nome Completo" },
            { id: "dataNascimentoPaciente", message: "Data de Nascimento" },
            { id: "sexoPaciente", message: "Sexo" },
            { id: "alturaPaciente", message: "Altura (cm)" },
            { id: "pesoPaciente", message: "Peso Atual (kg)" },
            { id: "dataConsulta", message: "Data da Consulta" },
            { id: "limiteCarboidratos", message: "Limite Diário de Carboidratos (g)" },
            { id: "metaCaloriasQueimadas", message: "Calorias a Serem Queimadas (kcal)" },
            { id: "tempoAtividadeMinima", message: "Tempo Mínimo de Atividade Física (minutos)" },
            { id: "glicemiaJejum", message: "Glicemia em Jejum (mg/dL)" },
            { id: "glicemiaPosPrandial", message: "Glicemia Pós-Prandial (mg/dL)" },
            { id: "glicemiaNoturna", message: "Glicemia Noturna (mg/dL)" },
            { id: "alimentosRestritos", message: "Alimentos Restritos" },
            { id: "observacoesGerais", message: "Observações Gerais" },
            { id: "medicamentosPrescritos", message: "Medicamentos Prescritos" },
            { id: "recomendacoes", message: "Recomendações" },
        ];

        fields.forEach(function (field) {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                alert(`Por favor, preencha o campo: ${field.message}`);
                hasErrors = true;
            }
        });

        // Validação do CPF (deve ter 11 dígitos)
        const cpf = document.getElementById("cpfPaciente").value.trim();
        if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
            alert("CPF inválido. O CPF deve conter exatamente 11 números.");
            return;
        }

        if (hasErrors) {
            return; // Impede o salvamento se houver campos obrigatórios não preenchidos
        }

        // Verificar se o CPF informado já existe no array de CPFs
        if (!cpfs.includes(cpf)) {
            alert("CPF não encontrado. Não é possível salvar o prontuário.");
            return;
        }

        try {
            // Busca o paciente correspondente ao CPF
            const response = await fetch(`http://localhost:3000/pacientes?cpf=${cpf}`);
            const pacientes = await response.json();

            if (pacientes.length === 0) {
                alert("Paciente não encontrado no banco de dados.");
                return;
            }

            const paciente = pacientes[0]; // Assume que o primeiro paciente é o correto

            // Criação do prontuário com todos os campos preenchidos
            const prontuario = {
                dataConsulta: document.getElementById("dataConsulta").value,
                nome: document.getElementById("nomePaciente").value,
                nascimento: document.getElementById("dataNascimentoPaciente").value,
                sexo: document.getElementById("sexoPaciente").value,
                altura: document.getElementById("alturaPaciente").value,
                peso: document.getElementById("pesoPaciente").value,
                limites: {
                    carboidratos: document.getElementById("limiteCarboidratos").value,
                    caloriasQueimadas: document.getElementById("metaCaloriasQueimadas").value,
                    atividadeMinima: document.getElementById("tempoAtividadeMinima").value,
                },
                glicemias: {
                    jejum: document.getElementById("glicemiaJejum").value,
                    posPrandial: document.getElementById("glicemiaPosPrandial").value,
                    noturna: document.getElementById("glicemiaNoturna").value,
                },
                alimentosRestritos: document.getElementById("alimentosRestritos").value,
                observacoes: {
                    gerais: document.getElementById("observacoesGerais").value,
                    medicamentos: document.getElementById("medicamentosPrescritos").value,
                    recomendacoes: document.getElementById("recomendacoes").value,
                },
            };

            // Se o paciente já tiver 3 prontuários, remove o mais antigo
            paciente.prontuarios = paciente.prontuarios || [];
            if (paciente.prontuarios.length >= 3) {
                paciente.prontuarios.shift(); // Remove o primeiro (mais antigo)
            }
            paciente.prontuarios.push(prontuario); // Adiciona o novo prontuário

            // Atualiza os dados do paciente no servidor
            const updateResponse = await fetch(`http://localhost:3000/pacientes/${paciente.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paciente),
            });

            if (updateResponse.ok) {
                alert("Prontuário salvo com sucesso!");

                // Fecha o modal
                modalPaciente.classList.remove("show");
                modalPaciente.style.display = "none";

                // Reseta o formulário
                document.querySelector("#modalPaciente form").reset();
            } else {
                alert("Erro ao salvar o prontuário.");
            }
        } catch (error) {
            console.error("Erro ao verificar ou salvar prontuário:", error);
            alert("Ocorreu um erro ao salvar o prontuário.");
        }
    });
});
