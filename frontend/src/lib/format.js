export function tempoRelativo(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.round(h / 24)}d`;
}
export const primeiroNome = (n = "") => n.trim().split(" ")[0] || "";
export const cn = (...c) => c.filter(Boolean).join(" ");
export const fmt = (n) => Number(n).toLocaleString("pt-BR");
