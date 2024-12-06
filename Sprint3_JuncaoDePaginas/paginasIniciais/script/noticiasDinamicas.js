const API_KEY = '2e72b508e5224b0c9d3018a84a951531'; // Substitua pela sua chave da News API
const API_URL = `https://newsapi.org/v2/everything?q=diabetes&language=pt&apiKey=${API_KEY}`;
const newsContainer = document.getElementById('news-cards');
const articleContainer = document.getElementById('article-card');

async function fetchNews() {
    try {
        const response = await fetch(API_URL);

        // Verifica se a resposta da API foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro na requisição à API');
        }

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
    newsContainer.innerHTML = ''; // Limpa o conteúdo atual

    articles.slice(17, 22).forEach((article, index) => {
        // Verifica se a notícia tem as propriedades essenciais
        if (article.title && article.description && article.url) {
            if (index === 0) {
                const publishedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            
                const card = document.createElement('div');
                card.className = 'col-12';
            
                card.innerHTML = `
                <div class="card text-center" style:max-width: 80%;>
                    <div class="card-body">
                        <h4 class="card-title">${truncateText(article.title, 100)}</h4>
                        <p class="card-text">${truncateText(article.description, 300)}</p>
                        <a href="${article.url}" class="btn btn-secondary btn-sm px-5 opacity-75">Leia mais</a>
                    </div>
                    <div class="card-footer text-body-secondary">Publicado em: ${publishedDate}</div>
                </div>
            `;
            
                articleContainer.appendChild(card);
            } else {
                const card = document.createElement('div');
                card.className = 'col-12 col-sm-6 col-md-3 mb-4';

                // Row de cards
                card.innerHTML = `
                <div class="card" style="width: 18rem; height: 350px; display: flex; flex-direction: column;">
                    <img src="${article.urlToImage || 'images/default-news.jpg'}" class="card-img-top" alt="Notícia" style="height: 150px; object-fit: cover; display: block; margin: 0 auto;">
                    <div class="card-body" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 0.5rem;">
                        <div>
                            <h5 class="card-title" style="font-size: 1rem; height: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${truncateText(article.title, 50)}</h5>
                            <p class="card-text" style="font-size: 0.9rem; height: 80px; overflow: hidden; text-overflow: ellipsis;">${truncateText(article.description, 120)}</p>
                        </div>
                        <div style="margin-top: auto; text-align: center;">
                            <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm w-100">Leia mais</a>
                        </div>
                    </div>
                </div>
            `;                      
                newsContainer.appendChild(card);
            }
        } else {
            console.warn('Notícia com dados inválidos, não será exibida:', article);
        }
    });
}

function truncateText(text, maxLength) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || 'Texto não disponível.';
}
// Chama a função para buscar notícias quando a página carrega
document.addEventListener("DOMContentLoaded", fetchNews);

// {Js fora da API}
function fecharmodal() {
    // Obter a instância do modal
    const modalElement = document.getElementById('exampleModal');
    const modal = bootstrap.Modal.getInstance(modalElement); // Pega a instância ativa do modal
    if (modal) {
        modal.hide(); // Fecha o modal
    }
    var toast = new bootstrap.Toast(document.getElementById('toastRequestAlert'));
    toast.show();
}
let userRole = ''; // Variável para armazenar a role selecionada

// Função para definir a role
function setRole(role) {
    userRole = role; // Atribui a role do botão clicado
}

// Listener para o envio do formulário
document.getElementById('requestForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Impede o envio padrão do formulário

    const username = document.getElementById('offcanvasUsername').value;
    const comment = document.getElementById('offcanvasComment').value;

    // Verifique se o campo de username e comentário estão preenchidos
    if (!username || !comment) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Verifique se o username já existe no sistema
    fetch(`http://localhost:3000/requisicoes?username=${username}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Se já existe uma requisição com esse username, avise o usuário
                alert('Este username já está em uso. Escolha outro.');
            } else {
                // Se não houver requisição com esse username, envie o formulário
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
                    // Fechar o offcanvas
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

// Função para verificar o status da requisição
document.getElementById('checkRequestStatusButton').addEventListener('click', function() {
    const username = document.getElementById('offcanvasUsername').value;

    // Verifique se o campo de usuário foi preenchido
    if (username) {
        fetch(`http://localhost:3000/requisicoes?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const request = data[0]; // Supondo que a requisição será a primeira encontrada

                    // Atualiza os campos do modal com os dados da requisição
                    document.getElementById("modalCardHeader").textContent = `Requisição de: ${request.username}`;
                    document.getElementById("modalUsername").textContent = request.username;
                    document.getElementById("modalComment").textContent = request.comment;
                    document.getElementById("modalStatus").textContent = request.status;
                    document.getElementById("modalRole").textContent = request.role;

                    // Limpa o conteúdo de botão anterior (se houver)
                    const existingRedirectButton = document.getElementById("redirectButton");
                    if (existingRedirectButton) {
                        existingRedirectButton.remove();
                    }

                    // Verifica se o status é 'aceita' e adiciona o botão de redirecionamento
                    const modalBody = document.getElementById("modalBody");

                    console.log('Status da requisição:', request.status);
                    if (request.status === 'aceita') {
                        console.log("Status é 'aceita', entrando no if.");

                        if (request.role === 'Administrador') {
                            console.log("Função é 'Administrador', criando botão para admin.");
                            modalBody.innerHTML += `
                                <button id="redirectButton" class="btn btn-danger">
                                    Ir para Página de Administração
                                </button>
                            `;
                            document.getElementById('redirectButton').onclick = function() {
                                window.location.href = '../PaginaDeAdministrador.html';
                            };
                        } else {
                            console.log("Função não é 'Administrador', criando botão para usuário.");
                            modalBody.innerHTML += `
                                <button id="redirectButton" class="btn btn-info">
                                    Ir para Página de Usuário
                                </button>
                            `;
                            document.getElementById('redirectButton').onclick = function() {
                                window.location.href = '../PaginaDeUsuario.html';
                            };
                        }
                    } else {
                        console.log("Status não é 'aceita'.");
                    }

                    // Exibe o modal após atualizar o conteúdo
                    const requestModal = new bootstrap.Modal(document.getElementById('viewRequestModal'));
                    requestModal.show();

                } else {
                    // Caso contrário, informa que a requisição não foi encontrada
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






