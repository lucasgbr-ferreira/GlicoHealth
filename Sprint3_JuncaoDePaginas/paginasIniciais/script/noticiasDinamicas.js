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
