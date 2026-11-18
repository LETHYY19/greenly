const { Router } = require('express');
const c = require('../controllers/resumo.controller');
const { autenticar, soAdmin } = require('../middleware/auth');

const router = Router();
router.get('/', autenticar, soAdmin, c.resumo);

module.exports = router;
