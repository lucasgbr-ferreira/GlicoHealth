document.addEventListener("DOMContentLoaded", () => {
    const limiteDiarioIdeal = 180;
    let totalIndiceGlicemico = parseFloat(localStorage.getItem('totalIndiceGlicemico')) || 0;

    function atualizarBarraProgresso() {
        const progresso = (totalIndiceGlicemico / limiteDiarioIdeal) * 100;
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${Math.min(progresso, 100)}%`;
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
    }

    fetch('alimentos.json')
        .then(response => response.json())
        .then(data => {
            const selects = document.querySelectorAll('.form-select');
            selects.forEach((select, index) => {
                data.forEach(alimento => {
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
        .catch(error => console.error('Erro ao carregar alimentos:', error));

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

    atualizarBarraProgresso();
});