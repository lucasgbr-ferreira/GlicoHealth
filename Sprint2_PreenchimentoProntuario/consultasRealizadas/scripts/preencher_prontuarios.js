document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.querySelector("#modalPaciente button[type='submit']");

    const textFields = ["nomePaciente", "alimentosRestritos","observacoesGerais", "medicamentosPrescritos", "recomendacoes"];
    textFields.forEach(function (id) {
        const input = document.getElementById(id);
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-ZáéíóúçãõÁÉÍÓÚÇÃÕ \n\r\t]/g, "");
        });
    });

    saveButton.addEventListener("click", function (event) {
        event.preventDefault();

        let hasErrors = false;

        const fields = [
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
        ];

        fields.forEach(function (field) {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                hasErrors = true;
            }
        });

        if (hasErrors) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const formData = {
            nome: document.getElementById("nomePaciente").value,
            nascimento: document.getElementById("dataNascimentoPaciente").value,
            sexo: document.getElementById("sexoPaciente").value,
            altura: document.getElementById("alturaPaciente").value,
            peso: document.getElementById("pesoPaciente").value,
            dataConsulta: document.getElementById("dataConsulta").value,
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

        fetch("http://localhost:3000/pacientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Dados salvos:", data);
            alert("Dados salvos com sucesso!");
        })
        .catch(error => {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar os dados.");
        });
    });

    function excluirProntuario(idPaciente) {
        fetch(`http://localhost:3000/pacientes/${idPaciente}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log("Prontuário excluído:", data);
            alert("Prontuário excluído com sucesso!");
        })
        .catch(error => {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir o prontuário.");
        });
    }

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const idPaciente = this.dataset.idPaciente;
            excluirProntuario(idPaciente);
        });
    });
});
