"use client";

/* Banners do painel do administrador: um por página, estrutura uniforme e ilustrações 100% SVG em vetor */

function Pessoa({ cx, topo, w, cabeca, cor, escura }) {
  return (
    <g>
      <path d={`M${cx - w} 200 C${cx - w} ${topo + 34}, ${cx - w / 2} ${topo}, ${cx} ${topo} S${cx + w} ${topo + 34}, ${cx + w} 200 Z`} fill={cor} />
      <circle cx={cx} cy={topo - cabeca - 4} r={cabeca} fill={cor} />
      <circle cx={cx} cy={topo - cabeca - 4} r={cabeca} fill={escura} opacity=".12" />
      <path d={`M${cx - w * 0.45} 200 C${cx - w * 0.45} ${topo + 50}, ${cx - 6} ${topo + 18}, ${cx} ${topo + 18} S${cx + w * 0.45} ${topo + 50}, ${cx + w * 0.45} 200 Z`} fill="#FEFAE0" opacity=".22" />
    </g>
  );
}

function ArteColaboradores() {
  return (
    <svg viewBox="0 0 460 200" className="h-full w-full" preserveAspectRatio="xMaxYMax slice" aria-hidden>
      <circle cx="350" cy="30" r="100" fill="#A7C957" opacity=".14" />
      <circle cx="440" cy="170" r="80" fill="#DDA15E" opacity=".18" />
      <circle cx="170" cy="190" r="60" fill="#4FA3A5" opacity=".16" />
      <g fill="#A7C957" opacity=".7"><path d="M96 196c-8-34 10-60 44-66 5 34-10 60-44 66z" /><path d="M52 150c12-24 38-33 60-24-7 24-33 35-60 24z" /></g>
      <Pessoa cx={224} topo={140} w={46} cabeca={17} cor="#A7C957" escura="#283618" />
      <Pessoa cx={312} topo={102} w={60} cabeca={24} cor="#DDA15E" escura="#283618" />
      <Pessoa cx={402} topo={134} w={48} cabeca={18} cor="#4FA3A5" escura="#283618" />
      <g fill="#FEFAE0" opacity=".85"><circle cx="262" cy="46" r="3" /><circle cx="368" cy="62" r="2.5" /><circle cx="440" cy="92" r="3" /><circle cx="196" cy="84" r="2.5" /></g>
    </svg>
  );
}

function ArteEmpresas() {
  const caixa = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="92" height="56" rx="7" fill="#DDA15E" />
      <rect x={x} y={y} width="92" height="14" rx="7" fill="#C98A3F" />
      <g stroke="#9A5A1B" strokeWidth="2.5" strokeLinecap="round" opacity=".7"><path d={`M${x + 8} ${y + 28}H${x + 84}M${x + 8} ${y + 42}H${x + 84}`} /></g>
    </g>
  );
  return (
    <svg viewBox="0 0 460 200" className="h-full w-full" preserveAspectRatio="xMaxYMax slice" aria-hidden>
      <circle cx="390" cy="40" r="95" fill="#FEFAE0" opacity=".08" />
      {caixa(240, 142)}{caixa(338, 142)}{caixa(289, 88)}
      <g>
        <circle cx="318" cy="70" r="17" fill="#F28C1C" /><circle cx="346" cy="76" r="14" fill="#F5A23C" /><circle cx="296" cy="78" r="12" fill="#E8751A" />
        <g fill="#6A3FA0"><circle cx="268" cy="132" r="9" /><circle cx="284" cy="128" r="9" /><circle cx="276" cy="144" r="9" /></g>
        <circle cx="372" cy="132" r="13" fill="#DD3329" /><circle cx="396" cy="136" r="11" fill="#E8483C" />
      </g>
      <g transform="translate(386 36) rotate(8)">
        <rect width="62" height="44" rx="7" fill="#FEFAE0" />
        <circle cx="12" cy="12" r="4" fill="#BC6C25" />
        <path d="M22 12H52M10 26H52M10 35H40" stroke="#9A5A1B" strokeWidth="3" strokeLinecap="round" opacity=".65" />
      </g>
    </svg>
  );
}

function ArteInicio() {
  return (
    <svg viewBox="0 0 500 200" className="h-full w-full" preserveAspectRatio="xMaxYMid slice" aria-hidden>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Sol com brilho suave e nuvem */}
      <circle cx="430" cy="40" r="42" fill="url(#sunGlow)" />
      <circle cx="430" cy="40" r="19" fill="#FBBF24" />
      <path d="M440 52 h34 a9 9 0 0 0 0 -18 a13 13 0 0 0 -24 -3 a10 10 0 0 0 -10 21 z" fill="#FFFFFF" opacity=".82" />

      {/* Folhagens orgânicas de fundo */}
      <circle cx="340" cy="180" r="105" fill="#A7C957" opacity=".12" />
      <path d="M160 200 C175 130 225 105 275 118 C265 158 225 194 160 200 Z" fill="#A7C957" opacity=".4" />
      <path d="M205 200 C225 125 295 90 355 108 C335 158 275 194 205 200 Z" fill="#606C38" opacity=".45" />

      {/* Estufa de vidro geométrica */}
      <polygon points="230,105 305,62 380,105 380,188 230,188" fill="rgba(255,255,255,0.14)" />
      <polygon points="265,105 305,62 335,62 285,105" fill="rgba(255,255,255,0.22)" />
      <polyline points="230,188 230,105 305,62 380,105 380,188" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="230" y1="105" x2="380" y2="105" stroke="#FFFFFF" strokeWidth="2.5" />
      <line x1="305" y1="62" x2="305" y2="105" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="267" y1="105" x2="267" y2="188" stroke="#FFFFFF" strokeWidth="2" strokeOpacity=".85" />
      <line x1="305" y1="105" x2="305" y2="188" stroke="#FFFFFF" strokeWidth="2.2" strokeOpacity=".9" />
      <line x1="343" y1="105" x2="343" y2="188" stroke="#FFFFFF" strokeWidth="2" strokeOpacity=".85" />
      <rect x="238" y="160" width="134" height="6" rx="2" fill="#DDA15E" opacity=".85" />
      {/* Plantas e frutos dentro da estufa */}
      <circle cx="253" cy="147" r="10" fill="#4C7A34" /><circle cx="254" cy="149" r="2.8" fill="#E63946" />
      <circle cx="274" cy="143" r="12" fill="#A7C957" /><circle cx="276" cy="146" r="3.2" fill="#E63946" />
      <circle cx="297" cy="141" r="12" fill="#4C7A34" /><circle cx="299" cy="144" r="3" fill="#F4A261" />
      <circle cx="320" cy="143" r="12" fill="#A7C957" /><circle cx="322" cy="146" r="3.2" fill="#E63946" />
      <circle cx="343" cy="142" r="11" fill="#4C7A34" /><circle cx="344" cy="145" r="2.8" fill="#F4A261" />
      <circle cx="363" cy="147" r="9" fill="#A7C957" />

      {/* Cartão de tecnologia/indicadores à direita */}
      <g transform="translate(396, 78)">
        <rect width="92" height="74" rx="12" fill="#FFFFFF" fillOpacity=".94" />
        <rect x="12" y="14" width="26" height="26" rx="7" fill="#E8F4D9" />
        <path d="M25 33 C25 24 32 20 35 20 C35 27 30 33 25 33 Z" fill="#4C7A34" />
        <path d="M25 33 C25 26 19 23 16 24 C16 29 21 33 25 33 Z" fill="#88B840" />
        <rect x="48" y="28" width="8" height="18" rx="2.5" fill="#CFE4AE" />
        <rect x="60" y="21" width="8" height="25" rx="2.5" fill="#88B840" />
        <rect x="72" y="14" width="8" height="32" rx="2.5" fill="#4C7A34" />
        <line x1="12" y1="52" x2="80" y2="52" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="60" x2="54" y2="60" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Folhagens de destaque em primeiro plano */}
      <path d="M430 200 C445 160 480 145 510 155 C500 185 470 200 430 200 Z" fill="#A7C957" opacity=".7" />
      <path d="M465 200 C475 170 500 160 520 165 C515 190 495 200 465 200 Z" fill="#606C38" opacity=".8" />
    </svg>
  );
}

function ArteEstufas() {
  return (
    <svg viewBox="0 0 500 200" className="h-full w-full" preserveAspectRatio="xMaxYMid slice" aria-hidden>
      {/* Folhagens de fundo */}
      <circle cx="340" cy="180" r="105" fill="#2A9D8F" opacity=".18" />
      <path d="M150 200 C165 125 215 100 265 115 C255 155 215 192 150 200 Z" fill="#52B788" opacity=".35" />
      <path d="M195 200 C215 120 285 85 345 105 C325 155 265 192 195 200 Z" fill="#1B4944" opacity=".5" />

      {/* Ondas de sinal Wi-Fi acima da estufa */}
      <g stroke="#FFFFFF" fill="none" strokeWidth="2.8" strokeLinecap="round">
        <path d="M430 25 A24 24 0 0 1 470 25" opacity=".95" />
        <path d="M437 33 A15 15 0 0 1 463 33" opacity=".95" />
        <circle cx="450" cy="41" r="2.5" fill="#FFFFFF" />
      </g>

      {/* Estufa de vidro */}
      <polygon points="215,108 285,65 355,108 355,188 215,188" fill="rgba(255,255,255,0.15)" />
      <polygon points="248,108 285,65 313,65 268,108" fill="rgba(255,255,255,0.22)" />
      <polyline points="215,188 215,108 285,65 355,108 355,188" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="215" y1="108" x2="355" y2="108" stroke="#FFFFFF" strokeWidth="2.5" />
      <line x1="285" y1="65" x2="285" y2="108" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="250" y1="108" x2="250" y2="188" stroke="#FFFFFF" strokeWidth="2" strokeOpacity=".85" />
      <line x1="285" y1="108" x2="285" y2="188" stroke="#FFFFFF" strokeWidth="2.2" strokeOpacity=".9" />
      <line x1="320" y1="108" x2="320" y2="188" stroke="#FFFFFF" strokeWidth="2" strokeOpacity=".85" />
      <rect x="222" y="160" width="126" height="6" rx="2" fill="#DDA15E" opacity=".85" />
      {/* Plantas internas */}
      <circle cx="237" cy="147" r="10" fill="#4C7A34" /><circle cx="238" cy="149" r="2.8" fill="#E63946" />
      <circle cx="256" cy="143" r="11" fill="#74C69D" /><circle cx="258" cy="146" r="3.2" fill="#E63946" />
      <circle cx="277" cy="141" r="12" fill="#4C7A34" /><circle cx="279" cy="144" r="3" fill="#F4A261" />
      <circle cx="298" cy="143" r="12" fill="#74C69D" /><circle cx="300" cy="146" r="3.2" fill="#E63946" />
      <circle cx="319" cy="142" r="11" fill="#4C7A34" /><circle cx="320" cy="145" r="2.8" fill="#F4A261" />
      <circle cx="338" cy="147" r="9" fill="#74C69D" />

      {/* Cartão de Sensores Flutuante */}
      <g transform="translate(390, 52)">
        <rect width="98" height="114" rx="14" fill="#FFFFFF" fillOpacity=".95" />
        {/* Linha 1: Temperatura 22°C */}
        <g transform="translate(14, 22)">
          <path d="M6 13a3.5 3.5 0 1 0 5 0V4a2.5 2.5 0 0 0-5 0v9z" fill="#E76F51" opacity=".2" />
          <path d="M8.5 1a1.5 1.5 0 0 0-1.5 1.5v8.1a3 3 0 1 0 3 0V2.5A1.5 1.5 0 0 0 8.5 1zm0 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#E76F51" />
          <text x="22" y="13" fill="#1C402E" fontSize="12" fontWeight="800" fontFamily="sans-serif">22°C</text>
        </g>
        {/* Linha 2: Umidade 68% */}
        <g transform="translate(14, 56)">
          <path d="M8.5 2 C8.5 2 4 8 4 11 A4.5 4.5 0 0 0 13 11 C13 8 8.5 2 8.5 2 Z" fill="#2A9D8F" />
          <text x="22" y="13" fill="#1C402E" fontSize="12" fontWeight="800" fontFamily="sans-serif">68%</text>
        </g>
        {/* Linha 3: Luminosidade 85% */}
        <g transform="translate(14, 90)">
          <circle cx="8.5" cy="8.5" r="4" fill="#E9C46A" />
          <g stroke="#E9C46A" strokeWidth="1.6" strokeLinecap="round">
            <line x1="8.5" y1="1" x2="8.5" y2="3" /><line x1="8.5" y1="14" x2="8.5" y2="16" />
            <line x1="1" y1="8.5" x2="3" y2="8.5" /><line x1="14" y1="8.5" x2="16" y2="8.5" />
            <line x1="3.2" y1="3.2" x2="4.6" y2="4.6" /><line x1="12.4" y1="12.4" x2="13.8" y2="13.8" />
            <line x1="3.2" y1="13.8" x2="4.6" y2="12.4" /><line x1="12.4" y1="4.6" x2="13.8" y2="3.2" />
          </g>
          <text x="22" y="13" fill="#1C402E" fontSize="12" fontWeight="800" fontFamily="sans-serif">85%</text>
        </g>
      </g>

      {/* Folhagens tropicais na frente */}
      <path d="M430 200 C445 155 480 140 510 150 C500 185 470 200 430 200 Z" fill="#52B788" opacity=".7" />
      <path d="M465 200 C475 165 500 155 520 160 C515 190 495 200 465 200 Z" fill="#1B4944" opacity=".8" />
    </svg>
  );
}

function ArteNotificacoes() {
  return (
    <svg viewBox="0 0 520 200" className="h-full w-full" preserveAspectRatio="xMaxYMid slice" aria-hidden>
      {/* Brilho âmbar do sino */}
      <circle cx="280" cy="100" r="110" fill="#F4A261" opacity=".18" />
      <circle cx="280" cy="100" r="160" fill="#E9C46A" opacity=".1" />

      {/* Folhagens de fundo */}
      <path d="M160 200 C175 130 230 105 285 125 C265 168 215 195 160 200 Z" fill="#A7C957" opacity=".45" />
      <path d="M205 200 C225 120 295 90 355 110 C335 160 275 195 205 200 Z" fill="#4C7A34" opacity=".5" />

      {/* Sino dourado e ondas sonoras */}
      <g transform="translate(235, 38)">
        {/* Ondas de som no topo à esquerda */}
        <path d="M-8 32 A16 16 0 0 0 -5 50" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <path d="M-18 24 A26 26 0 0 0 -13 58" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" opacity=".7" />

        {/* Topo do sino */}
        <rect x="40" y="4" width="16" height="12" rx="4" fill="#D97706" />

        {/* Corpo do sino */}
        <path
          d="M48 14 C34 14 20 36 16 68 C13 80 4 88 0 90 C0 96 4 98 10 98 H86 C92 98 96 96 96 90 C92 88 83 80 80 68 C76 36 62 14 48 14 Z"
          fill="#FBBF24"
        />
        {/* Batente do sino */}
        <circle cx="48" cy="104" r="8" fill="#B45309" />
        {/* Brilho no reflexo do sino */}
        <path d="M32 28 C28 42 24 64 22 84" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".85" />

        {/* Badge vermelho com o número 1 */}
        <g transform="translate(76, 20)">
          <circle cx="12" cy="12" r="15" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
          <text x="12" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="sans-serif">1</text>
          {/* Raios de atenção */}
          <line x1="28" y1="4" x2="35" y2="0" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="12" x2="40" y2="12" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="20" x2="35" y2="24" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>

      {/* Cartões de notificação à direita */}
      <g transform="translate(355, 42)">
        {/* Card 1: Umidade */}
        <g>
          <rect width="150" height="48" rx="12" fill="#FFFFFF" fillOpacity=".96" />
          <rect x="10" y="9" width="30" height="30" rx="8" fill="#ECFDF5" />
          <path d="M25 32 C25 24 32 19 35 19 C35 26 30 32 25 32 Z" fill="#10B981" />
          <text x="48" y="23" fill="#1F2937" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">Solo com umidade baixa</text>
          <text x="48" y="35" fill="#6B7280" fontSize="8.5" fontWeight="500" fontFamily="sans-serif">08:24</text>
        </g>

        {/* Card 2: Temperatura */}
        <g transform="translate(0, 58)">
          <rect width="150" height="48" rx="12" fill="#FFFFFF" fillOpacity=".96" />
          <rect x="10" y="9" width="30" height="30" rx="8" fill="#FFFBEB" />
          <circle cx="25" cy="30" r="4.5" fill="#F59E0B" />
          <rect x="23" y="16" width="4" height="12" rx="2" fill="#F59E0B" />
          <text x="48" y="23" fill="#1F2937" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">Temperatura ideal</text>
          <text x="48" y="35" fill="#6B7280" fontSize="8.5" fontWeight="500" fontFamily="sans-serif">07:52</text>
        </g>
      </g>

      {/* Folhagens de primeiro plano */}
      <path d="M430 200 C445 160 480 145 510 155 C500 185 470 200 430 200 Z" fill="#A7C957" opacity=".7" />
      <path d="M465 200 C475 170 500 160 520 165 C515 190 495 200 465 200 Z" fill="#4C7A34" opacity=".8" />
    </svg>
  );
}

const CFG = {
  inicio: {
    arte: ArteInicio,
    fundo: "linear-gradient(115deg, #1b3822 0%, #295433 48%, #3e7046 100%)",
  },
  estufas: {
    arte: ArteEstufas,
    fundo: "linear-gradient(115deg, #0b4a44 0%, #11685e 48%, #1c887b 100%)",
  },
  notificacoes: {
    arte: ArteNotificacoes,
    fundo: "linear-gradient(115deg, #1c4524 0%, #3d6622 45%, #8a7019 100%)",
  },
  colaboradores: {
    arte: ArteColaboradores,
    fundo: "linear-gradient(115deg, #283618 0%, #3A4A20 52%, #5D6B33 100%)",
  },
  empresas: {
    arte: ArteEmpresas,
    fundo: "linear-gradient(115deg, #3B2510 0%, #74441A 52%, #A9631F 100%)",
  },
};

export function AdminBanner({ variante = "inicio", imagem, tag, titulo, texto, children }) {
  // banner pronto (imagem): aparece inteiro, sem texto por cima
  if (imagem) {
    return (
      <header className="overflow-hidden rounded-3xl shadow-[var(--shadow)]">
        {titulo && <h1 className="sr-only">{titulo}</h1>}
        <img src={imagem} alt={titulo || "Banner Greenly"} className="block h-auto w-full" />
      </header>
    );
  }
  const c = CFG[variante] || CFG.inicio;
  const Arte = c.arte;
  return (
    <header className="relative isolate flex min-h-[184px] items-center overflow-hidden rounded-3xl text-cream shadow-[var(--shadow)]" style={{ background: c.fundo || "#283618" }}>
      {c.foto && (
        <>
          <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.foto})` }} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest/40" />
        </>
      )}
      {Arte && <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[54%] sm:block"><Arte /></div>}
      <div className="relative max-w-xl px-7 py-8 md:px-10">
        <p className="text-xs font-bold uppercase tracking-wider text-cream/70 sm:text-sm">{tag || "Painel do Administrador"}</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-[32px]">{titulo}</h1>
        {texto && <p className="mt-2 text-sm leading-relaxed text-cream/80 md:text-base">{texto}</p>}
        {children && <div className="mt-4 flex flex-wrap gap-3">{children}</div>}
      </div>
    </header>
  );
}
