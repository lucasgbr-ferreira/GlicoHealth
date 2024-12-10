// URL do JSON Server
const API_URL = 'http://localhost:3000/medicos';
const PACIENTES_URL = 'http://localhost:3000/pacientes';

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

// Função para capturar o médico logado pelo username no localStorage
function getLoggedMedico() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Nenhum usuário logado encontrado!');
        return null;
    }
    return username;
}

// Função para desmarcar um agendamento de um paciente
async function desmarcarAgendamento(index) {
    const username = getLoggedMedico();  // Obtém o nome de usuário do médico logado
    if (!username) return;

    const confirmacao = confirm('Tem certeza que deseja desmarcar este agendamento?');
    if (!confirmacao) return;

    try {
        // Busca todos os pacientes no servidor
        const response = await fetch(PACIENTES_URL);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Nenhum paciente encontrado no sistema.');
            return;
        }

        // Encontra o paciente que possui o agendamento
        const paciente = pacientes.find(p => p.agendamentos && p.agendamentos[index] && p.agendamentos[index].medico === username);
        if (!paciente) {
            alert('Agendamento não encontrado.');
            return;
        }

        const agendamento = paciente.agendamentos[index];

        // Confirma se o agendamento pertence ao médico logado
        if (agendamento.medico !== username) {
            alert('Este agendamento não pertence ao médico logado.');
            return;
        }

        // Remove o agendamento da lista
        paciente.agendamentos.splice(index, 1);

        // Atualiza os dados do paciente no servidor
        const updateResponse = await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        if (updateResponse.ok) {
            alert('Agendamento desmarcado com sucesso!');
            loadAgendamentosMedico(); // Recarrega a lista de agendamentos
        } else {
            alert('Erro ao desmarcar o agendamento. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao desmarcar o agendamento:', error);
        alert('Erro ao desmarcar o agendamento. Tente novamente.');
    }
}


// Função para iniciar o reagendamento de um agendamento existente
function iniciarReagendamento(index) {
    const username = getLoggedMedico();  // Obtém o nome de usuário do médico logado
    if (!username) return;

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
    const username = getLoggedMedico();  // Obtém o nome de usuário do médico logado
    if (!username) return;

    const novaData = document.getElementById(`novaData-${index}`).value;
    const novoHorario = document.getElementById(`novoHorario-${index}`).value;

    if (!novaData || !novoHorario) {
        alert('Preencha todos os campos para reagendar o agendamento.');
        return;
    }

    try {
        // Busca todos os pacientes no servidor
        const response = await fetch(PACIENTES_URL);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Nenhum paciente encontrado no sistema.');
            return;
        }

        // Encontra o paciente que possui o agendamento
        const paciente = pacientes.find(p => p.agendamentos && p.agendamentos[index] && p.agendamentos[index].medico === username);
        if (!paciente) {
            alert('Agendamento não encontrado.');
            return;
        }

        const agendamento = paciente.agendamentos[index];

        // Verifica se o agendamento pertence ao médico logado
        if (agendamento.medico !== username) {
            alert('Este agendamento não pertence ao médico logado.');
            return;
        }

        // Obter a duração da consulta do médico
        const medicoResponse = await fetch(`${API_URL}?username=${username}`);
        const medicos = await medicoResponse.json();

        if (medicos.length === 0) {
            alert('Médico não encontrado.');
            return;
        }

        const medico = medicos[0];
        const duracaoConsulta = medico.disponibilidade.intervaloConsulta;

        // Validar o novo horário
        const horarioValido = await validarHorario(username, novaData, novoHorario, duracaoConsulta);
        if (!horarioValido) return;

        // Atualiza o agendamento com a nova data e horário
        agendamento.data = novaData;
        agendamento.horario = novoHorario;

        // Atualiza os dados do paciente no servidor
        await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        alert('Reagendamento realizado com sucesso!');
        loadAgendamentosMedico(); // Atualiza a lista de agendamentos na tela
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

// Função para validar se o novo horário está disponível
async function validarHorario(username, novaData, novoHorario, duracaoConsulta) {
    try {
        // Busca os agendamentos do médico
        const response = await fetch(`${PACIENTES_URL}`);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const pacientes = await response.json();

        // Filtra os agendamentos do médico para o dia e horário propostos
        const agendamentosConflito = pacientes.some((paciente) => {
            return (paciente.agendamentos || []).some((agendamento) => {
                if (agendamento.medico === username && agendamento.data === novaData) {
                    const [hora, minuto] = novoHorario.split(':').map(Number);
                    const horaAgendamento = agendamento.horario.split(':')[0];
                    const minutoAgendamento = agendamento.horario.split(':')[1];

                    // Verifica se os horários se sobrepõem
                    const novoInicio = new Date(novaData + ' ' + novoHorario);
                    const novoFim = new Date(novaData + ' ' + novoHorario);
                    novoFim.setMinutes(novoInicio.getMinutes() + duracaoConsulta);

                    const agendamentoInicio = new Date(novaData + ' ' + agendamento.horario);
                    const agendamentoFim = new Date(novaData + ' ' + agendamento.horario);
                    agendamentoFim.setMinutes(agendamentoInicio.getMinutes() + duracaoConsulta);

                    return (novoInicio < agendamentoFim && novoFim > agendamentoInicio);  // Verifica sobreposição de horários
                }
                return false;
            });
        });

        if (agendamentosConflito) {
            alert('Este horário já está ocupado. Escolha outro horário.');
            return false; // Indica que o horário não é válido
        }

        return true; // Horário válido
    } catch (error) {
        console.error('Erro ao validar o horário:', error);
        alert('Erro ao verificar disponibilidade. Tente novamente.');
        return false;
    }
}

async function loadAgendamentosMedico() {
    const username = getLoggedMedico(); // A função getLoggedMedico deve capturar o médico logado
    if (!username) return;

    try {
        const response = await fetch(PACIENTES_URL);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Nenhum paciente encontrado no sistema.');
            return;
        }

        const container = document.getElementById('localondevem');
        const placeholder = document.getElementById('txtPlaceHolder1');
        if (!container || !placeholder) {
            console.error('Elemento #localondevem ou #txtPlaceHolder1 não encontrado no DOM.');
            return;
        }

        container.innerHTML = ''; // Limpa os agendamentos anteriores

        let encontrouAgendamentos = false;

        pacientes.forEach((paciente) => {
            (paciente.agendamentos || []).forEach((agendamento, index) => {
                if (agendamento.medico === username) {
                    encontrouAgendamentos = true;

                    const div = document.createElement('div');
                    div.className = 'card p-2 mt-3 ms-3 col-6';
                    div.style.width = '18rem';
                    div.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Paciente: ${paciente.name}</h5>
                            <p class="card-text mb-2">
                                <b>Data:</b> ${agendamento.data}<br>
                                <b>Horário:</b> ${agendamento.horario}<br>
                                <b>Contato:</b> ${paciente.phone || 'Não informado'}
                            </p>
                            <button class="btn btn-danger btn-sm" onclick="desmarcarAgendamento(${index})">Desmarcar</button>
                            <button class="btn btn-primary btn-sm" onclick="iniciarReagendamento(${index})">Reagendar</button>
                            <button class="btn btn-success btn-sm" onclick="finalizarConsulta(${index})">Finalizar</button>
                        </div>
                    `;

                    container.appendChild(div);
                }
            });
        });

        placeholder.classList.toggle('d-none', encontrouAgendamentos);
    } catch (error) {
        console.error('Erro ao carregar os agendamentos do médico:', error);
        alert('Erro ao carregar os agendamentos. Tente novamente.');
    }
}

async function loadConsultasRealizadasMedico() {
    const username = getLoggedMedico(); // Obtém o nome de usuário do médico logado
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

        // Itera sobre os pacientes para buscar consultas realizadas
        pacientes.forEach((paciente) => {
            if (!paciente.consultasRealizadas || !Array.isArray(paciente.consultasRealizadas)) return;

            paciente.consultasRealizadas.forEach((consulta) => {
                if (consulta.medico === username) {
                    encontrouConsultas = true;

                    const div = document.createElement('div');
                    div.className = 'card p-2 mt-3 ms-3';
                    div.style.width = '18rem';
                    div.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Paciente: ${paciente.name || 'Nome não informado'}</h5>
                            <p class="card-text">
                                <b>Data:</b> ${consulta.data || 'Data não disponível'}<br>
                                <b>Horário:</b> ${consulta.horario || 'Horário não disponível'}<br>
                                <b>Contato:</b> ${paciente.phone || 'Não informado'}
                            </p>
                        </div>
                    `;

                    container.appendChild(div);
                }
            });
        });

        // Exibe ou oculta o placeholder
        placeholder.classList.toggle('d-none', encontrouConsultas);
    } catch (error) {
        console.error('Erro ao carregar as consultas realizadas do médico:', error);
        alert('Erro ao carregar as consultas realizadas. Tente novamente.');
    }
}

async function finalizarConsulta(index) {
    const username = getLoggedMedico();  // Obtém o nome de usuário do médico logado
    if (!username) return;

    const confirmacao = confirm('Tem certeza que deseja finalizar esta consulta?');
    if (!confirmacao) return;

    try {
        // Busca todos os pacientes no servidor
        const response = await fetch(PACIENTES_URL);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const pacientes = await response.json();

        if (pacientes.length === 0) {
            alert('Nenhum paciente encontrado no sistema.');
            return;
        }

        // Encontra o paciente que possui o agendamento
        const paciente = pacientes.find(p => p.agendamentos && p.agendamentos[index] && p.agendamentos[index].medico === username);
        if (!paciente) {
            alert('Agendamento não encontrado.');
            return;
        }

        const agendamento = paciente.agendamentos[index];

        // Verifica se a data do agendamento já passou
        const dataAtual = new Date();
        const dataAgendamento = new Date(`${agendamento.data}T${agendamento.horario}:00`);

        if (dataAtual < dataAgendamento) {
            alert('Este agendamento ainda não passou. Só é possível finalizar consultas passadas.');
            return;
        }

        // Move o agendamento para o campo de "consultasRealizadas"
        paciente.consultasRealizadas = paciente.consultasRealizadas || [];
        paciente.consultasRealizadas.push(agendamento);

        // Remove o agendamento da lista de agendamentos
        paciente.agendamentos.splice(index, 1);

        // Atualiza os dados do paciente no servidor
        const updateResponse = await fetch(`${PACIENTES_URL}/${paciente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente),
        });

        if (updateResponse.ok) {
            alert('Consulta finalizada com sucesso!');
            loadAgendamentosMedico();
            loadConsultasRealizadasMedico();
        } else {
            alert('Erro ao finalizar consulta. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao finalizar consulta:', error);
        alert('Erro ao finalizar consulta. Tente novamente.');
    }
}


// Função para salvar a disponibilidade do médico no JSON Server
async function salvarDisponibilidade() {
    const username = getLoggedMedico();
    if (!username) return;

    const diasSemana = Array.from(document.querySelectorAll('input[name="diasSemana"]:checked'))
        .map((checkbox) => checkbox.value);

    const horarioInicio = document.getElementById('horarioInicio').value;
    const horarioFim = document.getElementById('horarioFim').value;
    const intervaloConsulta = parseInt(document.getElementById('intervaloConsulta').value, 10);

    if (!diasSemana.length || !horarioInicio || !horarioFim || isNaN(intervaloConsulta)) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    const disponibilidade = {
        diasSemana,
        horarioInicio,
        horarioFim,
        intervaloConsulta,
    };

    try {
        const response = await fetch(`${API_URL}?username=${username}`);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const data = await response.json();
        if (data.length === 0) {
            alert('Médico não encontrado no sistema.');
            return;
        }

        const medico = data[0];
        medico.disponibilidade = disponibilidade;

        const updateResponse = await fetch(`${API_URL}/${medico.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(medico),
        });

        if (updateResponse.ok) {
            alert('Disponibilidade salva com sucesso!');
        } else {
            alert('Erro ao salvar disponibilidade!');
        }
    } catch (error) {
        console.error('Erro ao salvar disponibilidade:', error);
        alert('Erro ao conectar-se ao servidor!');
    }
}

// Função para excluir a disponibilidade do médico no JSON Server
async function apagarDisponibilidade() {
    const username = getLoggedMedico();
    if (!username) return;

    try {
        const response = await fetch(`${API_URL}?username=${username}`);
        if (!response.ok) throw new Error('Erro ao conectar ao servidor.');

        const data = await response.json();
        if (data.length === 0) {
            alert('Médico não encontrado no sistema.');
            return;
        }

        const medico = data[0];
        if (!medico.disponibilidade) {
            alert('Nenhuma disponibilidade encontrada para o médico logado.');
            return;
        }

        delete medico.disponibilidade;

        const updateResponse = await fetch(`${API_URL}/${medico.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(medico),
        });

        if (updateResponse.ok) {
            alert('Disponibilidade excluída com sucesso!');
        } else {
            alert('Erro ao excluir disponibilidade!');
        }
    } catch (error) {
        console.error('Erro ao excluir disponibilidade:', error);
        alert('Erro ao conectar-se ao servidor!');
    }
}

// Funções de inicialização e eventos
document.addEventListener('DOMContentLoaded', () => {
    loadAgendamentosMedico();
    loadConsultasRealizadasMedico();
});

document.getElementById('formDisponibilidade').addEventListener('submit', (event) => {
    event.preventDefault();
    salvarDisponibilidade();
});

document.getElementById('modalDisponibilidade').addEventListener('show.bs.modal', () => {
    console.log('Modal de disponibilidade aberto.');
});