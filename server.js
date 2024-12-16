const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Importa a função exec para rodar comandos

const app = express();
const PORT = 3001; // Express rodando na porta 3001
const dbFile = path.join(__dirname, 'db.json');

// Middleware para processar JSON
app.use(bodyParser.json());

// Middleware para servir arquivos estáticos de todas as pastas dentro de 'Sprint3'
app.use(express.static(path.join(__dirname, 'Sprint3')));

// Função para obter dados do banco de dados
const getDatabase = () => {
    if (!fs.existsSync(dbFile)) {
        fs.writeFileSync(dbFile, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
};

// Função para salvar dados no banco de dados
const saveDatabase = (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

// Rota base para redirecionar para 'paginasIniciais/HomePage.html'
app.get('/', (req, res) => {
    res.redirect('/paginasIniciais/HomePage.html');
});

// Rota para carregar especificamente 'HomePage.html' de 'paginasIniciais'
app.get('/paginasIniciais/HomePage.html', (req, res) => {
    const filePath = path.join(__dirname, 'Sprint3', 'paginasIniciais', 'HomePage.html');
    console.log('Caminho do arquivo:', filePath);
    res.sendFile(filePath);
});

// Rota para registrar usuários
app.post('/users', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const db = getDatabase();
    const userExists = db.users.some(user => user.username === username);

    if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe.' });
    }

    db.users.push({ username, password });
    saveDatabase(db);

    res.status(201).json({ message: 'Usuário registrado com sucesso!', username });
});

// Rodar o comando 'json-server --watch db.json' na porta 3000
const startJsonServer = () => {
    exec('json-server --watch db.json --port 3000', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar o json-server: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`json-server output: ${stdout}`);
    });
};

// Iniciar o servidor Express na porta 3001
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
    
    // Iniciar o json-server
    startJsonServer();
});
