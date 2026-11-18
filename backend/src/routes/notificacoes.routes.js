const { Router } = require('express');
const c = require('../controllers/notificacoes.controller');
const { autenticar, soAdmin } = require('../middleware/auth');

const router = Router();
router.use(autenticar);
router.get('/', c.listar);
router.post('/', soAdmin, c.criar);
router.patch('/lidas', c.marcarTodasLidas); // precisa vir antes de "/:id/lida"
router.patch('/:id/lida', c.marcarLida);
router.delete('/:id', soAdmin, c.remover);

module.exports = router;
