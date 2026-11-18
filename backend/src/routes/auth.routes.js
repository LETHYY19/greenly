const { Router } = require('express');
const c = require('../controllers/auth.controller');
const { autenticar } = require('../middleware/auth');

const router = Router();
router.post('/login', c.login);
router.post('/logout', autenticar, c.logout);
router.get('/me', autenticar, c.me);

module.exports = router;
