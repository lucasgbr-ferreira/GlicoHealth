document.addEventListener("DOMContentLoaded", () => {
    const limiteDiarioIdeal = 180;
    let totalIndiceGlicemico = parseFloat(localStorage.getItem('totalIndiceGlicemico')) || 0;

    // Função para atualizar a barra de progresso
    function atualizarBarraProgresso() {
        const progresso = (totalIndiceGlicemico / limiteDiarioIdeal) * 100;
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${Math.min(progresso, 100)}%`;
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
    }

    // Carregar alimentos do arquivo JSON e preencher o select
    fetch('alimentos.json')
        .then(response => response.json())
        .then(data => {
            const selects = document.querySelectorAll('.form-select');
            selects.forEach(select => {
                data.forEach(alimento => {
                    const option = document.createElement('option');
                    option.value = alimento.nome;
                    option.dataset.indiceGlicemico = alimento.indiceGlicemico;
                    option.textContent = alimento.nome;
                    select.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Erro ao carregar alimentos:', error));

    // Função para calcular o índice glicêmico
    function calcularIndiceGlicemico(select, input, indiceDiv) {
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
        atualizarBarraProgresso();
    }

    // Associar eventos ao botão de calcular
    document.querySelectorAll('.btn-outline-primary').forEach(button => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const select = inputGroup.querySelector('.form-select');
            const input = inputGroup.querySelector('input[type="text"]');
            const indiceDiv = inputGroup.parentElement.querySelector('.alert');

            calcularIndiceGlicemico(select, input, indiceDiv);
        });
    });

    // Função para zerar o índice glicêmico
    function zerarIndiceGlicemico(indiceDiv) {
        const indiceAtual = parseFloat(indiceDiv.textContent) || 0;
        totalIndiceGlicemico -= indiceAtual;
        localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);
        indiceDiv.innerHTML = `<b>0 mg/dL</b>`;
        atualizarBarraProgresso();
    }

    // Associar eventos ao botão de zerar
    document.querySelectorAll('#zerarIndice').forEach(button => {
        button.addEventListener('click', () => {
            const inputGroup = button.closest('.row');
            const indiceDiv = inputGroup.parentElement.querySelector('.alert');
            zerarIndiceGlicemico(indiceDiv);
        });
    });

    // Atualizar barra de progresso ao carregar a página
    atualizarBarraProgresso();
});