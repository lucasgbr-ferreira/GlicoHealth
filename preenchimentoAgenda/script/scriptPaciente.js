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

    document.getElementById('dataAtual').textContent = dataFormatada;
}

exibirDataAtual();

function getLoggedUser() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Nenhum usuário logado encontrado! Por favor, faça login.');
        return null;
    }
    return username;
}

async function loadConsultasRealizadasPaciente() {
    const username = getLoggedUser(); 
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

        container.innerHTML = ''; 

        let encontrouConsultas = false;

        pacientes.forEach((paciente) => {
            if (paciente.username !== username || !paciente.consultasRealizadas || !Array.isArray(paciente.consultasRealizadas)) return;

            paciente.consultasRealizadas.forEach((consulta) => {
                encontrouConsultas = true; 

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

        placeholder.classList.toggle('d-none', encontrouConsultas);
    } catch (error) {
        console.error('Erro ao carregar as consultas realizadas do paciente:', error);
        alert('Erro ao carregar as consultas realizadas. Tente novamente.');
    }
}

async function loadMedicos() {
    try {
        const response = await fetch(MEDICOS_URL);
        const medicos = await response.json();

        const medicoSelect = document.getElementById('idmedico');
        medicoSelect.innerHTML = `<option value="placeholder">-- Selecione um Médico --</option>`;

        medicos.forEach((medico) => {
            const option = document.createElement('option');
            option.value = medico.username; 
            option.textContent = medico.name;
            medicoSelect.appendChild(option);
        });

        medicoSelect.addEventListener('change', async () => {
            const selectedMedico = medicoSelect.value;
            if (selectedMedico !== 'placeholder') {
                await mostrarDisponibilidadeMedico(selectedMedico);
            } else {
                document.getElementById('disponibilidadeResumo').innerHTML = ''; 
            }
        });
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        alert('Erro ao carregar a lista de médicos.');
    }
}

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

async function validarHorario(medicoUsername, dataConsulta, horario, duracaoConsulta) {
    try {
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

        const horarioValido = await validarHorario(medicoUsername, dataConsulta, horario, duracaoConsulta);
        if (!horarioValido) return;

        const pacienteResponse = await fetch(`${PACIENTES_URL}?username=${username}`);
        const pacientes = await pacienteResponse.json();

        if (pacientes.length === 0) {
            alert('Paciente não encontrado.');
            return;
        }

        const paciente = pacientes[0];
        paciente.agendamentos = paciente.agendamentos || [];

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

async function desmarcarAgendamento(index) {
    const username = getLoggedUser();
    if (!username) return;

    const confirmacao = confirm('Tem certeza que deseja desmarcar este agendamento?');
    if (!confirmacao) return;

    try {
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

        agendamentos.splice(index, 1);

        await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        alert('Agendamento desmarcado com sucesso!');
        loadAgendamentos(); 
    } catch (error) {
        console.error('Erro ao desmarcar agendamento:', error);
        alert('Erro ao desmarcar o agendamento. Tente novamente.');
    }
}

function iniciarReagendamento(index) {
    const container = document.getElementById('localondevem');
    const agendamentoDiv = container.children[index];
    const agendamentoBody = agendamentoDiv.querySelector('.card-body');

    const botoes = agendamentoBody.querySelectorAll('button');
    botoes.forEach(botao => botao.style.display = 'none');

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

    agendamentoBody.appendChild(reagendamentoForm);
}

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

        const horarioValido = await validarHorario(medicoUsername, novaData, novoHorario, duracaoConsulta);
        if (!horarioValido) return;

        agendamentos[index].data = novaData;
        agendamentos[index].horario = novoHorario;

        await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        alert('Reagendamento realizado com sucesso!');
        loadAgendamentos(); 
    } catch (error) {
        console.error('Erro ao reagendar:', error);
        alert('Erro ao reagendar o agendamento. Tente novamente.');
    }
}

function cancelarReagendamento(index) {
    const container = document.getElementById('localondevem');
    const agendamentoDiv = container.children[index];
    const agendamentoBody = agendamentoDiv.querySelector('.card-body');

    const reagendamentoForm = agendamentoBody.querySelector('.reagendamento-form');
    if (reagendamentoForm) {
        reagendamentoForm.remove();
    }

    const botoes = agendamentoBody.querySelectorAll('button');
    botoes.forEach(botao => botao.style.display = 'inline-block');
}

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
        const placeholder = document.getElementById('txtPlaceHolder1'); 
        container.innerHTML = '';

        if (agendamentos.length === 0) {
            placeholder.classList.remove('d-none'); 
            return;
        }

        placeholder.classList.add('d-none'); 

        for (const [index, agendamento] of agendamentos.entries()) {
            const medicoResponse = await fetch(`${MEDICOS_URL}?username=${agendamento.medico}`);
            const medicos = await medicoResponse.json();

            if (medicos.length === 0) {
                alert('Médico não encontrado.');
                continue;
            }

            const medico = medicos[0];

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

const inputData = document.getElementById('iddata');
const hoje = new Date().toISOString().split('T')[0];
inputData.setAttribute('min', hoje);

document.getElementById('confirmarAgendamento').addEventListener('click', (event) => {
    event.preventDefault();
    salvarAgendamento();
});

document.addEventListener('DOMContentLoaded', () => {
    loadMedicos();
    loadAgendamentos();
    loadConsultasRealizadasPaciente();
});
