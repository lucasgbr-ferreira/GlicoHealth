document.addEventListener("DOMContentLoaded", () => {
    const limiteDiarioIdeal = 500; // Calorias ideais por dia
    let totalCaloriasQueimadas = parseFloat(localStorage.getItem('totalCaloriasQueimadas')) || 0;

    // Função para atualizar a barra de progresso
    function atualizarBarraProgresso() {
        const progresso = (totalCaloriasQueimadas / limiteDiarioIdeal) * 100;
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${Math.min(progresso, 100)}%`;
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
    }

    // Carregar atividades do arquivo JSON e preencher o select
    fetch('atividades_fisicas.json')
        .then(response => response.json())
        .then(data => {
            const selects = document.querySelectorAll('.form-select');
            selects.forEach(select => {
                data.forEach(atividade => {
                    const option = document.createElement('option');
                    option.value = atividade.nome;
                    option.dataset.caloriasPorMinuto = atividade.caloriasPorMinuto;
                    option.textContent = atividade.nome;
                    select.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Erro ao carregar atividades:', error));

    // Função para calcular calorias queimadas
    function calcularCaloriasQueimadas(select, input, caloriasDiv) {
        const atividade = select.options[select.selectedIndex];
        const duracao = parseFloat(input.value);
        const caloriasPorMinuto = parseFloat(atividade.dataset.caloriasPorMinuto);

        if (!duracao || !caloriasPorMinuto) {
            alert("Selecione uma atividade e insira uma duração válida.");
            return;
        }

        const caloriasQueimadas = caloriasPorMinuto * duracao;
        const caloriasAtuais = parseFloat(caloriasDiv.textContent) || 0;
        const novasCaloriasQueimadas = caloriasAtuais + caloriasQueimadas;
        caloriasDiv.innerHTML = `<b>${novasCaloriasQueimadas.toFixed(2)} Kcal</b>`;
        
        totalCaloriasQueimadas += caloriasQueimadas;
        localStorage.setItem('totalCaloriasQueimadas', totalCaloriasQueimadas);
        atualizarBarraProgresso();
    }

    // Associar eventos ao botão de calcular
    document.querySelectorAll('.btn-outline-primary').forEach(button => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const select = inputGroup.querySelector('.form-select');
            const input = inputGroup.querySelector('input[type="text"]');
            const caloriasDiv = inputGroup.parentElement.querySelector('.alert');

            calcularCaloriasQueimadas(select, input, caloriasDiv);
        });
    });

    // Função para zerar calorias queimadas
    function zerarCaloriasQueimadas(caloriasDiv) {
        const caloriasAtuais = parseFloat(caloriasDiv.textContent) || 0;
        totalCaloriasQueimadas -= caloriasAtuais;
        localStorage.setItem('totalCaloriasQueimadas', totalCaloriasQueimadas);
        caloriasDiv.innerHTML = `<b>0 Kcal</b>`;
        atualizarBarraProgresso();
    }

    // Associar eventos ao botão de zerar
    document.querySelectorAll('#zerarIndice').forEach(button => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const caloriasDiv = inputGroup.parentElement.querySelector('.alert');
            zerarCaloriasQueimadas(caloriasDiv);
        });
    });

    // Atualizar barra de progresso ao carregar a página
    atualizarBarraProgresso();
});
