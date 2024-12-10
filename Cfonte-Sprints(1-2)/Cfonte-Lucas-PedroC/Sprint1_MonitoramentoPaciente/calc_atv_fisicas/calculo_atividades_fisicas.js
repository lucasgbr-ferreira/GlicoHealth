document.addEventListener("DOMContentLoaded", () => {
    const limiteDiarioIdeal = 180;
    let totalCaloriasQueimadas = parseFloat(localStorage.getItem('totalCaloriasQueimadas')) || 0;

    function atualizarBarraProgresso() {
        const progresso = (totalCaloriasQueimadas / limiteDiarioIdeal) * 100;
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${Math.min(progresso, 100)}%`;
        progressBar.textContent = `${Math.min(progresso, 100).toFixed(2)}%`;
    }

    fetch('atividades_fisicas.json')
        .then(response => response.json())
        .then(data => {
            const selects = document.querySelectorAll('.form-select');
            selects.forEach((select, index) => {
                data.forEach(atividade => {
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
