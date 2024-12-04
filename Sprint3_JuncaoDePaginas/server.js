const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());  // Configura o CORS
app.use(bodyParser.json());  // Configura o middleware para aceitar JSON

// Endpoint GET para retornar os dados
app.get('/api/db', (req, res) => {
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o banco de dados.');
        }
        res.json(JSON.parse(data));  // Retorna o JSON do arquivo db.json
    });
});

// Endpoint POST para salvar dados
app.post('/api/db', (req, res) => {
    const newData = req.body;

    // Lê o arquivo db.json e manipula os dados
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o banco de dados.');
        }

        let db = JSON.parse(data);  // Converte os dados lidos em JSON

        // Adiciona os dados recebidos ao array de "Pacientes"
        if (!db.Usuários) {
            db.Usuários = {};  // Caso não exista a chave "Usuários", cria uma
        }
        if (!db.Usuários.Pacientes) {
            db.Usuários.Pacientes = [];  // Caso não exista a chave "Pacientes", cria um array vazio
        }

        // Adiciona os novos dados ao array de "Pacientes"
        db.Usuários.Pacientes.push(newData);

        // Salva os dados atualizados no arquivo db.json
        fs.writeFile('db.json', JSON.stringify(db, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar os dados.');
            }
            res.status(200).send('Dados salvos com sucesso!');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
