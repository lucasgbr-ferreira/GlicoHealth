document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.querySelector("#modalPaciente button[type='submit']");
    const modalPaciente = document.getElementById("modalPaciente");

    function checkLogin() {
        const loggedIn = localStorage.getItem("loggedIn");

        if (!loggedIn) {
            window.location.href = "../paginasIniciais/homePage.html";
        }
    }
    checkLogin();

    let cpfs = [];

    const textFields = ["nomePaciente", "alimentosRestritos", "observacoesGerais", "medicamentosPrescritos", "recomendacoes"];
    textFields.forEach(function (id) {
        const input = document.getElementById(id);
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-ZáéíóúçãõÁÉÍÓÚÇÃÕ \n\r\t]/g, "");
        });
    });

    async function carregarCpfs() {
        try {
            const response = await fetch("http://localhost:3000/pacientes");
            const pacientes = await response.json();
            cpfs = pacientes.map(paciente => paciente.cpf); 
        } catch (error) {
            console.error("Erro ao carregar CPFs:", error);
        }
    }

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

        const cpf = document.getElementById("cpfPaciente").value.trim();
        if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
            alert("CPF inválido. O CPF deve conter exatamente 11 números.");
            return;
        }

        if (hasErrors) {
            return;
        }

        if (!cpfs.includes(cpf)) {
            alert("CPF não encontrado. Não é possível salvar o prontuário.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/pacientes?cpf=${cpf}`);
            const pacientes = await response.json();

            if (pacientes.length === 0) {
                alert("Paciente não encontrado no banco de dados.");
                return;
            }

            const paciente = pacientes[0];

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

            paciente.prontuarios = paciente.prontuarios || [];
            if (paciente.prontuarios.length >= 3) {
                paciente.prontuarios.shift();
            }
            paciente.prontuarios.push(prontuario);

            const updateResponse = await fetch(`http://localhost:3000/pacientes/${paciente.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paciente),
            });

            if (updateResponse.ok) {
                alert("Prontuário salvo com sucesso!");

                modalPaciente.classList.remove("show");
                modalPaciente.style.display = "none";

                document.querySelector("#modalPaciente form").reset();
                location.reload();
            } else {
                alert("Erro ao salvar o prontuário.");
            }
        } catch (error) {
            console.error("Erro ao verificar ou salvar prontuário:", error);
            alert("Ocorreu um erro ao salvar o prontuário.");
        }
    });
});
