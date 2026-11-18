"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Busca as leituras dos sensores de uma estufa e atualiza sozinho
export function useLeituras(estufaId, token, intervalo = 30000) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!estufaId || !token) { setDados(null); return; }
    let vivo = true;
    setCarregando(true);
    const buscar = async () => {
      try {
        const d = await api(`/estufas/${estufaId}/leituras`, { token });
        if (vivo) { setDados(d); setErro(""); }
      } catch (e) { if (vivo) setErro(e.message); }
      finally { if (vivo) setCarregando(false); }
    };
    buscar();
    const t = setInterval(buscar, intervalo);
    return () => { vivo = false; clearInterval(t); };
  }, [estufaId, token, intervalo]);

  return { dados, erro, carregando };
}
