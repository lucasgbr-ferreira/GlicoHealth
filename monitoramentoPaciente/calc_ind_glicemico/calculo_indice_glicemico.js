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
let idPaciente = null; // Inicializa o idPaciente globalmente

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

// Função para carregar o limite glicêmico do paciente e verificar se o cálculo pode ser realizado
async function carregarLimitePaciente(pacienteId) {
    try {
        const response = await fetch(`${apiUrl}/pacientes/${pacienteId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do paciente.');
        }
        const paciente = await response.json();
        if (paciente && paciente.prontuarios && paciente.prontuarios.length > 0) {
            const prontuario = paciente.prontuarios[paciente.prontuarios.length - 1];
            const limite = prontuario.limites.carboidratos;

            if (limite && !isNaN(limite)) {
                limiteDiarioIdeal = parseFloat(limite); // Atualiza o limite glicêmico
                atualizarBarraProgresso();
                return true; // Indica que o paciente tem limite válido
            } else {
                desabilitarCalculo();
                showToast('Limite glicêmico não encontrado ou inválido.');
                return false;
            }
        } else {
            desabilitarCalculo();
            showToast('Dados do paciente estão incompletos.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao carregar limite do paciente:', error.message);
        desabilitarCalculo();
        showToast('Erro ao carregar informações do paciente.');
        return false;
    }
}

// Função para desabilitar os botões de cálculo
function desabilitarCalculo() {
    const buttons = document.querySelectorAll('.btn-outline-primary');
    buttons.forEach(button => button.disabled = true);
}

// Função para atualizar a barra de progresso do índice glicêmico
function atualizarBarraProgresso() {
    const progresso = (totalIndiceGlicemico && limiteDiarioIdeal) ? (totalIndiceGlicemico / limiteDiarioIdeal) * 100 : 0;

    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const progressoFormatado = Math.min(progresso, 100).toFixed(2);
        progressBar.style.width = `${progressoFormatado}%`;
        progressBar.textContent = `${progressoFormatado}%`;
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
        window.location.href = "../../InterfaceUsuario/Index.html";
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

    if (!quantidade || isNaN(quantidade) || !indiceGlicemico || isNaN(indiceGlicemico)) {
        alert("Selecione um alimento e insira uma quantidade válida.");
        return;
    }

    const resultado = (indiceGlicemico * quantidade) / 100;
    const indiceGlicemicoAtual = parseFloat(indiceDiv.textContent) || 0;
    const novoIndiceGlicemico = indiceGlicemicoAtual + resultado;

    indiceDiv.innerHTML = `<b>${novoIndiceGlicemico.toFixed(2)} mg/dL</b>`;
    totalIndiceGlicemico += resultado;

    localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);
    localStorage.setItem(`indiceGlicemicoRefeicao${index}`, novoIndiceGlicemico);

    atualizarBarraProgresso();
}

// Função para zerar o índice glicêmico de uma refeição
function zerarIndiceGlicemico(indiceDiv, index) {
    const indiceAtual = parseFloat(indiceDiv.textContent.replace(' mg/dL', '')) || 0;
    totalIndiceGlicemico = Math.max(totalIndiceGlicemico - indiceAtual, 0);

    localStorage.setItem(`indiceGlicemicoRefeicao${index}`, 0);
    indiceDiv.innerHTML = `<b>0.00 mg/dL</b>`;
    localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);

    atualizarBarraProgresso();
    showToast(`Índice glicêmico da refeição ${index + 1} zerado.`);
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    exibirDiaDaSemana();

    fetch(`${apiUrl}/alimentos`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar alimentos.');
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

                const savedIndice = parseFloat(localStorage.getItem(`indiceGlicemicoRefeicao${index}`)) || 0;
                const indiceDiv = select.closest('.row').parentElement.querySelector('.alert');
                indiceDiv.innerHTML = `<b>${savedIndice.toFixed(2)} mg/dL</b>`;
            });
        })
        .catch(error => console.error('Erro ao carregar dados dos alimentos:', error));

    document.querySelectorAll('.btn-outline-primary').forEach((button, index) => {
        button.addEventListener('click', () => {
            if (!limiteDiarioIdeal) {
                showToast("O paciente não possui prontuário com limite glicêmico. Cálculo não permitido.");
                button.disabled = true;
                return;
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

    checkLogin();

    const username = localStorage.getItem("username");
    if (username) {
        try {
            idPaciente = await obterPacienteIdPorUsername(username); // Atribuição global
            if (idPaciente) {
                const prontuarioCarregado = await carregarLimitePaciente(idPaciente);
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

/**
 * Adiciona um alimento ao prontuário do paciente.
 * @param {string} pacienteId - O ID do paciente.
 * @param {Object} alimento - O objeto com as informações do alimento.
 */

function atualizarSelectRefeicoes(alimento) {
    const selects = document.querySelectorAll('.form-select');
    selects.forEach(select => {
        const optionExistente = Array.from(select.options).some(option => option.value === alimento.nome);
        if (!optionExistente) {
            const option = document.createElement('option');
            option.value = alimento.nome;
            option.dataset.indiceGlicemico = alimento.indiceGlicemico;
            option.textContent = alimento.nome;
            select.appendChild(option);
        }
    });
}

async function adicionarAlimentoPaciente(pacienteId, alimento) {
    try {
        const response = await fetch(`${apiUrl}/pacientes/${pacienteId}`);
        if (!response.ok) throw new Error('Erro ao obter os dados do paciente.');
        const paciente = await response.json();

        if (paciente && paciente.prontuarios && paciente.prontuarios.length > 0) {
            const prontuario = paciente.prontuarios[0];

            // Adiciona o alimento à lista de alimentos
            prontuario.alimentos = prontuario.alimentos || [];
            prontuario.alimentos.push(alimento);

            // Envia atualização para a API
            const updateResponse = await fetch(`${apiUrl}/pacientes/${pacienteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prontuarios: paciente.prontuarios })
            });

            if (!updateResponse.ok) throw new Error('Erro ao atualizar o prontuário do paciente.');
            showToast('Alimento adicionado com sucesso!');

            // Atualiza a UI
            atualizarListaAlimentosUI(alimento);
            atualizarSelectRefeicoes(alimento); // Atualiza o select com o novo alimento
        } else {
            throw new Error('Prontuário do paciente não encontrado.');
        }
    } catch (error) {
        showToast('Erro ao adicionar alimento.');
        console.error(error.message);
    }
}

/**
 * Remove um alimento do prontuário do paciente.
 * @param {string} pacienteId - O ID do paciente.
 * @param {string} nomeAlimento - Nome do alimento a ser removido.
 */
async function removerAlimentoPaciente(pacienteId, nomeAlimento) {
    try {
        const response = await fetch(`${apiUrl}/pacientes/${pacienteId}`);
        if (!response.ok) throw new Error('Erro ao obter os dados do paciente.');
        const paciente = await response.json();

        if (paciente && paciente.prontuarios && paciente.prontuarios.length > 0) {
            const prontuario = paciente.prontuarios[0];

            // Remove o alimento da lista
            prontuario.alimentos = prontuario.alimentos || [];
            const alimentosFiltrados = prontuario.alimentos.filter(alimento => alimento.nome !== nomeAlimento);

            // Envia atualização para a API apenas se houve mudanças
            if (alimentosFiltrados.length !== prontuario.alimentos.length) {
                prontuario.alimentos = alimentosFiltrados;

                const updateResponse = await fetch(`${apiUrl}/pacientes/${pacienteId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prontuarios: paciente.prontuarios })
                });

                if (!updateResponse.ok) throw new Error('Erro ao atualizar o prontuário do paciente.');
                showToast('Alimento removido com sucesso!');

                // Atualiza a UI
                removerAlimentoDaUI(nomeAlimento);
                removerAlimentoDosSelects(nomeAlimento); // Remove o alimento dos selects
            } else {
                showToast('Alimento já removido.');
            }
        } else {
            throw new Error('Prontuário do paciente não encontrado.');
        }
    } catch (error) {
        showToast('Erro ao remover alimento.');
        console.error(error.message);
    }
}

/**
 * Remove o alimento dos selects das refeições.
 * @param {string} nomeAlimento - Nome do alimento a ser removido.
 */
function removerAlimentoDosSelects(nomeAlimento) {
    const selects = document.querySelectorAll('.form-select');
    selects.forEach(select => {
        const optionToRemove = Array.from(select.options).find(option => option.value === nomeAlimento);
        if (optionToRemove) {
            select.removeChild(optionToRemove);
        }
    });
}

// Evento para o botão de remover alimentos
document.getElementById('listaAlimentos').addEventListener('click', async (event) => {
    if (event.target.classList.contains('remover-alimento')) {
        const nomeAlimento = event.target.dataset.nome;
        const username = localStorage.getItem('username');
        if (username) {
            const pacienteId = await obterPacienteIdPorUsername(username);
            if (pacienteId) {
                await removerAlimentoPaciente(pacienteId, nomeAlimento);
            }
        }
    }
});

/**
 * Atualiza a lista de alimentos na interface do modal.
 * @param {Object} alimento - O objeto com as informações do alimento.
 */
function atualizarListaAlimentosUI(alimento) {
    const listaAlimentos = document.getElementById('listaAlimentos');
    if (listaAlimentos) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.dataset.nome = alimento.nome;
        listItem.innerHTML = `
            ${alimento.nome}
            <button class="btn btn-danger btn-sm remover-alimento" data-nome="${alimento.nome}">
                <i class="bi bi-trash"></i>
            </button>
        `;
        listaAlimentos.appendChild(listItem);
    }
}

/**
 * Remove um alimento da interface do modal.
 * @param {string} nomeAlimento - O nome do alimento a ser removido.
 */
function removerAlimentoDaUI(nomeAlimento) {
    const listaAlimentos = document.getElementById('listaAlimentos');
    const item = listaAlimentos.querySelector(`[data-nome="${nomeAlimento}"]`);
    if (item) {
        item.remove();
    }
}

/**
 * Carrega a lista de alimentos do paciente no modal.
 * @param {string} pacienteId - O ID do paciente.
 */
async function carregarAlimentosPaciente(pacienteId) {
    try {
        const response = await fetch(`${apiUrl}/pacientes/${pacienteId}`);
        if (!response.ok) throw new Error('Erro ao obter os dados do paciente.');
        const paciente = await response.json();

        if (paciente && paciente.prontuarios && paciente.prontuarios.length > 0) {
            const prontuario = paciente.prontuarios[0];
            const alimentos = prontuario.alimentos || [];

            // Atualiza a lista de alimentos na UI
            const listaAlimentos = document.getElementById('listaAlimentos');
            listaAlimentos.innerHTML = ''; // Limpa a lista
            alimentos.forEach(alimento => {
                atualizarListaAlimentosUI(alimento);
                atualizarSelectRefeicoes(alimento); // Atualiza o select com os alimentos do paciente
            });
        } else {
            throw new Error('Prontuário do paciente não encontrado.');
        }
    } catch (error) {
        showToast('Erro ao carregar alimentos do paciente.');
        console.error(error.message);
    }
}

// Manipulador de evento para salvar novo alimento
document.getElementById('salvarAlimento').addEventListener('click', async () => {
    const nomeAlimento = document.getElementById('nomeAlimento').value.trim();
    const indiceGlicemico = parseFloat(document.getElementById('indiceGlicemico').value);

    if (!nomeAlimento || isNaN(indiceGlicemico)) {
        showToast('Preencha os campos corretamente antes de salvar.');
        return;
    }

    const username = localStorage.getItem('username');
    if (username) {
        const pacienteId = await obterPacienteIdPorUsername(username);
        if (pacienteId) {
            const novoAlimento = { nome: nomeAlimento, indiceGlicemico };
            await adicionarAlimentoPaciente(pacienteId, novoAlimento);

            // Limpa os campos do modal
            document.getElementById('formAdicionarAlimento').reset();
        }
    }
});

// Manipulador de eventos para remover alimento
document.getElementById('listaAlimentos').addEventListener('click', async (event) => {
    if (event.target.classList.contains('remover-alimento')) {
        const nomeAlimento = event.target.dataset.nome;
        const username = localStorage.getItem('username');
        if (username) {
            const pacienteId = await obterPacienteIdPorUsername(username);
            if (pacienteId) {
                await removerAlimentoPaciente(pacienteId, nomeAlimento);
            }
        }
    }
});

// Carregar lista de alimentos ao abrir o modal
document.getElementById('alimentosCliente').addEventListener('show.bs.modal', async () => {
    const username = localStorage.getItem('username');
    if (username) {
        const pacienteId = await obterPacienteIdPorUsername(username);
        if (pacienteId) {
            await carregarAlimentosPaciente(pacienteId);
        }
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem('username');
    if (username) {
        const pacienteId = await obterPacienteIdPorUsername(username);
        if (pacienteId) {
            await carregarAlimentosPaciente(pacienteId);
        }
    }
});
