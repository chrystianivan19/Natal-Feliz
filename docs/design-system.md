# Design system — NATAL FELIZ

Tokens em `src/app/globals.css` (`@theme` do Tailwind 4). Tudo parte do celular (360–414px).

## Cores e contraste (WCAG, sobre o papel `#FBF6EA`)

| Token | Cor | Contraste | Uso |
|---|---|---|---|
| `tinta` | `#2B2620` | 13.9 | texto principal |
| `tinta-suave` | `#5C5248` | 7.1 | texto secundário, menu inativo |
| `vermelho` | `#B3261E` | 6.1 | botão principal, carimbo, item ativo |
| `pinheiro` | `#1F4D3A` | 8.9 | destaques, foco |
| `dourado-escuro` | `#7A5E1E` | 5.7 | texto dourado (quando precisar) |
| `dourado` | `#B08D3C` | **2.9** | **só decoração** (selos, bordas, fitas), nunca texto |
| `papel` sobre `vermelho` | — | 6.1 | texto do botão principal |
| `papel` sobre `pinheiro` | — | 8.9 | texto de botão verde |

## Tipografia

- **Caveat** (manuscrita, 600/700): títulos, selos, carimbos. Nunca em parágrafo.
- **Source Serif 4**: corpo do texto, 17px, altura de linha igual à pauta (28px no celular, 32px no desktop).

## Caderno

- Pautas: `repeating-linear-gradient` no `body`, passo `--pauta`.
- Margem vermelha: `MargemCaderno`, a `--margem-x` (16px celular, 56px desktop). O conteúdo começa em `--recuo-conteudo`.
- Textura: ruído SVG inline (~0.4 KB).

## Vidro (liquid glass)

- `.vidro`: fundo branco 52%, `backdrop-filter: blur(--blur-vidro)` (6px celular, 14px desktop), borda clara com reflexo, sombra de papel.
- Sem suporte a `backdrop-filter` ou com `prefers-reduced-transparency`: papel opaco.
- `CardVidro` = informativo (sem hover, sem ponteiro). `CardVidroLink` = clicável (`.vidro-interativo`: hover sobe 2px, só em dispositivos com hover).

## Regras

- Proibido texto com gradiente.
- Hover, elevação e `cursor: pointer` só em elementos clicáveis.
- Alvos de toque ≥ 44px; menu inferior com 64px de altura.
- `prefers-reduced-motion` zera animações e transições.
- Foco visível: contorno verde-pinheiro de 3px.

## Componentes

| Componente | Arquivo | Uso |
|---|---|---|
| `MargemCaderno`, `Folha` | `components/papel/Caderno.tsx` | fundo e área de conteúdo |
| `Selo` | `components/papel/Selo.tsx` | datas e números (contadores) |
| `Carimbo` | `components/papel/Carimbo.tsx` | "Apadrinhada" |
| `Fita` | `components/papel/Fita.tsx` | fotos presas com fita |
| `Envelope` | `components/papel/Envelope.tsx` | tela de confirmação |
| `CardVidro`, `CardVidroLink` | `components/vidro/CardVidro.tsx` | cartões |
| `MenuInferior` | `components/navegacao/MenuInferior.tsx` | 5 itens; rodapé no celular, topo no desktop |
