// calculo_indice_glicemico.js

const LIMITE_GLICEMICO = 240;
let totalIndiceGlicemico = 0;
let alimentosSelecionados = [];

// Função para salvar os dados no localStorage
function salvarDadosNoLocalStorage() {
    localStorage.setItem('totalIndiceGlicemico', totalIndiceGlicemico);
    localStorage.setItem('alimentosSelecionados', JSON.stringify(alimentosSelecionados));
}

// Função para carregar os dados do localStorage
function carregarDadosDoLocalStorage() {
    let indiceSalvo = localStorage.getItem('totalIndiceGlicemico');
    if (indiceSalvo) {
        totalIndiceGlicemico = parseFloat(indiceSalvo);
    } else {
        totalIndiceGlicemico = 0;
    }

    let alimentosSalvos = localStorage.getItem('alimentosSelecionados');
    if (alimentosSalvos) {
        alimentosSelecionados = JSON.parse(alimentosSalvos);
    } else {
        alimentosSelecionados = [];
    }
}

// Função para carregar os alimentos do arquivo JSON
async function carregarAlimentos() {
    try {
        let resposta = await fetch('alimentos.json');
        if (resposta.ok) {
            let dados = await resposta.json();
            return dados;
        } else {
            alert('Erro ao carregar a lista de alimentos.');
            return [];
        }
    } catch (erro) {
        console.log('Erro:', erro);
        alert('Não foi possível carregar os alimentos.');
        return [];
    }
}

// Função para preencher os selects com os alimentos
async function preencherSelectAlimentos() {
    let alimentos = await carregarAlimentos();
    let selects = document.querySelectorAll('.form-select');

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
    if (progresso > 100) {
        progresso = 100;
    }

    let progressElement = progressBar.querySelector('.progress-bar');
    progressElement.style.width = progresso + '%';
    progressElement.textContent = progresso.toFixed(2) + '%';
}

// Função para atualizar o índice glicêmico total
function atualizarIndiceGlicemico(alimentoNome, quantidade) {
    carregarAlimentos().then(alimentos => {
        let alimento = alimentos.find(a => a.nome === alimentoNome);
        if (alimento) {
            let indice = calcularIndiceGlicemico(alimento, quantidade);
            totalIndiceGlicemico += indice;

            // Adicionar o alimento à lista de alimentos selecionados
            alimentosSelecionados.push({
                nome: alimentoNome,
                quantidade: quantidade
            });

            atualizarAlertas();
            atualizarBarraProgresso();
            salvarDadosNoLocalStorage();

            if (totalIndiceGlicemico > LIMITE_GLICEMICO) {
                alert('Você ultrapassou o limite diário de índice glicêmico!');
            }
        }
    });
}

// Função para atualizar os alertas com o índice glicêmico atual
function atualizarAlertas() {
    let indiceCafe = document.querySelector('#indice_cafe');
    let indiceAlmoco = document.querySelector('#indice_almoco');
    let indiceJantar = document.querySelector('#indice_jantar');

    if (indiceCafe) {
        indiceCafe.innerHTML = `<b>${totalIndiceGlicemico.toFixed(2)} mg/dL</b>`;
    }
    if (indiceAlmoco) {
        indiceAlmoco.innerHTML = `<b>${totalIndiceGlicemico.toFixed(2)} mg/dL</b>`;
    }
    if (indiceJantar) {
        indiceJantar.innerHTML = `<b>${totalIndiceGlicemico.toFixed(2)} mg/dL</b>`;
    }
}

// Função para zerar o índice glicêmico
function zerarIndiceGlicemico() {
    totalIndiceGlicemico = 0;
    alimentosSelecionados = [];

    salvarDadosNoLocalStorage(); // Atualiza o localStorage com os valores zerados
    atualizarBarraProgresso();   // Atualiza a barra de progresso para 0%
    atualizarAlertas();          // Atualiza os alertas para 0 mg/dL
}

// Função para restaurar os dados salvos e atualizar a interface
function restaurarDadosSalvos() {
    carregarDadosDoLocalStorage();

    // Zerar o valor para evitar duplicação de cálculo
    totalIndiceGlicemico = 0;

    // Recalcular o índice glicêmico com base nos alimentos salvos
    carregarAlimentos().then(alimentos => {
        for (let item of alimentosSelecionados) {
            let alimento = alimentos.find(a => a.nome === item.nome);
            if (alimento) {
                let indice = calcularIndiceGlicemico(alimento, item.quantidade);
                totalIndiceGlicemico += indice;
            }
        }

        atualizarBarraProgresso();
        atualizarAlertas();
    });
}

// Adicionar eventos aos botões de calcular
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

// Adicionar evento ao botão de zerar o índice glicêmico
document.getElementById('zerarIndice').addEventListener('click', zerarIndiceGlicemico);

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    preencherSelectAlimentos().then(() => {
        restaurarDadosSalvos();
    });
});
