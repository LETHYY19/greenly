"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./Providers";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const escuro = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={escuro}
      title={escuro ? "Modo claro" : "Modo escuro"}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 transition hover:bg-soft hover:text-ink"
    >
      <Sun size={20} className={`absolute transition-all duration-300 ${escuro ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon size={20} className={`absolute transition-all duration-300 ${escuro ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  );
}
