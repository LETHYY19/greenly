// Cliente simples da API (fetch). A URL pode ser trocada em .env.local:
// NEXT_PUBLIC_API_URL=http://localhost:8080
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  // login vencido/inválido: o site volta para a tela de login sozinho
  if (res.status === 401 && token && typeof window !== "undefined") window.dispatchEvent(new Event("greenly:sessao-expirada"));
  if (!res.ok) {
    const err = new Error(data.message || "Algo deu errado. Tente novamente.");
    err.status = res.status;
    throw err;
  }
  return data;
}
