const { Router } = require('express');
const c = require('../controllers/colaboradores.controller');
const { autenticar, soAdmin } = require('../middleware/auth');

const router = Router();
router.use(autenticar, soAdmin);
router.get('/', c.listar);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.remover);

module.exports = router;
