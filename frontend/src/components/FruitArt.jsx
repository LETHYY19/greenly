// Ilustrações vetoriais das culturas (nítidas em qualquer tamanho)
const norm = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function chaveCultura(s) {
  const n = norm(s);
  if (n.includes("morango")) return "morango";
  if (n.includes("uva")) return "uva";
  if (n.includes("tomate")) return "tomate";
  if (n.includes("alface")) return "alface";
  if (n.includes("erva")) return "ervas";
  if (n.includes("laranja")) return "laranja";
  if (n.includes("feij")) return "feijao";
  if (n.includes("amora")) return "amora";
  return "folha";
}

const FUNDOS = {
  morango: ["#FFD9D4", "#F4A9A0"],
  uva: ["#E4D9F3", "#BFA9E0"],
  tomate: ["#FFD9CF", "#F2A48F"],
  alface: ["#DDF0BF", "#B3D98A"],
  ervas: ["#D4EDC9", "#9FD08F"],
  laranja: ["#FFE6BE", "#F7BF72"],
  feijao: ["#EBE3C6", "#D3C58B"],
  amora: ["#E1D4EE", "#B79BD1"],
  folha: ["#DDF0BF", "#B3D98A"],
};

// cores de apoio de cada cultura (para fundos e etiquetas coloridas)
export const tomCultura = (nome) => { const [a, b] = FUNDOS[chaveCultura(nome)]; return { fundo: a, borda: b }; };

const Arte = {
  morango: (
    <g>
      <path d="M32 20c-12 0-19 8-17 18 2 9 10 17 17 20 7-3 15-11 17-20 2-10-5-18-17-18z" fill="#E03A3E" />
      <path d="M32 20c-12 0-19 8-17 18 1 3 2 6 4 9 6-14 16-22 30-24-4-2-10-3-17-3z" fill="#F0585B" opacity=".55" />
      <g fill="#FFE9A8"><ellipse cx="24" cy="32" rx="1.3" ry="2" /><ellipse cx="32" cy="30" rx="1.3" ry="2" /><ellipse cx="40" cy="32" rx="1.3" ry="2" /><ellipse cx="27" cy="40" rx="1.3" ry="2" /><ellipse cx="37" cy="40" rx="1.3" ry="2" /><ellipse cx="32" cy="48" rx="1.3" ry="2" /></g>
      <path d="M32 21l-9-6 5 1-3-6 7 4 2-5 2 5 7-4-3 6 5-1z" fill="#3E8E3E" />
    </g>
  ),
  uva: (
    <g>
      <path d="M32 10c2-3 6-4 9-3-1 3-4 5-8 5z" fill="#4C8A3A" />
      <path d="M31 12v8" stroke="#6B4A2B" strokeWidth="2" strokeLinecap="round" />
      <g fill="#6A3FA0">
        {[[22, 24], [32, 24], [42, 24], [27, 33], [37, 33], [22, 33], [42, 33], [32, 42], [27, 50], [37, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6.5" />)}
      </g>
      <g fill="#fff" opacity=".35">{[[20, 22], [30, 22], [40, 22], [25, 31], [35, 31], [30, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" />)}</g>
    </g>
  ),
  tomate: (
    <g>
      <ellipse cx="32" cy="36" rx="21" ry="19" fill="#DD3329" />
      <ellipse cx="25" cy="29" rx="8" ry="5" fill="#fff" opacity=".28" transform="rotate(-25 25 29)" />
      <path d="M32 18l-8-5 4 6-8 0 8 5-3 6 7-4 7 4-3-6 8-5-8 0 4-6z" fill="#3E8E3E" />
    </g>
  ),
  alface: (
    <g>
      <circle cx="32" cy="36" r="21" fill="#7DB93F" />
      <path d="M32 36c-10 0-16-8-13-16 6 0 13 5 13 16zm0 0c10 0 16-8 13-16-6 0-13 5-13 16z" fill="#97CB57" />
      <path d="M32 36c-7 4-16 3-19-4 6-3 15-1 19 4zm0 0c7 4 16 3 19-4-6-3-15-1-19 4z" fill="#5E9E2C" />
      <path d="M32 36v18M32 36c-4-5-5-11-3-16" stroke="#E8F5C8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  ervas: (
    <g>
      <g stroke="#3E7A2A" strokeWidth="2" strokeLinecap="round"><path d="M32 56V26M32 46c-8-2-13-8-14-14M32 40c7-2 11-7 13-13" fill="none" /></g>
      <path d="M32 26c-8-4-9-13-2-18 7 4 8 13 2 18z" fill="#6DB33F" />
      <path d="M18 32c-1-9 6-14 13-12-1 8-6 13-13 12z" fill="#8CC84B" />
      <path d="M45 27c1-8-5-13-12-11 1 7 5 12 12 11z" fill="#5CA131" />
    </g>
  ),
  laranja: (
    <g>
      <circle cx="32" cy="37" r="20" fill="#F28C1C" />
      <ellipse cx="25" cy="30" rx="8" ry="5" fill="#fff" opacity=".28" transform="rotate(-30 25 30)" />
      <g fill="#C86A0C" opacity=".5">{[[24, 40], [34, 44], [40, 34], [30, 36], [38, 46], [22, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".9" />)}</g>
      <path d="M32 17c1-4 5-7 10-7 0 5-4 8-10 7z" fill="#3E8E3E" />
      <path d="M32 17v4" stroke="#6B4A2B" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  feijao: (
    <g>
      <path d="M14 46c-4-12 4-30 22-34 8-2 14 2 12 8-2 8-8 12-14 18-6 6-14 14-20 8z" fill="#9C6B3C" />
      <path d="M18 44c-2-9 5-23 19-27" stroke="#C8965E" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
      <circle cx="30" cy="34" r="4" fill="#C8965E" /><circle cx="39" cy="26" r="3.5" fill="#C8965E" /><circle cx="22" cy="41" r="3.2" fill="#C8965E" />
    </g>
  ),
  amora: (
    <g>
      <path d="M32 12c4-3 9-3 12 0-4 3-9 4-12 0z" fill="#3E8E3E" />
      <g fill="#3D1F56">{[[24, 26], [34, 24], [44, 28], [28, 35], [38, 35], [22, 36], [46, 38], [32, 45], [42, 46]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" />)}</g>
      <g fill="#fff" opacity=".3">{[[22, 24], [32, 22], [42, 26], [26, 33], [36, 33]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" />)}</g>
    </g>
  ),
  folha: (
    <path d="M14 48C12 28 26 14 50 14c0 22-12 34-30 34zM14 48c8-10 16-17 28-24" fill="#6DB33F" stroke="#3E7A2A" strokeWidth="2" strokeLinejoin="round" />
  ),
};

export function FruitArt({ nome, size = 56, fundo = true, className = "" }) {
  const k = chaveCultura(nome);
  const [a, b] = FUNDOS[k];
  const id = `fg-${k}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label={nome}>
      {fundo && (
        <>
          <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
          <rect width="64" height="64" rx="18" fill={`url(#${id})`} />
        </>
      )}
      <g transform={fundo ? "translate(5.6 5.6) scale(.825)" : undefined}>{Arte[k]}</g>
    </svg>
  );
}
