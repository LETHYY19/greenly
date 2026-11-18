"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./Providers";

const Ctx = createContext({ lista: [], naoLidas: 0, carregando: true, marcarLida: async () => {}, marcarTodas: async () => {}, recarregar: async () => {} });
export const useNotificacoes = () => useContext(Ctx);

// Busca as notificações do usuário logado e atualiza sozinho a cada 20s
export function NotificationsProvider({ children }) {
  const { token } = useAuth();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!token) return;
    try {
      setLista(await api("/notificacoes", { token }));
    } catch {}
    setCarregando(false);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
    const t = setInterval(recarregar, 20000);
    return () => clearInterval(t);
  }, [recarregar]);

  const marcarLida = useCallback(async (id) => {
    setLista((l) => l.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    try { await api(`/notificacoes/${id}/lida`, { method: "PATCH", token }); } catch { recarregar(); }
  }, [token, recarregar]);

  const marcarTodas = useCallback(async () => {
    setLista((l) => l.map((n) => ({ ...n, lida: true })));
    try { await api("/notificacoes/lidas", { method: "PATCH", token }); } catch { recarregar(); }
  }, [token, recarregar]);

  const valor = useMemo(() => ({ lista, naoLidas: lista.filter((n) => !n.lida).length, carregando, marcarLida, marcarTodas, recarregar }), [lista, carregando, marcarLida, marcarTodas, recarregar]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
