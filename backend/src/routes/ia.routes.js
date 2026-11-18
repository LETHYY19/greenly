const { Router } = require('express');
const c = require('../controllers/ia.controller');
const { autenticar, soAdmin } = require('../middleware/auth');

const router = Router();
router.use(autenticar, soAdmin);
router.get('/status', c.status);
router.post('/testar', c.testar);
router.post('/analisar', c.analisar);
router.get('/estufas/:id', c.perfil);

module.exports = router;
