import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "Greenly — A evolução do cultivo começa aqui",
  description: "Plataforma inteligente de monitoramento e gerenciamento de estufas.",
  icons: { icon: "/images/logo-mark.png" },
};

// Aplica o tema salvo ANTES da página aparecer (evita "piscar" claro/escuro)
const themeScript = `(function(){try{var t=localStorage.getItem('greenly-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
