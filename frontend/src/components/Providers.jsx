"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { api } from "../lib/api";

/* ============================ TEMA ============================ */
const ThemeCtx = createContext({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // lê o que o script do <head> já aplicou no <html>
  useEffect(() => {
    // lê o tema que o script do <head> já aplicou (só existe no navegador)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((atual) => {
      const novo = atual === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", novo === "dark");
      try { localStorage.setItem("greenly-theme", novo); } catch {}
      return novo;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

/* ============================ LOGIN ============================ */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
const CHAVE = "greenly-auth";

function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || sessionStorage.getItem(CHAVE) || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (salvo?.token) setSessao(salvo);
    } catch {}
    setPronto(true);
  }, []);

  // se o servidor disser que a sessão venceu (ex.: banco reiniciado), sai e volta ao login
  useEffect(() => {
    const expirou = () => {
      setSessao(null);
      try { localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE); } catch {}
    };
    window.addEventListener("greenly:sessao-expirada", expirou);
    return () => window.removeEventListener("greenly:sessao-expirada", expirou);
  }, []);

  const login = useCallback(async (email, senha, perfil, lembrar = true) => {
    const data = await api("/auth/login", { method: "POST", body: { email, senha, perfil } });
    const nova = { token: data.token, usuario: data.usuario };
    setSessao(nova);
    try {
      localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE);
      (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(nova));
    } catch {}
    return data.usuario;
  }, []);

  const logout = useCallback(async () => {
    const t = sessao?.token;
    setSessao(null);
    try { localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE); } catch {}
    if (t) api("/auth/logout", { method: "POST", token: t }).catch(() => {});
  }, [sessao]);

  const valor = useMemo(() => ({ sessao, usuario: sessao?.usuario || null, token: sessao?.token || null, pronto, login, logout }), [sessao, pronto, login, logout]);
  return <AuthCtx.Provider value={valor}>{children}</AuthCtx.Provider>;
}

/* ============================ TOASTS ============================ */
const ToastCtx = createContext({ ok: () => {}, erro: () => {} });
export const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }) {
  const [itens, setItens] = useState([]);
  const remover = useCallback((id) => setItens((l) => l.filter((t) => t.id !== id)), []);
  const add = useCallback((tipo, texto) => {
    const id = Math.random().toString(36).slice(2);
    setItens((l) => [...l, { id, tipo, texto }]);
    setTimeout(() => remover(id), 4500);
  }, [remover]);
  const valor = useMemo(() => ({ ok: (t) => add("ok", t), erro: (t) => add("erro", t) }), [add]);

  return (
    <ToastCtx.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-3" aria-live="polite">
        {itens.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)]" style={{ animation: "toast-in .3s ease both" }}>
            {t.tipo === "ok" ? <CheckCircle2 className="mt-0.5 shrink-0 text-ok" size={20} /> : <AlertTriangle className="mt-0.5 shrink-0 text-bad" size={20} />}
            <p className="flex-1 text-sm font-semibold text-ink">{t.texto}</p>
            <button onClick={() => remover(t.id)} className="text-ink-2 hover:text-ink" aria-label="Fechar"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
