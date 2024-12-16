// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Porta dinâmica para ambientes como Render
const dbFile = path.join(__dirname, 'db.json');

// Middleware para processar JSON
app.use(bodyParser.json());

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'Sprint3')));

// Função para obter dados do banco de dados
const getDatabase = () => {
    if (!fs.existsSync(dbFile)) {
        // Cria o arquivo db.json se não existir
        fs.writeFileSync(dbFile, JSON.stringify({ users: [] }, null, 2));
    }
    // Lê e retorna os dados do arquivo
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
};

// Função para salvar dados no banco de dados
const saveDatabase = (data) => {
    // Escreve os dados fornecidos no arquivo db.json
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

// Rota base para redirecionar para 'HomePage.html'
app.get('/', (req, res) => {
    res.redirect('/paginasIniciais/HomePage.html');
});

// Rota para carregar 'HomePage.html'
app.get('/paginasIniciais/HomePage.html', (req, res) => {
    const filePath = path.join(__dirname, 'Sprint3', 'paginasIniciais', 'homePage.html');
    res.sendFile(filePath);
});

// Rota para registrar usuários
app.post('/users', (req, res) => {
    const { username, password } = req.body;

    // Valida a entrada do usuário
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    // Obtém os dados do banco
    const db = getDatabase();
    const userExists = db.users.some(user => user.username === username);

    // Verifica se o usuário já existe
    if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe.' });
    }

    // Adiciona o novo usuário e salva os dados
    db.users.push({ username, password });
    saveDatabase(db);

    res.status(201).json({ message: 'Usuário registrado com sucesso!', username });
});

// Inicializa o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
