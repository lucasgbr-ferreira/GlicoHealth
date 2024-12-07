document.getElementById("btn-prontuarios").addEventListener("mouseover", function() {
    document.getElementById("col-visivel").classList.add("d-none");  // Esconde a coluna de agendamento
    document.getElementById("col-invisivel").classList.remove("d-none");  // Exibe a coluna de orientações
});

document.getElementById("btn-prontuarios").addEventListener("mouseout", function() {
    document.getElementById("col-visivel").classList.remove("d-none");  // Exibe a coluna de agendamento
    document.getElementById("col-invisivel").classList.add("d-none");  // Esconde a coluna de orientações
});
