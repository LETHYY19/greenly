export const ETAPAS = ["Sementes", "Germinação", "Crescimento", "Floração", "Colheita"];

export const CULTURAS = ["Morango", "Uva", "Tomate", "Alface", "Ervas", "Laranja", "Feijão", "Amora"];

export const STATUS = {
  ideal: { rotulo: "Ideal", cor: "var(--ok)", classe: "bg-ok/15 text-ok" },
  atencao: { rotulo: "Atenção", cor: "var(--warn)", classe: "bg-warn/15 text-warn" },
  critico: { rotulo: "Crítico", cor: "var(--bad)", classe: "bg-bad/15 text-bad" },
};

export const SENSORES = {
  temperatura: { nome: "Temperatura", unidade: "°C", casas: 1 },
  umidadeAr: { nome: "Umidade do ar", unidade: "%", casas: 0 },
  umidadeSolo: { nome: "Umidade do solo", unidade: "%", casas: 0 },
  luminosidade: { nome: "Luminosidade", unidade: " lux", casas: 0 },
};

// Texto do status geral da estufa
export const STATUS_GERAL = {
  ideal: "Tudo funcionando bem",
  atencao: "Atenção necessária",
  critico: "Ação urgente necessária",
};
