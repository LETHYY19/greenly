const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { statusMqtt } = require('./mqtt');
const { naoEncontrada, tratarErros } = require('./middleware/erros');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', mqtt: statusMqtt() }));
app.use('/api', routes);

// por último: rota inexistente e tratamento de erros
app.use(naoEncontrada);
app.use(tratarErros);

module.exports = { app };
