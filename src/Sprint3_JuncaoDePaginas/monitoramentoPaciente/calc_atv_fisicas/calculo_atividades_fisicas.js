const apiUrl = 'http://localhost:3000';
let caloriasIdeais = 1200;
let totalCaloriasQueimadas = parseFloat(localStorage.getItem('totalCaloriasQueimadas')) || 0;

function exibirDiaDaSemana() {
    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    document.getElementById('diaSemana').textContent = `Hoje, ${diasDaSemana[diaSemana]}`;
}

function atualizarBarraProgresso() {
    const progresso = (totalCaloriasQueimadas / caloriasIdeais) * 100;
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${Math.min(progresso, 100)}%`;
    progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
}

function showToast(message) {
    const toastMessage = document.getElementById("toastMessage");
    toastMessage.textContent = message;
    const toastElement = new bootstrap.Toast(document.getElementById("loginToast"));
    toastElement.show();
}

function displayWelcomeMessage(username) {
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bem-vindo, ${username}!`;
    }
}

async function obterPacienteIdPorUsername(username) {
    try {
        const response = await fetch(`${apiUrl}/pacientes?username=${username}`);
        if (!response.ok) throw new Error('Erro ao buscar ID do paciente.');
        const pacientes = await response.json();
        if (pacientes && pacientes.length > 0) return pacientes[0].id;
        throw new Error('Paciente não encontrado.');
    } catch (error) {
        showToast('Erro ao obter informações do paciente. Verifique sua conexão ou tente novamente.');
        console.error('Erro ao obter ID do paciente:', error.message);
        return null;
    }
}

async function carregarCaloriasIdeais(pacienteId) {
    try {
        const response = await fetch(`${apiUrl}/pacientes/${pacienteId}`);
        if (!response.ok) throw new Error('Erro ao carregar dados do paciente.');

        const paciente = await response.json();
        if (paciente && paciente.prontuarios && paciente.prontuarios.length > 0) {
            const prontuario = paciente.prontuarios[paciente.prontuarios.length - 1];
            const metaCalorias = prontuario.limites.caloriasQueimadas;

            if (metaCalorias && !isNaN(metaCalorias)) {
                caloriasIdeais = parseFloat(metaCalorias); 
                atualizarBarraProgresso();
                showToast(`Meta diária de calorias: ${caloriasIdeais} Kcal.`);
                return true;
            } else {
                showToast('Meta diária de calorias não encontrada ou inválida.');
                desabilitarCalculo();
                return false;
            }
        } else {
            showToast('Prontuário do paciente não encontrado.');
            desabilitarCalculo();
            return false;
        }
    } catch (error) {
        console.error('Erro ao carregar meta de calorias:', error.message);
        showToast('Erro ao carregar informações do paciente.');
        desabilitarCalculo();
        return false;
    }
}

function desabilitarCalculo() {
    const buttons = document.querySelectorAll('.btn-outline-primary');
    buttons.forEach(button => button.disabled = true);
    showToast('Cálculo de calorias desabilitado. Prontuário necessário.');
}


function calcularCaloriasQueimadas(select, input, caloriasDiv, index) {
    const atividade = select.options[select.selectedIndex];
    const tempo = parseFloat(input.value);
    const caloriasPorMinuto = parseFloat(atividade.dataset.caloriasPorMinuto);

    if (!tempo || !caloriasPorMinuto) {
        alert("Selecione uma atividade e insira um tempo válido.");
        return;
    }

    const resultado = caloriasPorMinuto * tempo;
    const caloriasAtuais = parseFloat(caloriasDiv.textContent) || 0;
    const novasCaloriasQueimadas = caloriasAtuais + resultado;

    caloriasDiv.innerHTML = `<b>${novasCaloriasQueimadas.toFixed(2)} Kcal</b>`;
    totalCaloriasQueimadas += resultado;

    localStorage.setItem('totalCaloriasQueimadas', totalCaloriasQueimadas);
    localStorage.setItem(`caloriasQueimadasAtividade${index}`, novasCaloriasQueimadas);

    atualizarBarraProgresso();
}

function zerarCaloriasQueimadas(caloriasDiv, index) {
    const caloriasAtuais = parseFloat(caloriasDiv.textContent) || 0;
    totalCaloriasQueimadas -= caloriasAtuais;

    localStorage.setItem('totalCaloriasQueimadas', totalCaloriasQueimadas);
    localStorage.setItem(`caloriasQueimadasAtividade${index}`, 0);
    caloriasDiv.innerHTML = `<b>0 Kcal</b>`;

    atualizarBarraProgresso();
}

async function checkLogin() {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
        window.location.href = "../../InterfaceUsuário/Index.html";
        return;
    }

    const username = localStorage.getItem("username");
    if (username) {
        showToast(`Exibindo cálculo de calorias para: ${username}`);
        displayWelcomeMessage(username);

        const idPaciente = await obterPacienteIdPorUsername(username);
        if (idPaciente) {
            const metaCarregada = await carregarCaloriasIdeais(idPaciente);
            if (!metaCarregada) {
                showToast("O paciente não possui prontuário com meta de calorias. O cálculo foi desabilitado.");
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    exibirDiaDaSemana();

    fetch(`${apiUrl}/atividadesFisicas`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar atividades físicas.');
            return response.json();
        })
        .then(atividades => {
            const selects = document.querySelectorAll('.form-select');
            selects.forEach((select, index) => {
                atividades.forEach(atividade => {
                    if (!atividade.caloriasPorMinuto) return;
                    const option = document.createElement('option');
                    option.value = atividade.nome;
                    option.dataset.caloriasPorMinuto = atividade.caloriasPorMinuto;
                    option.textContent = atividade.nome;
                    select.appendChild(option);
                });

                const savedCalorias = parseFloat(localStorage.getItem(`caloriasQueimadasAtividade${index}`)) || 0;
                const caloriasDiv = select.closest('.row').parentElement.querySelector('.alert');
                caloriasDiv.innerHTML = `<b>${savedCalorias.toFixed(2)} Kcal</b>`;
            });
        })
        .catch(error => console.error('Erro ao carregar atividades:', error));

    document.querySelectorAll('.btn-outline-primary').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const select = inputGroup.querySelector('.form-select');
            const input = inputGroup.querySelector('input[type="text"]');
            const caloriasDiv = inputGroup.parentElement.querySelector('.alert');

            calcularCaloriasQueimadas(select, input, caloriasDiv, index);
        });
    });

    document.querySelectorAll('#zerarIndice').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const caloriasDiv = inputGroup.parentElement.querySelector('.alert');
            zerarCaloriasQueimadas(caloriasDiv, index);
        });
    });

    await checkLogin();
});
