"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./Providers";

// Busca dados da API com o token do usuário logado
export function useFetch(caminho) {
  const { token } = useAuth();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!token || !caminho) return;
    try { setDados(await api(caminho, { token })); setErro(""); }
    catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }, [token, caminho]);

  useEffect(() => { recarregar(); }, [recarregar]);
  return { dados, setDados, erro, carregando, recarregar };
}
