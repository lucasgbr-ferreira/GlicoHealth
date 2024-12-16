// server.js
const express = require('express');
const path = require('path');
const jsonServer = require('json-server');

const app = express();
const PORT = process.env.PORT || 3001; // Porta dinâmica para ambientes como Render
const dbFile = path.join(__dirname, 'db.json');

// Middleware para processar JSON e arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Sprint3')));

// Configura o JSON Server como middleware
const router = jsonServer.router(dbFile); // Carrega o arquivo db.json
const middlewares = jsonServer.defaults(); // Middleware padrão do JSON Server

app.use(middlewares); // Usa os middlewares do json-server
app.use(router); // Define as rotas baseadas no conteúdo de db.json

// Rota base para redirecionar para 'HomePage.html'
app.get('/', (req, res) => {
    res.redirect('/paginasIniciais/HomePage.html');
});

// Rota para carregar 'HomePage.html'
app.get('/paginasIniciais/HomePage.html', (req, res) => {
    const filePath = path.join(__dirname, 'Sprint3', 'paginasIniciais', 'homePage.html');
    res.sendFile(filePath);
});

// Inicializa o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor JSON Server rodando na porta ${PORT}`);
});
