"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Building2, Home, Sprout, Users } from "lucide-react";
import { Shell } from "./Shell";

const ITENS = [
  { id: "inicio", rotulo: "Início", icone: Home, href: "/admin" },
  { id: "colaboradores", rotulo: "Colaboradores", icone: Users, href: "/admin/colaboradores" },
  { id: "estufas", rotulo: "Estufas", icone: Sprout, href: "/admin/estufas" },
  { id: "notificacoes", rotulo: "Notificações", icone: Bell, href: "/admin/notificacoes" },
  { id: "empresas", rotulo: "Empresas", icone: Building2, href: "/admin/empresas" },
];

export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const ativo = pathname === "/admin" ? "inicio" : ITENS.find((i) => i.id !== "inicio" && pathname.startsWith(i.href))?.id;
  return (
    <Shell perfil="admin" itens={ITENS} ativo={ativo} verTodas={() => router.push("/admin/notificacoes")} avisos={false}>
      <div className="mx-auto max-w-[1180px] space-y-8 px-4 py-8 md:px-8 md:py-10">{children}</div>
    </Shell>
  );
}
