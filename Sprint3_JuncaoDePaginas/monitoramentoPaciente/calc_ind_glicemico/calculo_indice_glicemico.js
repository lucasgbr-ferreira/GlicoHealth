// Definindo o URL da API globalmente
const apiUrl = 'http://localhost:3000';

// Função que exibe o dia da semana no HTML
function exibirDiaDaSemana() {
    const diasDaSemana = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];

    const hoje = new Date();
    const diaSemana = hoje.getDay(); // getDay() retorna o número do dia da semana (0-6)

    document.getElementById('diaSemana').textContent = `Hoje, ${diasDaSemana[diaSemana]}`;
}

// Variáveis globais
let limiteDiarioIdeal = 180; // Limite padrão
let totalIndiceGlicemico = parseFloat(localStorage.getItem('totalIndiceGlicemico')) || 0; // Inicializa a variável totalIndiceGlicemico

// Função para carregar o ID do paciente por username
async function obterPacienteIdPorUsername(username) {
    try {
        const response = await fetch(`${apiUrl}/pacientes?username=${username}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar ID do paciente.');
        }
        const pacientes = await response.json();
        if (pacientes && pacientes.length > 0) {
            return pacientes[0].id;
        } else {
            throw new Error('Paciente não encontrado.');
        }
    } catch (error) {
        showToast('Erro ao obter informações do paciente. Verifique sua conexão ou tente novamente.');
        console.error('Erro ao obter ID do paciente:', error.message);
    }
    return null;
}

// Função para carregar o limite glicêmico do paciente (considerando "carboidratos" como "índice glicêmico")
async function carregarLimitePaciente(pacienteId) {
    try {
        const response = await fetch(`${apiUrl}/pacientes/${pacienteId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do paciente.');
        }
        const paciente = await response.json();
        if (paciente && paciente.prontuarios && paciente.prontuarios.length > 0) {
            const prontuario = paciente.prontuarios[0]; // Considerando o primeiro prontuário do paciente
            limiteDiarioIdeal = parseFloat(prontuario.limites.carboidratos) || 180; // Usando carboidratos como limite
            atualizarBarraProgresso();
            return true; // Indica que o paciente possui prontuário e limite glicêmico
        } else {
            throw new Error('Dados do paciente estão ausentes ou incompletos.');
        }
    } catch (error) {
        showToast('Erro ao carregar informações do paciente. Verifique sua conexão ou tente novamente.');
        console.error('Erro ao carregar limite do paciente:', error.message);
        return false; // Indica que o paciente não tem prontuário ou dados suficientes
    }
}

// Função para atualizar a barra de progresso do índice glicêmico
function atualizarBarraProgresso() {
    // Verifica se o totalIndiceGlicemico e limiteDiarioIdeal são válidos
    const progresso = (totalIndiceGlicemico && limiteDiarioIdeal) ? (totalIndiceGlicemico / limiteDiarioIdeal) * 100 : 0;

    // Garante que a porcentagem de progresso não ultrapasse 100%
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(progresso, 100)}%`;  // Limita o valor a 100%
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`; // Exibe o valor na barra
    }
}


// Função para exibir uma mensagem de toast
function showToast(message) {
    const toastMessage = document.getElementById("toastMessage");
    toastMessage.textContent = message;

    const toastElement = new bootstrap.Toast(document.getElementById("loginToast"));
    toastElement.show();
}

// Função para verificar se o usuário está logado
function checkLogin() {
    const loggedIn = localStorage.getItem("loggedIn");

    if (!loggedIn) {
        window.location.href = "../../InterfaceUsuário/Index.html";
    } else {
        const username = localStorage.getItem("username");
        if (username) {
            showToast(`Exibindo cálculo glicêmico para: ${username}`);
            displayWelcomeMessage(username);
        }
    }
}

// Função para exibir a mensagem de boas-vindas
function displayWelcomeMessage(username) {
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bem-vindo, ${username}!`;
    }
}

// Função que calcula o índice glicêmico de uma refeição
function calcularIndiceGlicemico(select, input, indiceDiv, index) {
    const alimento = select.options[select.selectedIndex];
    const quantidade = parseFloat(input.value);
    const indiceGlicemico = parseFloat(alimento.dataset.indiceGlicemico);

    // Verificar se a quantidade e o índice glicêmico estão definidos
    if (!quantidade || isNaN(quantidade) || !indiceGlicemico || isNaN(indiceGlicemico)) {
        alert("Selecione um alimento e insira uma quantidade válida.");
        return;
    }

    // Calcular o índice glicêmico total para a refeição
    const resultado = (indiceGlicemico * quantidade) / 100;
    const indiceGlicemicoAtual = parseFloat(indiceDiv.textContent) || 0;
    const novoIndiceGlicemico = indiceGlicemicoAtual + resultado;

    // Atualizar o índice glicêmico na tela
    indiceDiv.innerHTML = `<b>${novoIndiceGlicemico.toFixed(2)} mg/dL</b>`;
    totalIndiceGlicemico += resultado;

    // Armazenar o novo valor no localStorage
    localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);
    localStorage.setItem(`indiceGlicemicoRefeicao${index}`, novoIndiceGlicemico);

    // Atualizar a barra de progresso
    atualizarBarraProgresso();
}

// Função para zerar o índice glicêmico de uma refeição
function zerarIndiceGlicemico(indiceDiv, index) {
    const indiceAtual = parseFloat(indiceDiv.textContent) || 0;
    totalIndiceGlicemico -= indiceAtual;

    localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);
    localStorage.setItem(`indiceGlicemicoRefeicao${index}`, 0);

    // Zera o índice glicêmico na interface
    indiceDiv.innerHTML = `<b>0 mg/dL</b>`;

    // Limpa a barra de progresso
    totalIndiceGlicemico = 0; // Resetando o valor total
    atualizarBarraProgresso(); // Atualizando a barra para refletir o novo valor

    // Opcionalmente, você pode exibir uma mensagem de confirmação
    showToast("Índice glicêmico zerado.");
}


document.addEventListener("DOMContentLoaded", async () => {
    // Exibir o dia da semana
    exibirDiaDaSemana();

    // Carregar dados dos alimentos
    fetch(`${apiUrl}/alimentos`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar alimentos.');
            }
            return response.json();
        })
        .then(alimentos => {
            const selects = document.querySelectorAll('.form-select');

            selects.forEach((select, index) => {
                alimentos.forEach(alimento => {
                    if (!alimento.indiceGlicemico) return;
                    const option = document.createElement('option');
                    option.value = alimento.nome;
                    option.dataset.indiceGlicemico = alimento.indiceGlicemico;
                    option.textContent = alimento.nome;
                    select.appendChild(option);
                });

                // Carregar os valores salvos do índice glicêmico
                const savedIndice = parseFloat(localStorage.getItem(`indiceGlicemicoRefeicao${index}`)) || 0;
                const indiceDiv = select.closest('.row').parentElement.querySelector('.alert');
                indiceDiv.innerHTML = `<b>${savedIndice.toFixed(2)} mg/dL</b>`;
            });
        })
        .catch(error => console.error('Erro ao carregar dados dos alimentos:', error));

    // Configurar os botões de cálculo e de reset
    document.querySelectorAll('.btn-outline-primary').forEach((button, index) => {
        button.addEventListener('click', () => {
            if (!limiteDiarioIdeal) {
                showToast("O paciente não possui prontuário com limite glicêmico. Cálculo não permitido.");
                button.disabled = true;  // Desabilita o botão de cálculo
                return; // Impede o cálculo se o paciente não tiver limite glicêmico
            }

            const inputGroup = button.closest('.row');
            const select = inputGroup.querySelector('.form-select');
            const input = inputGroup.querySelector('input[type="text"]');
            const indiceDiv = inputGroup.parentElement.querySelector('.alert');

            calcularIndiceGlicemico(select, input, indiceDiv, index);
        });
    });

    document.querySelectorAll('#zerarIndice').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const indiceDiv = inputGroup.parentElement.querySelector('.alert');
            zerarIndiceGlicemico(indiceDiv, index);
        });
    });

    checkLogin(); // Verificar login

    const username = localStorage.getItem("username");
    if (username) {
        try {
            const pacienteId = await obterPacienteIdPorUsername(username);
            if (pacienteId) {
                const prontuarioCarregado = await carregarLimitePaciente(pacienteId);
                if (prontuarioCarregado) {
                    showToast(`Limite glicêmico do paciente: ${limiteDiarioIdeal} mg/dL`);
                } else {
                    showToast("Paciente sem prontuário com limite glicêmico. O cálculo foi desabilitado.");
                }
            }
        } catch (error) {
            console.error('Erro ao carregar paciente:', error.message);
        }
    }
});
