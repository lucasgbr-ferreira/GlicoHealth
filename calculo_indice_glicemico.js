// Limite de índice glicêmico diário
const LIMITE_GLICEMICO = 240;
let totalIndiceGlicemico = 0;

// Função para carregar alimentos de um arquivo JSON
async function carregarAlimentos() {
    try {
        const resposta = await fetch('alimentos.json');
        if (!resposta.ok) {
            alert('Erro ao carregar a lista de alimentos.');
            return [];
        }
        return await resposta.json();
    } catch (erro) {
        console.log('Erro:', erro);
        alert('Não foi possível carregar os alimentos.');
        return [];
    }
}

// Função para preencher os selects com alimentos
async function preencherSelectAlimentos() {
    const alimentos = await carregarAlimentos();
    const selects = document.querySelectorAll('.form-select');

    for (let select of selects) {
        select.innerHTML = '<option>Escolher...</option>';
        for (let alimento of alimentos) {
            let option = document.createElement('option');
            option.value = alimento.nome;
            option.textContent = alimento.nome;
            select.appendChild(option);
        }
    }
}

// Função para calcular o índice glicêmico
function calcularIndiceGlicemico(alimento, quantidade) {
    return alimento.indiceGlicemico * (quantidade / 100);
}

// Função para atualizar a barra de progresso
function atualizarBarraProgresso() {
    let progressBar = document.getElementById('progressBar');
    if (!progressBar) {
        console.log('Barra de progresso não encontrada');
        return;
    }
    let progresso = (totalIndiceGlicemico / LIMITE_GLICEMICO) * 100;
    if (progresso > 100) progresso = 100;
    
    progressBar.querySelector('.progress-bar').style.width = progresso + '%';
    progressBar.querySelector('.progress-bar').textContent = progresso.toFixed(2) + '%';
}

// Função para atualizar o índice glicêmico total
function atualizarIndiceGlicemico(alimentoNome, quantidade) {
    carregarAlimentos().then(alimentos => {
        let alimento = alimentos.find(a => a.nome === alimentoNome);
        if (alimento) {
            let indice = calcularIndiceGlicemico(alimento, quantidade);
            totalIndiceGlicemico += indice;

            let alertElement1 = document.querySelector('#indice_cafe');
            let alertElement2 = document.querySelector('#indice_almoco');
            let alertElement3 = document.querySelector('#indice_jantar');

            if (alertElement1) {
                alertElement1.innerHTML = `<b>${totalIndiceGlicemico.toFixed(2)} mg/dL</b>`;
            }
            if (alertElement2) {
                alertElement2.innerHTML = `<b>${totalIndiceGlicemico.toFixed(2)} mg/dL</b>`;
            }
            if (alertElement3) {
                alertElement3.innerHTML = `<b>${totalIndiceGlicemico.toFixed(2)} mg/dL</b>`;
            }

            atualizarBarraProgresso();

            if (totalIndiceGlicemico > LIMITE_GLICEMICO) {
                alert('Você ultrapassou o limite diário de índice glicêmico!');
            }
        }
    });
}

// Adicionar evento aos botões de calcular
document.querySelectorAll('.btn-outline-primary').forEach(botao => {
    botao.addEventListener('click', () => {
        let inputGroup = botao.closest('.row');
        let alimentoSelect = inputGroup.querySelector('.form-select');
        let quantidadeInput = inputGroup.querySelector('input[type="text"]');

        let alimentoNome = alimentoSelect.value;
        let quantidade = parseFloat(quantidadeInput.value);

        if (alimentoNome !== "Escolher..." && !isNaN(quantidade) && quantidade > 0) {
            atualizarIndiceGlicemico(alimentoNome, quantidade);
        } else {
            alert('Escolha um alimento e insira uma quantidade válida.');
        }
    });
});

// Preencher os selects ao carregar a página
document.addEventListener('DOMContentLoaded', preencherSelectAlimentos);
