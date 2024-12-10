// script/agendaPaciente.js

// URLs do JSON Server
const API_URL = 'http://localhost:3000';
const PACIENTES_URL = `${API_URL}/pacientes`;
const MEDICOS_URL = `${API_URL}/medicos`;

function exibirDataAtual() {
    const data = new Date();

    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();

    const dataFormatada = `${dia} de ${mes} de ${ano}`;

    // Exibe a data no elemento com ID 'dataAtual'
    document.getElementById('dataAtual').textContent = dataFormatada;
}

exibirDataAtual();

// Função para capturar o paciente logado pelo localStorage
function getLoggedUser() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Nenhum usuário logado encontrado! Por favor, faça login.');
        return null;
    }
    return username;
}

async function loadConsultasRealizadasPaciente() {
    const username = getLoggedUser(); // Obtém o nome de usuário do paciente logado
    if (!username) return;

    try {
        const response = await fetch(PACIENTES_URL);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const pacientes = await response.json();

        if (!Array.isArray(pacientes) || pacientes.length === 0) {
            alert('Nenhum paciente encontrado no sistema.');
            return;
        }

        const container = document.getElementById('consultasRealizadas');
        const placeholder = document.getElementById('txtPlaceHolder2');

        if (!container) {
            console.error('Elemento #consultasRealizadas não encontrado no DOM.');
            return;
        }

        if (!placeholder) {
            console.error('Elemento #txtPlaceHolder2 não encontrado no DOM.');
            return;
        }

        container.innerHTML = ''; // Limpa as consultas anteriores

        let encontrouConsultas = false;

        // Itera sobre os pacientes para buscar as consultas realizadas do paciente logado
        pacientes.forEach((paciente) => {
            if (paciente.username !== username || !paciente.consultasRealizadas || !Array.isArray(paciente.consultasRealizadas)) return;

            paciente.consultasRealizadas.forEach((consulta) => {
                encontrouConsultas = true; // Marca que existem consultas realizadas

                // Cria o card para exibir as informações da consulta realizada
                const div = document.createElement('div');
                div.className = 'card p-2 mt-3 ms-3';
                div.style.width = '18rem';
                div.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">Médico: ${consulta.medico || 'Nome não informado'}</h5>
                        <p class="card-text">
                            <b>Data:</b> ${consulta.data || 'Data não disponível'}<br>
                            <b>Horário:</b> ${consulta.horario || 'Horário não disponível'}<br>
                        </p>
                    </div>
                `;

                container.appendChild(div);
            });
        });

        // Exibe ou oculta o placeholder
        placeholder.classList.toggle('d-none', encontrouConsultas);
    } catch (error) {
        console.error('Erro ao carregar as consultas realizadas do paciente:', error);
        alert('Erro ao carregar as consultas realizadas. Tente novamente.');
    }
}


// Função para carregar médicos e preencher o dropdown
async function loadMedicos() {
    try {
        const response = await fetch(MEDICOS_URL);
        const medicos = await response.json();

        const medicoSelect = document.getElementById('idmedico');
        medicoSelect.innerHTML = `<option value="placeholder">-- Selecione um Médico --</option>`;

        medicos.forEach((medico) => {
            const option = document.createElement('option');
            option.value = medico.username; // Identificação pelo `username`
            option.textContent = medico.name;
            medicoSelect.appendChild(option);
        });

        // Exibir disponibilidade ao selecionar um médico
        medicoSelect.addEventListener('change', async () => {
            const selectedMedico = medicoSelect.value;
            if (selectedMedico !== 'placeholder') {
                await mostrarDisponibilidadeMedico(selectedMedico);
            } else {
                document.getElementById('disponibilidadeResumo').innerHTML = ''; // Limpa o resumo
            }
        });
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        alert('Erro ao carregar a lista de médicos.');
    }
}

// Função para exibir a disponibilidade do médico selecionado
async function mostrarDisponibilidadeMedico(username) {
    const disponibilidadeResumo = document.getElementById('disponibilidadeResumo');

    if (!disponibilidadeResumo) return;

    try {
        const response = await fetch(`${MEDICOS_URL}?username=${username}`);
        const medicos = await response.json();

        if (medicos.length === 0) {
            disponibilidadeResumo.innerHTML = 'Médico não encontrado.';
            return;
        }

        const medico = medicos[0];
        const disponibilidade = medico.disponibilidade;

        if (!disponibilidade) {
            disponibilidadeResumo.innerHTML = 'Este médico não possui disponibilidade cadastrada.';
            return;
        }

        const diasSemana = disponibilidade.diasSemana.join(', ');
        disponibilidadeResumo.innerHTML = `
            <p><b>Dias:</b> ${diasSemana}</p>
            <p><b>Horário:</b> ${disponibilidade.horarioInicio} - ${disponibilidade.horarioFim}</p>
            <p><b>Intervalo:</b> ${disponibilidade.intervaloConsulta} minutos</p>
        `;
    } catch (error) {
        console.error('Erro ao exibir disponibilidade do médico:', error);
    }
}

// Função para validar se o horário do agendamento está disponível
async function validarHorario(medicoUsername, dataConsulta, horario, duracaoConsulta) {
    try {
        // Obter dados do médico
        const medicoResponse = await fetch(`${MEDICOS_URL}?username=${medicoUsername}`);
        const medicos = await medicoResponse.json();

        if (medicos.length === 0) {
            alert('Médico não encontrado.');
            return false;
        }

        const medico = medicos[0];
        const disponibilidade = medico.disponibilidade;

        if (!disponibilidade) {
            alert('Este médico não possui disponibilidade cadastrada.');
            return false;
        }

        // Validar se o horário está dentro da disponibilidade do médico
        const [horaInicio, minutoInicio] = disponibilidade.horarioInicio.split(':').map(Number);
        const [horaFim, minutoFim] = disponibilidade.horarioFim.split(':').map(Number);
        const [horaAgendamento, minutoAgendamento] = horario.split(':').map(Number);

        const inicioMinutos = horaInicio * 60 + minutoInicio;
        const fimMinutos = horaFim * 60 + minutoFim;
        const agendamentoMinutos = horaAgendamento * 60 + minutoAgendamento;

        if (agendamentoMinutos < inicioMinutos || agendamentoMinutos + duracaoConsulta > fimMinutos) {
            alert('O horário selecionado está fora do intervalo de disponibilidade do médico.');
            return false;
        }

        // Validar se há conflitos com outros agendamentos do médico
        const pacientesResponse = await fetch(`${PACIENTES_URL}`);
        const pacientes = await pacientesResponse.json();

        for (const paciente of pacientes) {
            for (const agendamento of paciente.agendamentos || []) {
                if (agendamento.medico === medicoUsername && agendamento.data === dataConsulta) {
                    const [horaAgendada, minutoAgendado] = agendamento.horario.split(':').map(Number);
                    const agendamentoInicio = horaAgendada * 60 + minutoAgendado;
                    const agendamentoFim = agendamentoInicio + duracaoConsulta;

                    if (
                        (agendamentoMinutos >= agendamentoInicio && agendamentoMinutos < agendamentoFim) || // Conflito no início
                        (agendamentoMinutos + duracaoConsulta > agendamentoInicio && agendamentoMinutos < agendamentoFim) // Conflito no fim
                    ) {
                        alert('Conflito de agendamento: o médico já possui outro paciente nesse horário.');
                        return false;
                    }
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Erro ao validar horário:', error);
        alert('Erro ao validar o horário de agendamento.');
        return false;
    }
}

// Função para salvar um novo agendamento com validação
async function salvarAgendamento() {
    const username = getLoggedUser();
    if (!username) return;

    const medicoUsername = document.getElementById('idmedico').value;
    const dataConsulta = document.getElementById('iddata').value;
    const horario = document.getElementById('idhorario').value;

    if (medicoUsername === 'placeholder' || !dataConsulta || !horario) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    try {
        const medicoResponse = await fetch(`${MEDICOS_URL}?username=${medicoUsername}`);
        const medicos = await medicoResponse.json();

        if (medicos.length === 0) {
            alert('Médico não encontrado.');
            return;
        }

        const medico = medicos[0];
        const duracaoConsulta = medico.disponibilidade.intervaloConsulta;

        // Validar horário
        const horarioValido = await validarHorario(medicoUsername, dataConsulta, horario, duracaoConsulta);
        if (!horarioValido) return;

        // Obter dados do paciente
        const pacienteResponse = await fetch(`${PACIENTES_URL}?username=${username}`);
        const pacientes = await pacienteResponse.json();

        if (pacientes.length === 0) {
            alert('Paciente não encontrado.');
            return;
        }

        const paciente = pacientes[0];
        paciente.agendamentos = paciente.agendamentos || [];

        // Adicionar o novo agendamento
        const novoAgendamento = {
            medico: medicoUsername,
            data: dataConsulta,
            horario,
        };

        paciente.agendamentos.push(novoAgendamento);

        await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        alert('Agendamento salvo com sucesso!');
        loadAgendamentos();
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert('Erro ao salvar o agendamento. Tente novamente.');
    }
}

// Função para desmarcar o agendamento
async function desmarcarAgendamento(index) {
    const username = getLoggedUser();
    if (!username) return;

    const confirmacao = confirm('Tem certeza que deseja desmarcar este agendamento?');
    if (!confirmacao) return;

    try {
        // Obter os dados do paciente logado
        const response = await fetch(`${PACIENTES_URL}?username=${username}`);
        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Paciente não encontrado.');
            return;
        }

        const paciente = pacientes[0];
        const agendamentos = paciente.agendamentos || [];

        if (index < 0 || index >= agendamentos.length) {
            alert('Agendamento não encontrado.');
            return;
        }

        // Remove o agendamento pelo índice
        agendamentos.splice(index, 1);

        // Atualiza o paciente no servidor
        await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        alert('Agendamento desmarcado com sucesso!');
        loadAgendamentos(); // Atualiza a lista de agendamentos exibida na tela
    } catch (error) {
        console.error('Erro ao desmarcar agendamento:', error);
        alert('Erro ao desmarcar o agendamento. Tente novamente.');
    }
}

// Função para iniciar o reagendamento de um agendamento existente
function iniciarReagendamento(index) {
    const container = document.getElementById('localondevem');
    const agendamentoDiv = container.children[index];
    const agendamentoBody = agendamentoDiv.querySelector('.card-body');

    // Esconde os botões padrão de "Desmarcar" e "Reagendar"
    const botoes = agendamentoBody.querySelectorAll('button');
    botoes.forEach(botao => botao.style.display = 'none');

    // Cria os campos para reagendamento (data e horário)
    const reagendamentoForm = document.createElement('div');
    reagendamentoForm.classList.add('reagendamento-form');
    reagendamentoForm.innerHTML = `
        <label>Nova Data:</label>
        <input type="date" id="novaData-${index}" min="${new Date().toISOString().split('T')[0]}" class="form-control mb-2">
        
        <label>Novo Horário:</label>
        <input type="time" id="novoHorario-${index}" class="form-control mb-2">
        
        <button class="btn btn-success btn-sm me-2" onclick="confirmarReagendamento(${index})">Confirmar</button>
        <button class="btn btn-secondary btn-sm" onclick="cancelarReagendamento(${index})">Cancelar</button>
    `;

    // Adiciona os novos campos ao card de agendamento
    agendamentoBody.appendChild(reagendamentoForm);
}

// Função para confirmar o reagendamento do agendamento
async function confirmarReagendamento(index) {
    const username = getLoggedUser();
    if (!username) return;

    const novaData = document.getElementById(`novaData-${index}`).value;
    const novoHorario = document.getElementById(`novoHorario-${index}`).value;

    if (!novaData || !novoHorario) {
        alert('Preencha todos os campos para reagendar o agendamento.');
        return;
    }

    try {
        // Obter os dados do paciente logado
        const response = await fetch(`${PACIENTES_URL}?username=${username}`);
        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Paciente não encontrado.');
            return;
        }

        const paciente = pacientes[0];
        const agendamentos = paciente.agendamentos || [];

        if (index < 0 || index >= agendamentos.length) {
            alert('Agendamento não encontrado.');
            return;
        }

        const agendamento = agendamentos[index];
        const medicoUsername = agendamento.medico;

        // Obter a duração da consulta do médico
        const medicoResponse = await fetch(`${MEDICOS_URL}?username=${medicoUsername}`);
        const medicos = await medicoResponse.json();

        if (medicos.length === 0) {
            alert('Médico não encontrado.');
            return;
        }

        const medico = medicos[0];
        const duracaoConsulta = medico.disponibilidade.intervaloConsulta;

        // Validar o novo horário
        const horarioValido = await validarHorario(medicoUsername, novaData, novoHorario, duracaoConsulta);
        if (!horarioValido) return;

        // Atualiza o agendamento com a nova data e horário
        agendamentos[index].data = novaData;
        agendamentos[index].horario = novoHorario;

        // Atualiza os dados do paciente no servidor
        await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        alert('Reagendamento realizado com sucesso!');
        loadAgendamentos(); // Atualizar a lista de agendamentos na tela
    } catch (error) {
        console.error('Erro ao reagendar:', error);
        alert('Erro ao reagendar o agendamento. Tente novamente.');
    }
}

// Função para cancelar o reagendamento
function cancelarReagendamento(index) {
    const container = document.getElementById('localondevem');
    const agendamentoDiv = container.children[index];
    const agendamentoBody = agendamentoDiv.querySelector('.card-body');

    // Remove os campos de reagendamento
    const reagendamentoForm = agendamentoBody.querySelector('.reagendamento-form');
    if (reagendamentoForm) {
        reagendamentoForm.remove();
    }

    // Reexibe os botões de "Desmarcar" e "Reagendar"
    const botoes = agendamentoBody.querySelectorAll('button');
    botoes.forEach(botao => botao.style.display = 'inline-block');
}

// Função para carregar agendamentos do paciente logado
async function loadAgendamentos() {
    const username = getLoggedUser();
    if (!username) return;

    try {
        const response = await fetch(`${PACIENTES_URL}?username=${username}`);
        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Paciente não encontrado.');
            return;
        }

        const paciente = pacientes[0];
        const agendamentos = paciente.agendamentos || [];
        const container = document.getElementById('localondevem');
        const placeholder = document.getElementById('txtPlaceHolder1'); // Obtém o elemento placeholder
        container.innerHTML = '';

        if (agendamentos.length === 0) {
            placeholder.classList.remove('d-none'); // Mostra o placeholder se não houver agendamentos
            return;
        }

        placeholder.classList.add('d-none'); // Esconde o placeholder se houver agendamentos

        for (const [index, agendamento] of agendamentos.entries()) {
            // Obter o médico do agendamento
            const medicoResponse = await fetch(`${MEDICOS_URL}?username=${agendamento.medico}`);
            const medicos = await medicoResponse.json();

            if (medicos.length === 0) {
                alert('Médico não encontrado.');
                continue;
            }

            const medico = medicos[0];

            // Criar o card de agendamento com o telefone do médico
            const div = document.createElement('div');
            div.className = 'card p-2 mt-3 ms-3 col-6';
            div.style.width = '18rem';
            div.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Médico: ${agendamento.medico}</h5>
                    <p class="card-text mb-2">
                        <b>Data:</b> ${agendamento.data}<br>
                        <b>Horário:</b> ${agendamento.horario}<br>
                        <b>Contato:</b> ${medico.phone || 'Não disponível'}
                    </p>
                    <button class="btn btn-danger btn-sm" onclick="desmarcarAgendamento(${index})">Desmarcar</button>
                    <button class="btn btn-primary btn-sm" onclick="iniciarReagendamento(${index})">Reagendar</button>
                </div>
            `;
            container.appendChild(div);
        }
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
    }
}

// Definir o min para a data atual usando JavaScript
const inputData = document.getElementById('iddata');
const hoje = new Date().toISOString().split('T')[0];
inputData.setAttribute('min', hoje);

// Eventos da página
document.getElementById('confirmarAgendamento').addEventListener('click', (event) => {
    event.preventDefault();
    salvarAgendamento();
});

document.addEventListener('DOMContentLoaded', () => {
    loadMedicos();
    loadAgendamentos();
    loadConsultasRealizadasPaciente();
});
