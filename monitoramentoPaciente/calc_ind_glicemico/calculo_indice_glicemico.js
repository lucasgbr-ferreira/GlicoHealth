// Função que exibe o dia da semana no HTML
function exibirDiaDaSemana() {
    const diasDaSemana = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    
    // Obtém o dia da semana atual
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // getDay() retorna o número do dia da semana (0-6)

    // Insere o dia da semana no elemento HTML com o id 'diaSemana'
    document.getElementById('diaSemana').textContent = `Hoje, ${diasDaSemana[diaSemana]}`;
}

// Chama a função para exibir o dia da semana quando a página for carregada
window.onload = exibirDiaDaSemana;


document.addEventListener("DOMContentLoaded", () => {
    let limiteDiarioIdeal = 180; // Limite padrão, será substituído pelo limite do paciente logado
    let totalIndiceGlicemico = parseFloat(localStorage.getItem('totalIndiceGlicemico')) || 0;

    // URL base do JSON Server
    const apiUrl = 'http://localhost:3000';

    function atualizarBarraProgresso() {
        const progresso = (totalIndiceGlicemico / limiteDiarioIdeal) * 100;
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${Math.min(progresso, 100)}%`;
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
    }

    // Função para carregar limite de índice glicêmico do paciente logado
    function carregarLimitePaciente(pacienteId) {
        return fetch(`${apiUrl}/pacientes/${pacienteId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar dados do paciente.');
                }
                return response.json();
            })
            .then(paciente => {
                // Atualizar limite com o valor definido pelo médico
                limiteDiarioIdeal = parseFloat(paciente.limites.indiceGlicemico) || 180;
                atualizarBarraProgresso(); // Recalcular barra de progresso com o limite correto
            })
            .catch(error => console.error('Erro ao carregar limite do paciente:', error));
    }

    // Carregar alimentos do JSON Server
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
                    if (!alimento.indiceGlicemico) return; // Ignora alimentos sem índice glicêmico
                    const option = document.createElement('option');
                    option.value = alimento.nome;
                    option.dataset.indiceGlicemico = alimento.indiceGlicemico;
                    option.textContent = alimento.nome;
                    select.appendChild(option);
                });

                // Recupera índice salvo para esta refeição
                const savedIndice = parseFloat(localStorage.getItem(`indiceGlicemicoRefeicao${index}`)) || 0;
                const indiceDiv = select.closest('.row').parentElement.querySelector('.alert');
                indiceDiv.innerHTML = `<b>${savedIndice.toFixed(2)} mg/dL</b>`;
            });
        })
        .catch(error => console.error('Erro ao carregar dados dos alimentos:', error));

    function calcularIndiceGlicemico(select, input, indiceDiv, index) {
        const alimento = select.options[select.selectedIndex];
        const quantidade = parseFloat(input.value);
        const indiceGlicemico = parseFloat(alimento.dataset.indiceGlicemico);

        if (!quantidade || !indiceGlicemico) {
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

    document.querySelectorAll('.btn-outline-primary').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const select = inputGroup.querySelector('.form-select');
            const input = inputGroup.querySelector('input[type="text"]');
            const indiceDiv = inputGroup.parentElement.querySelector('.alert');

            calcularIndiceGlicemico(select, input, indiceDiv, index);
        });
    });

    function zerarIndiceGlicemico(indiceDiv, index) {
        const indiceAtual = parseFloat(indiceDiv.textContent) || 0;
        totalIndiceGlicemico -= indiceAtual;

        localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);
        localStorage.setItem(`indiceGlicemicoRefeicao${index}`, 0);
        indiceDiv.innerHTML = `<b>0 mg/dL</b>`;

        atualizarBarraProgresso();
    }

    document.querySelectorAll('#zerarIndice').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const indiceDiv = inputGroup.parentElement.querySelector('.alert');
            zerarIndiceGlicemico(indiceDiv, index);
        });
    });

    // Substitua "id_do_paciente" pelo ID do paciente logado
    const pacienteId = '93b4'; // Exemplo: o ID do paciente logado
    carregarLimitePaciente(pacienteId);

    atualizarBarraProgresso();
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

