function mostraagendamento() {
  vnome=document.getElementById("idnome");
  vdata=document.getElementById("iddata");
  vhorario=document.getElementById("idhorario");
  vmedico=document.getElementById("idmedico");
  vespecialidade=document.getElementById("idespecialidade");
  alert ("Consulta agendada para o dia: "+ vdata.value + " às " + vhorario.value + ", com o Doutor " + vmedico.value + "." + " paciente: " + vnome.value);
  gravadados();
}

function fecharPopup(event) {
    if (event) event.preventDefault(); 
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function abrirpopup(event) {
    if (event) event.preventDefault(); 
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.style.display = 'flex';
    }
}


function gravadados() {
    const vnome = document.getElementById('idnome').value;
    const vdata = document.getElementById('iddata').value;
    const vhora = document.getElementById('idhorario').value;
    const vespeci = document.getElementById('idespecialidade').value;
    const vmedico = document.getElementById('idmedico').value;

    localStorage.setItem('ag_nome', vnome);
    localStorage.setItem('ag_data', vdata);
    localStorage.setItem('ag_hora', vhora);
    localStorage.setItem('ag_especialidade', vespeci);
    localStorage.setItem('ag_medico', vmedico);

    const savedInfo = document.getElementById('savedInfo');
    savedInfo.textContent = `Paciente: ${vnome}, Data: ${vdata}, Hora: ${vhora}, Especialidade: ${vespeci}, Médico: ${vmedico}`;

    const form = document.getElementById('formconsulta');
    form.reset();

}

window.onload = function() {
    const vnome = localStorage.getItem('ag_nome');
    const vdata = localStorage.getItem('ag_data');
    const vhora = localStorage.getItem('ag_hora');
    const vmedico = localStorage.getItem('ag_medico');
    const vespeci = localStorage.getItem('ag_especialidade');

    const savedInfo = document.getElementById('savedInfo');
    if (vnome) {
        //savedInfo.textContent = `Paciente: ${vnome}, Data: ${vdata}, Hora: ${vhora}, Especialidade: ${vespeci}, Médico: ${vmedico}`;
    };
   fecharPopup();
   
};


let consultas = JSON.parse(localStorage.getItem("consultas")) || [];


function exibirConsultas() {
    const localCards = document.getElementById("localondevem");
    localCards.innerHTML = ""; 

    consultas.forEach((consulta) => {
        const card = `
            <div class="card mb-3" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">Consulta</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">${consulta.especialidade}</h6>
                    <p class="card-text">Médico: ${consulta.medico}</p>
                    <p class="card-text">Data: ${consulta.data}</p>
                    <p class="card-text">Hora: ${consulta.horario}</p>
                    <p class="card-text">Paciente: ${consulta.nome}</p>
                </div>
            </div>`;
        localCards.innerHTML += card;
    });
}


function gravadados() {
    const vnome = document.getElementById('idnome').value;
    const vdata = document.getElementById('iddata').value;
    const vhora = document.getElementById('idhorario').value;
    const vespeci = document.getElementById('idespecialidade').value;
    const vmedico = document.getElementById('idmedico').value;

    if (vnome && vdata && vhora && vespeci && vmedico) {
        const novaConsulta = {
            nome: vnome,
            data: vdata,
            horario: vhora,
            especialidade: vespeci,
            medico: vmedico,
        };

        consultas.push(novaConsulta);
        localStorage.setItem("consultas", JSON.stringify(consultas)); 
        exibirConsultas(); 

        fecharPopup();

        
        const form = document.getElementById('formconsulta');
        form.reset();
    } else {
        alert("Por favor, preencha todos os campos.");
    }
}


window.onload = function () {
    //localStorage.clear()
    exibirConsultas();
    fecharPopup();
    
};
