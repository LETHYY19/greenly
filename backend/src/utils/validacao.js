// Funções pequenas de validação usadas pelos controllers
const ok = (v) => typeof v === 'string' && v.trim().length > 0;
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const emailValido = (v) => /^\S+@\S+\.\S+$/.test(v);

module.exports = { ok, num, emailValido };
