// Orientações mostradas quando algum fator da estufa não está ideal
export const DICAS = {
  temperatura: { baixo: "Verifique o fechamento da estufa e o aquecimento.", alto: "Abra a ventilação ou acione o ventilador para renovar o ar." },
  umidadeAr: { baixo: "Aumente a umidificação do ambiente.", alto: "Melhore a ventilação para evitar fungos." },
  umidadeSolo: { baixo: "Verifique se a irrigação está funcionando corretamente.", alto: "Reduza a irrigação para evitar encharcamento." },
  luminosidade: { baixo: "Verifique sombreamento excessivo ou use iluminação complementar.", alto: "Considere usar tela de sombreamento." },
};

// Transforma as leituras em uma lista de "o que está fora do ideal"
export function montarProblemas(dados) {
  if (!dados) return [];
  return dados.problemas.map((chave) => {
    const sensor = dados.sensores[chave];
    const dir = sensor.valor < sensor.min ? "baixo" : "alto";
    return { chave, sensor, dir, dica: DICAS[chave][dir] };
  });
}
