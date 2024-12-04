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
    const limiteDiarioIdeal = 180; // Limite diário padrão para calorias queimadas
    let totalCaloriasQueimadas = parseFloat(localStorage.getItem('totalCaloriasQueimadas')) || 0;

    // URL base do JSON Server
    const apiUrl = 'http://localhost:3000';

    function atualizarBarraProgresso() {
        const progresso = (totalCaloriasQueimadas / limiteDiarioIdeal) * 100;
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${Math.min(progresso, 100)}%`;
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
    }

    // Carregar atividades físicas do JSON Server
    fetch(`${apiUrl}/atividadesFisicas`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar atividades físicas.');
            }
            return response.json();
        })
        .then(atividadesFisicas => {
            const selects = document.querySelectorAll('.form-select');

            selects.forEach((select, index) => {
                atividadesFisicas.forEach(atividade => {
                    if (!atividade.caloriasPorMinuto) return; // Ignora atividades sem calorias por minuto
                    const option = document.createElement('option');
                    option.value = atividade.nome;
                    option.dataset.caloriasPorMinuto = atividade.caloriasPorMinuto;
                    option.textContent = atividade.nome;
                    select.appendChild(option);
                });

                // Recupera calorias salvas para esta atividade
                const savedCalorias = parseFloat(localStorage.getItem(`caloriasQueimadasAtividade${index}`)) || 0;
                const caloriasDiv = select.closest('.row').parentElement.querySelector('.alert');
                caloriasDiv.innerHTML = `<b>${savedCalorias.toFixed(2)} Kcal</b>`;
            });
        })
        .catch(error => console.error('Erro ao carregar dados das atividades físicas:', error));

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

    document.querySelectorAll('.btn-outline-primary').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const select = inputGroup.querySelector('.form-select');
            const input = inputGroup.querySelector('input[type="text"]');
            const caloriasDiv = inputGroup.parentElement.querySelector('.alert');

            calcularCaloriasQueimadas(select, input, caloriasDiv, index);
        });
    });

    function zerarCaloriasQueimadas(caloriasDiv, index) {
        const caloriasAtuais = parseFloat(caloriasDiv.textContent) || 0;
        totalCaloriasQueimadas -= caloriasAtuais;

        localStorage.setItem('totalCaloriasQueimadas', totalCaloriasQueimadas);
        localStorage.setItem(`caloriasQueimadasAtividade${index}`, 0);
        caloriasDiv.innerHTML = `<b>0 Kcal</b>`;

        atualizarBarraProgresso();
    }

    document.querySelectorAll('#zerarIndice').forEach((button, index) => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const caloriasDiv = inputGroup.parentElement.querySelector('.alert');
            zerarCaloriasQueimadas(caloriasDiv, index);
        });
    });

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
