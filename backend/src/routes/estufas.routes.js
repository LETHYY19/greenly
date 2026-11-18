const { Router } = require('express');
const c = require('../controllers/estufas.controller');
const { autenticar, soAdmin } = require('../middleware/auth');

const router = Router();
router.use(autenticar);
router.get('/', c.listar);
router.get('/:id', c.buscar);
router.get('/:id/leituras', c.lerSensores);
router.post('/', soAdmin, c.criar);
router.put('/:id', soAdmin, c.atualizar);
router.delete('/:id', soAdmin, c.remover);

module.exports = router;
