const API_KEY = 'e29949184b5f463aabefc1ecafd13681';
const API_URL = `https://newsapi.org/v2/everything?q=diabetes&language=pt&apiKey=${API_KEY}`;
const newsContainer = document.getElementById('news-cards');
const articleContainer = document.getElementById('article-card');

async function fetchNews() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            renderNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p>Nenhuma notícia encontrada no momento.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar as notícias:', error);
        newsContainer.innerHTML = '<p>Erro ao carregar notícias.</p>';
    }
}

function renderNews(articles) {
    newsContainer.innerHTML = '';

    articles.slice(21, 28).forEach((article, index) => {
        if (index === 0) {
            const publishedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        
            const card = document.createElement('div');
            card.className = 'col-12';
        
            card.innerHTML = `
                <div class="card text-center">
                    <div class="card-body">
                        <h4 class="card-title">${truncateText(article.title, 100)}</h4>
                        <p class="card-text">${truncateText(article.description, 300)}</p>
                        <a href="${article.url}" class="btn btn-secondary btn-sm px-5 opacity-75">Leia mais</a>
                    </div>
                    <div class="card-footer text-body-secondary">Publicado em: ${publishedDate}</div>
                </div>
            `;
        
            articleContainer.appendChild(card);
        }
        

        else {
            const card = document.createElement('div');
            card.className = 'col-12 col-sm-6 col-md-4 mb-4';

            card.innerHTML = `
            <div class="card">
                <img src="${article.urlToImage || 'images/default-news.jpg'}" class="card-img-top" alt="Notícia" style="height:200px; object-fit:cover;">
                <div class="card-body">
                    <h5 class="card-title">${truncateText(article.title, 50)}</h5>
                    <p class="card-text">${truncateText(article.description, 120)}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-primary">Leia mais</a>
                </div>
            </div>
        `;

            newsContainer.appendChild(card);
        }
    });
}
function truncateText(text, maxLength) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || 'Texto não disponível.';
}

document.addEventListener("DOMContentLoaded", fetchNews);

function truncateText(text, maxLength) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || 'Texto não disponível.';
}
document.addEventListener("DOMContentLoaded", fetchNews);

function fecharmodal() {
    const modalElement = document.getElementById('exampleModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide(); 
    }
    var toast = new bootstrap.Toast(document.getElementById('toastRequestAlert'));
    toast.show();
}
let userRole = ''; 

function setRole(role) {
    userRole = role; 
}

document.getElementById('requestForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const username = document.getElementById('offcanvasUsername').value;
    const comment = document.getElementById('offcanvasComment').value;

    if (!username || !comment) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    fetch(`http://localhost:3000/requisicoes?username=${username}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                alert('Este username já está em uso. Escolha outro.');
            } else {
                const requestData = {
                    username: username,
                    comment: comment,
                    status: 'pendente', 
                    role: userRole
                };

                fetch('http://localhost:3000/requisicoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => response.json())
                .then(data => {
                    alert('Requisição enviada com sucesso!');
                    document.getElementById('offcanvasUsername').value = '';
                    document.getElementById('offcanvasComment').value = '';
                    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasRequest'));
                    offcanvas.hide();
                })
                .catch(error => {
                    console.error('Erro ao enviar a requisição:', error);
                    alert('Erro ao enviar a requisição.');
                });
            }
        })
        .catch(error => {
            console.error('Erro ao verificar se o username já existe:', error);
            alert('Erro ao verificar o username.');
        });
});

document.getElementById('checkRequestStatusButton').addEventListener('click', function() {
    const username = document.getElementById('offcanvasUsername').value;

    if (username) {
        fetch(`http://localhost:3000/requisicoes?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const request = data[0]; 

                    document.getElementById("modalCardHeader").textContent = `Requisição de: ${request.username}`;
                    document.getElementById("modalUsername").textContent = request.username;
                    document.getElementById("modalComment").textContent = request.comment;
                    document.getElementById("modalStatus").textContent = request.status;
                    document.getElementById("modalRole").textContent = request.role;

                    const statusElement = document.getElementById("modalStatus");
                    if (request.status === 'aceita') {
                        statusElement.style.color = 'green'; 
                    } else if (request.status === 'pendente') {
                        statusElement.style.color = 'yellow'; 
                    } else if (request.status === 'recusada') {
                        statusElement.style.color = 'red'; 
                    }

                    const existingRedirectButton = document.getElementById("redirectButton");
                    if (existingRedirectButton) {
                        existingRedirectButton.remove();
                    }

                    const modalBody = document.getElementById("modalBodyReq");

                    console.log('Status da requisição:', request.status);
                    if (request.status === 'aceita') {
                        console.log("Status é 'aceita', entrando no if.");

                        const button = document.createElement("button");
                        button.id = "redirectButton"; 
                        button.classList.add("btn"); 
                        button.textContent = "Ir para Página de ";

                        if (request.role === 'Administrador') {
                            console.log("Função é 'Administrador', criando botão para admin.");
                            button.classList.add("btn-info"); 
                            button.textContent += "Administração"; 
                            button.onclick = function() {
                                window.location.href = '../InterfaceAdm/Adm.html';
                            };
                        } else {
                            console.log("Função não é 'Administrador', criando botão para usuário.");
                            button.classList.add("btn-info"); 
                            button.textContent += "Usuário"; 
                            button.onclick = function() {
                                window.location.href = '../perfilMedico/PerfilMed.html';
                            };
                        }

                        modalBody.appendChild(button);
                    } else {
                        console.log("Status não é 'aceita'.");
                    }

                    const requestModal = new bootstrap.Modal(document.getElementById('viewRequestModal'));
                    requestModal.show();

                } else {
                    alert('Nenhuma requisição encontrada para esse usuário.');
                }
            })
            .catch(error => {
                console.error('Erro ao verificar o status da requisição:', error);
                alert('Erro ao verificar o status da requisição.');
            });
    } else {
        alert('Por favor, preencha o campo de usuário para verificar o status.');
    }
});








