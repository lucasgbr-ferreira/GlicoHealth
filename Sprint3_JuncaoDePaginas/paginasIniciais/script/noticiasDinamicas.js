// Configuração para consumir a API
const API_KEY = 'e29949184b5f463aabefc1ecafd13681'; // Substitua pela sua chave da News API
const API_URL = `https://newsapi.org/v2/everything?q=diabetes&language=pt&apiKey=${API_KEY}`;
const newsContainer = document.getElementById('news-cards');
const articleContainer = document.getElementById('article-card');

function checkLogin() {
    const loggedIn = localStorage.getItem("loggedIn");

    // Se o usuário não estiver logado, redireciona para a página de login
    if (!loggedIn) {
        window.location.href = "../../InterfaceUsuário/Index.html";
    } else {
        // Se o usuário estiver logado, exibe um alerta informando que ele está logado
        const username = localStorage.getItem("username");
        if (username) {
            alert(`Você está logado como ${username}`);  // Exibe o alerta
            displayWelcomeMessage(username);  // Exibe a mensagem de boas-vindas
        }
    }
}

function displayWelcomeMessage(username) {
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bem-vindo, ${username}!`;
    }
}

// Chama a função checkLogin quando a página for carregada
document.addEventListener("DOMContentLoaded", checkLogin);

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
    newsContainer.innerHTML = ''; // Limpa o conteúdo atual

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
// Chama a função para buscar notícias quando a página carrega
fetchNews();