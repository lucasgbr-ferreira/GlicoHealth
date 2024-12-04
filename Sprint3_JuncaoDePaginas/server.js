const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.get('/api/db', (req, res) => {
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o banco de dados.');
        }
        res.json(JSON.parse(data));
    });
});
app.post('/api/db', (req, res) => {
    const newData = req.body;

    fs.writeFile('db.json', JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Erro ao salvar os dados.');
        }
        res.status(200).send('Dados salvos com sucesso!');
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
