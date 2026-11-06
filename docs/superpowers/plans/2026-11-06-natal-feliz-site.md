# NATAL FELIZ 2026 – Plano de execução

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar o site de adoção de cartinhas do NATAL FELIZ – 4ª Edição em `natalfeliz2026.vercel.app`, com adoção segura, painel de voluntários e conteúdo editável.

**Architecture:** Next.js 16 (App Router, Cache Components) na Vercel, lendo do Supabase. Páginas públicas em cache por tags; toda escrita (adoção, painel) passa por Server Actions que chamam funções/consultas do Supabase e revalidam as tags. Dados de padrinhos ficam atrás de RLS e só o painel autenticado os lê.

**Tech Stack:** Next.js 16.4 · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, pg_cron) · `@supabase/ssr` · zod · Resend · `qrcode` · `sharp` (no upload) · Vitest · Playwright · Remotion.

**Spec:** `docs/superpowers/specs/2026-11-06-natal-feliz-site-design.md`

## Global Constraints

- Next.js 16: antes de cada recurso do framework, ler o guia em `node_modules/next/dist/docs/`. `middleware.ts` agora é `proxy.ts`; cache via `'use cache'` + `cacheTag()`; invalidar com `revalidateTag()`/`updateTag()`.
- Mobile first: projetar e verificar a 360px e 414px antes do desktop.
- Dados públicos da criança: só `primeiro_nome`, `idade`, `genero`, `pedido`, `tamanho_roupa`, `tamanho_calcado`, imagem. Nunca nome em URL, caminho de arquivo, `alt` ou imagem OG.
- Dados de padrinhos nunca saem para o cliente público; a chave `service_role` só existe no servidor.
- Prazo de entrega `2026-12-23`; evento `2026-12-29T09:00:00-03:00` (padrão, editável); fuso `America/Sao_Paulo`.
- Pendente expira em 24h; máx. 3 pendentes por WhatsApp ou e-mail; máx. 10 tentativas por `ip_hash` por hora.
- Tokens: `--vermelho #B3261E`, `--pinheiro #1F4D3A`, `--dourado #B08D3C`, `--papel #FBF6EA`, `--tinta #2B2620`. Fontes: Caveat (títulos), Source Serif 4 (corpo).
- Proibido texto com gradiente. Hover/elevação/`cursor:pointer` só em clicáveis. `prefers-reduced-motion` e `prefers-reduced-transparency` respeitados. Alvos de toque ≥ 44px.
- Blur do vidro: 6px até 767px, 14px a partir de 768px.
- Copy: pt-BR, sem "transformando vidas", "fazer a diferença", "jornada", emojis decorativos, triplas de adjetivos; botões com verbo.
- Cada fase termina com: preview na Vercel, verificação a 360/414px, `superpowers:verification-before-completion`, `engineering:code-review`, e **aprovação do usuário antes da fase seguinte**.

## Review Focus

1. Duas pessoas tocam "Quero apadrinhar" na mesma cartinha no mesmo segundo → só uma recebe `ok`; a outra vê "acabou de ser escolhida". (Task 3, teste de concorrência)
2. WhatsApp digitado com espaços, parênteses, `+55` ou sem o 9 → normalizado para só dígitos com DDD, ou recusado com mensagem clara; o limite de 3 conta o mesmo número em qualquer formato. (Task 6, testes de `normalizarWhatsapp`)
3. CSV exportado do Google Sheets com BOM, `;` como separador, acentos e linhas vazias no fim → importa corretamente. (Task 9, testes do parser)
4. Chave Pix com acento no nome do recebedor ou cidade com mais de 15 caracteres → payload válido (sem acento, truncado conforme BR Code) e CRC correto. (Task 12, testes do Pix)
5. Cartinha muda de status enquanto o padrinho está com o formulário aberto (aprovada/expirada por outro) → envio retorna `indisponivel`, nada é gravado. (Task 3, teste de status ≠ disponível)

---

## Estrutura de arquivos

```
site-natal/
  supabase/
    migrations/0001_schema.sql        tabelas, enums, view pública
    migrations/0002_rls.sql           políticas RLS + função eh_voluntario()
    migrations/0003_adocao.sql        adotar_cartinha(), decidir_adocao(), expirar_pendentes() + pg_cron
    migrations/0004_storage.sql       buckets e políticas
    tests/adocao.test.ts              testes de banco (Vitest contra o projeto Supabase de dev)
  src/
    proxy.ts                          protege /painel
    lib/supabase/{server,admin,browser}.ts
    lib/dados/                        consultas com 'use cache' + cacheTag (uma por domínio)
      cartinhas.ts  conteudo.ts  contador.ts
    lib/adocao/{schema,normalizar,acoes}.ts
    lib/pix/{brcode,qr}.ts
    lib/importacao/{csv,conferir}.ts
    lib/email/aprovacao.ts
    lib/tempo/contagem.ts
    lib/imagem/otimizar.ts
    components/papel/                 Caderno, Selo, Fita, Carimbo, Envelope
    components/vidro/CardVidro.tsx
    components/navegacao/MenuInferior.tsx
    components/cartinhas/             Grade, CardCartinha, Filtros, Visualizador, FormAdocao
    components/home/                  Contador, Edicoes, Cronometro, BlocoPix, Video
    app/(site)/                       layout + page, cartinhas, cartinhas/[codigo], entrega, galeria, apoiar
    app/painel/                       login, pendentes (page), cartinhas, importar, padrinhos, conteudo/*, voluntarios, historico
    app/api/og/...                    imagens Open Graph
  remotion/                           projeto do vídeo (Task 15)
  tests/unit/  tests/e2e/
```

---

## Fase 0 – Fundação

**Entregável:** repositório no GitHub, deploy automático na Vercel, banco criado com schema, RLS e função de adoção testada; página "em construção" com o fundo de caderno e os tokens.
**Pronto quando:** `npm test` passa (incluindo concorrência), preview da Vercel abre a 360px com o caderno, push na `main` publica produção.

### Task 1: Repositório, Vercel e ferramentas de teste

**Files:** Create `.env.example`, `vitest.config.ts`, `playwright.config.ts`, `tests/unit/smoke.test.ts`; Modify `package.json` (scripts `test`, `test:e2e`, `typecheck`).

- [ ] Instalar `gh` via `winget install GitHub.cli`; usuário roda `gh auth login` (o agente não digita credenciais).
- [ ] Criar repositório privado `natalfeliz2026` com `gh repo create natalfeliz2026 --private --source . --push`.
- [ ] Criar projeto na Vercel `natalfeliz2026` conectado ao repositório (Vercel MCP `create_git_project`); confirmar que o domínio `natalfeliz2026.vercel.app` foi atribuído.
- [ ] Instalar `vitest`, `@playwright/test`; `playwright.config.ts` com projeto `mobile` (viewport 390×844, `isMobile: true`) e `desktop` (1280×800).
- [ ] `tests/unit/smoke.test.ts`: `expect(1 + 1).toBe(2)`; rodar `npm test` → PASS.
- [ ] Commit `chore: ferramentas de teste e deploy`; push; verificar deploy de produção `READY` pelo Vercel MCP.

### Task 2: Projeto Supabase e schema

**Files:** Create `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0004_storage.sql`, `src/lib/supabase/{server,admin,browser}.ts`, `src/types/db.ts` (gerado).

**Interfaces — Produces:** tabelas e view exatamente como na spec §3; `eh_voluntario() returns boolean` (verifica `auth.jwt()->>'email'` em `voluntarios` ativos); `createServerClient()` (cookies, anon key), `createAdminClient()` (service_role, só servidor), `createBrowserClient()`.

- [ ] Criar projeto Supabase `natalfeliz2026` na org existente, região `sa-east-1`, plano gratuito (confirmar custo zero com o usuário via `get_cost`/`confirm_cost`).
- [ ] Aplicar `0001_schema.sql`: enums `genero_t`, `status_cartinha_t`, `status_adocao_t`; tabelas da spec; `cartinhas.codigo` com `check (codigo ~ '^C\d{3,4}$')`; view `cartinhas_publicas` sem `observacoes` e `teste`.
- [ ] Aplicar `0002_rls.sql`: RLS ligado em todas as tabelas; `select` anônimo só nas tabelas públicas; `configuracoes` exposta por view `configuracoes_publicas`; tudo liberado para `eh_voluntario()`.
- [ ] Aplicar `0004_storage.sql`: buckets públicos `cartinhas`, `galeria`, `patrocinadores`; escrita só para `eh_voluntario()`.
- [ ] Inserir o e-mail do usuário em `voluntarios`.
- [ ] Gerar tipos (`generate_typescript_types`) em `src/types/db.ts`; rodar `get_advisors` (security) → sem alertas críticos.
- [ ] Variáveis na Vercel e em `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`.
- [ ] Commit `feat(db): schema, RLS e storage`.

### Task 3: Função de adoção, decisão e expiração (TDD)

**Files:** Create `supabase/migrations/0003_adocao.sql`, `supabase/tests/adocao.test.ts`, `supabase/tests/helpers.ts`.

**Interfaces — Produces:**
- `adotar_cartinha(p_codigo text, p_nome text, p_whatsapp text, p_email text, p_ip_hash text) returns text` — `'ok' | 'indisponivel' | 'limite' | 'nao_encontrada'`; `security definer`; executável por `anon`.
- `decidir_adocao(p_adocao_id uuid, p_acao text) returns text` — `p_acao in ('aprovar','recusar','cancelar')`; só `eh_voluntario()`; retorna `'ok' | 'estado_invalido'`; grava `decidido_em`, `decidido_por`, `historico`.
- `expirar_pendentes() returns int` — quantas expiraram; agendada `pg_cron` `'0 * * * *'`.

- [ ] Escrever testes (helpers criam/limpam cartinhas `teste = true` com códigos `C9xx`):
  - `adota carta disponível`: retorna `'ok'`; cartinha `pendente`; adoção com `expira_em ≈ criado_em + 24h`.
  - `concorrência`: `Promise.all` de 10 chamadas na mesma carta → exatamente 1 `'ok'`, 9 `'indisponivel'`, 1 linha em `adocoes`.
  - `status não disponível`: carta `pendente` ou `apadrinhada` → `'indisponivel'`, nenhuma linha nova.
  - `limite por contato`: 4ª pendente do mesmo WhatsApp → `'limite'`; idem e-mail.
  - `limite por ip`: 11ª tentativa na hora do mesmo `ip_hash` → `'limite'`.
  - `expira`: adoção com `expira_em` no passado → `expirar_pendentes()` retorna 1; adoção `expirada`; cartinha `disponivel`; linha em `historico`.
  - `decidir`: aprovar pendente → cartinha `apadrinhada`; recusar → `disponivel`; cancelar aprovada → `disponivel`; aprovar já recusada → `'estado_invalido'`.
  - `RLS`: cliente anônimo `select` em `adocoes` → 0 linhas/erro; `cartinhas_publicas` não tem coluna `observacoes`.
- [ ] Rodar `npm test -- supabase` → FAIL (funções não existem).
- [ ] Implementar `0003_adocao.sql`. `adotar_cartinha`: `select ... for update` na cartinha, checagens na ordem da spec §4, depois `update` + `insert` + `historico`. Tentativas por IP contadas em `adocoes` + tabela `tentativas_ip(ip_hash, quando)` (criar aqui).
- [ ] Rodar testes → PASS. Commit `feat(db): adoção com trava, decisão e expiração`.

### Task 4: Design system e casca do site

**Files:** Modify `src/app/globals.css`, `src/app/layout.tsx`; Create `src/components/papel/{Caderno,Selo,Fita,Carimbo,Envelope}.tsx`, `src/components/vidro/CardVidro.tsx`, `src/components/navegacao/MenuInferior.tsx`, `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx` (provisória), `tests/e2e/casca.spec.ts`.

**Interfaces — Produces:** `<CardVidro as?="a"|"button"|"div" interativo?: boolean>` (só com `interativo` recebe hover/elevação/cursor); `<Carimbo texto: string>`; `<Selo>{children}</Selo>`; `<Fita>` envolve imagem; `<MenuInferior>` com itens Início `/`, Cartinhas `/cartinhas`, Entrega `/entrega`, Galeria `/galeria`, Apoiar `/apoiar`.

- [ ] Rodar skill `design:design-system`; registrar tokens (cores, tipografia, espaçamentos, raio, sombra, blur) como variáveis CSS e `@theme` do Tailwind 4.
- [ ] Fundo de caderno no `body` da área `(site)`: pautas `repeating-linear-gradient` com `--pauta: 28px` (mobile) / `32px` (desktop), margem vermelha em `left: 16px` (mobile) / `56px` (desktop), ruído SVG inline.
- [ ] `tests/e2e/casca.spec.ts`: no `mobile`, menu inferior visível com 5 links, cada um com caixa ≥ 44×44; sem rolagem horizontal (`scrollWidth <= innerWidth`); `CardVidro` não interativo tem `cursor: auto`.
- [ ] Rodar `npm run test:e2e` → PASS; conferir contraste AA dos pares de token (registrar tabela no README).
- [ ] Commit, push, abrir preview e **mostrar ao usuário** (fim da Fase 0).

---

## Fase 1 – Cartinhas e adoção

**Entregável:** lista com filtros, página da cartinha com visualizador, formulário de adoção funcionando contra o banco, confirmação.
**Pronto quando:** e2e mobile adota uma cartinha de teste do início ao fim; Lighthouse mobile ≥ 90 em `/cartinhas` e `/cartinhas/C9xx`.

### Task 5: Lista de cartinhas e filtros

**Files:** Create `src/lib/dados/cartinhas.ts`, `src/lib/dados/contador.ts`, `src/components/cartinhas/{Grade,CardCartinha,Filtros}.tsx`, `src/components/home/Contador.tsx`, `src/app/(site)/cartinhas/page.tsx`, `tests/unit/filtros.test.ts`, `tests/e2e/lista.spec.ts`.

**Interfaces — Produces:**
- `type CartinhaPublica = { codigo; primeiroNome; idade; genero: 'menino'|'menina'; pedido; tamanhoRoupa?; tamanhoCalcado?; imagemUrl; status }`
- `listarCartinhas(): Promise<CartinhaPublica[]>` (`'use cache'`, `cacheTag('cartinhas')`)
- `obterCartinha(codigo: string): Promise<CartinhaPublica | null>` (`cacheTag('cartinhas', 'cartinha:'+codigo)`)
- `obterContador(): Promise<{ total; apadrinhadas; faltam }>` (`cacheTag('cartinhas')`; pendentes contam em "faltam")
- `filtrarCartinhas(lista, { busca?, faixa?: '0-3'|'4-6'|'7-9'|'10+', genero?, soDisponiveis?: boolean }): CartinhaPublica[]` — puro; ordena disponíveis primeiro, depois por código.

- [ ] Testes `filtrarCartinhas`: faixa `'7-9'` inclui 7 e 9, exclui 10; busca ignora acento e caixa (`"bone"` acha "Boneca"); busca por código `"c001"`; `soDisponiveis` remove `pendente` e `apadrinhada`; ordem disponíveis → resto.
- [ ] Implementar; filtros no cliente com estado na URL (`?faixa=7-9&genero=menina`), botões de chip ≥ 44px.
- [ ] Card: miniatura `next/image` `sizes="(max-width:767px) 50vw, 25vw"`, `alt="Cartinha C001, criança de 7 anos"`, botão **Ler cartinha**; `<Carimbo texto="Apadrinhada">` ou `<Selo>Aguardando confirmação</Selo>`.
- [ ] e2e: com dados de teste, filtro Menina reduz a contagem visível; contador aparece numa linha a 360px.
- [ ] Commit.

### Task 6: Página da cartinha, visualizador e formulário

**Files:** Create `src/app/(site)/cartinhas/[codigo]/page.tsx`, `src/components/cartinhas/{Visualizador,FormAdocao,Confirmacao}.tsx`, `src/lib/adocao/{schema,normalizar,acoes}.ts`, `tests/unit/adocao.test.ts`, `tests/e2e/adocao.spec.ts`.

**Interfaces:**
- Consumes: `obterCartinha`, `adotar_cartinha` (Task 3), `listarPontos()` (Task 11; até lá, lista vazia).
- Produces: `normalizarWhatsapp(entrada: string): string | null` → 11 dígitos `DDD9XXXXXXXX` ou `null`; `schemaAdocao` (zod: `nome` 2–80, `whatsapp`, `email`, `compromisso: true`, `site` honeypot vazio); Server Action `adotar(codigo: string, form: FormData): Promise<{ resultado: 'ok'|'indisponivel'|'limite'|'invalido'|'erro'; erros?: Record<string,string> }>` — calcula `ip_hash = sha256(ip + IP_HASH_SALT)`, chama RPC com o admin client, em `'ok'` chama `updateTag('cartinhas')`.

- [ ] Testes `normalizarWhatsapp`: `"(61) 9 9999-8888"`, `"+55 61 99999-8888"`, `"5561999998888"` → `"61999998888"`; `"61 9999-8888"` (sem 9, 10 dígitos) → `"61999998888"`; `"123"` → `null`.
- [ ] Testes `schemaAdocao`: honeypot preenchido → inválido; `compromisso` falso → erro "Confirme o compromisso de entrega".
- [ ] Implementar. Visualizador: `<dialog>` em tela cheia, `touch-action: pinch-zoom`, imagem em resolução cheia carregada só ao abrir, botão fechar 48px, `Esc` fecha, foco volta ao gatilho.
- [ ] Botão **Quero apadrinhar** fixo no rodapé (acima do menu, `env(safe-area-inset-bottom)`); abre bottom sheet com o formulário; inputs `type="tel" inputmode="numeric" autocomplete="tel"` e `type="email" autocomplete="email"`.
- [ ] Mensagens exatas da spec §4 para `ok`, `indisponivel`, `limite`; `erro` → texto da spec §12; dados digitados preservados.
- [ ] `<Confirmacao>` com `<Envelope>`: código, "Entregue até 23/12", pontos de entrega (ou "Os pontos de entrega serão divulgados em breve").
- [ ] e2e mobile: abrir C9xx → ler (abre e fecha visualizador) → adotar → confirmação; recarregar lista → selo "Aguardando confirmação"; segunda tentativa na mesma carta → botão oculto.
- [ ] Lighthouse mobile nas duas páginas ≥ 90; corrigir o que ficar abaixo.
- [ ] Commit, push, **mostrar preview** (fim da Fase 1) + entregar a copy da Fase 1 para revisão.

---

## Fase 2 – Painel

**Entregável:** voluntários entram por link mágico, aprovam/recusam com e-mail e WhatsApp, cadastram e importam cartinhas, exportam padrinhos.
**Pronto quando:** e2e: login de teste → aprovar pendente → cartinha "Apadrinhada" no site; importação de CSV real exportado do Sheets funciona; usuário anônimo recebe redirect em todas as rotas `/painel/*`.

### Task 7: Login e proteção do painel

**Files:** Create `src/proxy.ts`, `src/app/painel/login/page.tsx`, `src/app/painel/layout.tsx`, `src/app/auth/callback/route.ts`, `tests/e2e/painel-acesso.spec.ts`.

**Interfaces — Produces:** `exigirVoluntario(): Promise<{ email: string }>` (server; redireciona para `/painel/login` se não logado ou não voluntário).

- [ ] e2e: anônimo em `/painel`, `/painel/padrinhos` → redirect para `/painel/login`; resposta de `/painel` tem `X-Robots-Tag: noindex`.
- [ ] Implementar: `signInWithOtp` (link mágico) só para e-mails em `voluntarios` (resposta igual para e-mails não cadastrados, sem revelar a lista); `proxy.ts` renova sessão; `robots.txt` bloqueia `/painel`.
- [ ] Teste e2e de login usa usuário de teste criado via admin API com sessão injetada (sem caixa de e-mail real).
- [ ] Commit.

### Task 8: Pendentes, decisão, e-mail e WhatsApp

**Files:** Create `src/app/painel/page.tsx`, `src/app/painel/historico/page.tsx`, `src/lib/email/aprovacao.ts`, `src/lib/adocao/whatsapp.ts`, `tests/unit/whatsapp.test.ts`, `tests/unit/email.test.ts`.

**Interfaces:**
- Consumes: `decidir_adocao` (Task 3), `exigirVoluntario`.
- Produces: `linkWhatsappAprovacao(a: { padrinhoNome; padrinhoWhatsapp; codigo; pedido }): string` → `https://wa.me/55<num>?text=<encoded>`; `enviarEmailAprovacao(a): Promise<{ ok: boolean }>`; Server Action `decidir(adocaoId, acao)` → chama RPC com client autenticado, `updateTag('cartinhas')`, em `aprovar` envia e-mail; falha de e-mail não desfaz.

- [ ] Testes: link contém `wa.me/5561999998888` e o código; texto do e-mail contém código, pedido, tamanhos, "23/12" e cada ponto ativo; sem pontos → frase "serão divulgados em breve".
- [ ] Implementar lista de pendentes (código, padrinho, "há 3h"), botões Aprovar / Recusar / WhatsApp; aviso visível se e-mail falhar.
- [ ] Configurar Resend: usuário cria conta e gera a chave; agente só registra `RESEND_API_KEY` na Vercel se o usuário colar no painel da Vercel (o agente não digita a chave). Remetente inicial `onboarding@resend.dev` até haver domínio.
- [ ] Histórico: últimas 200 ações.
- [ ] Commit.

### Task 9: Cartinhas no painel e importação em lote

**Files:** Create `src/app/painel/cartinhas/{page,nova/page,[codigo]/page}.tsx`, `src/app/painel/importar/page.tsx`, `src/lib/importacao/{csv,conferir}.ts`, `src/lib/imagem/otimizar.ts`, `tests/unit/importacao.test.ts`, `tests/fixtures/cartinhas-sheets.csv`.

**Interfaces — Produces:**
- `lerCsvCartinhas(texto: string): { linhas: LinhaCartinha[]; erros: { linha: number; motivo: string }[] }` — aceita `,` ou `;`, remove BOM, ignora linhas vazias, cabeçalho = colunas da planilha modelo, `genero` aceita `Menino/Menina` em qualquer caixa.
- `conferirLote(linhas, nomesArquivos: string[]): { prontas; semFoto: string[]; fotoSemLinha: string[]; duplicadas: string[] }` — casa `C001` com `C001.jpg|jpeg|png|webp` sem diferenciar caixa.
- `otimizarImagem(buf: Buffer): Promise<Buffer>` — WebP, largura máx. 1600, qualidade ajustada até ≤ 300 KB.

- [ ] Testes com fixture que imita exportação do Sheets (BOM, `;`, acentos, linha vazia final, linha `EXEMPLO`): 2 linhas válidas, 1 erro de idade `"sete"`; `conferirLote` aponta `C003` sem foto e `C010.JPG` sem linha.
- [ ] Implementar telas: lista com filtros; formulário avulso com upload (aviso "Confira se a carta não mostra sobrenome, endereço ou escola. Cubra antes de enviar."); checkbox "Cartinha de teste"; importação com pré-visualização e botão **Importar N cartinhas** só sem erros pendentes; botão **Apagar cartinhas de teste** com confirmação digitada ("APAGAR").
- [ ] Upload: Server Action recebe arquivo, `otimizarImagem`, grava `cartinhas/C001.webp`, `updateTag('cartinhas')`.
- [ ] Commit.

### Task 10: Padrinhos, CSV e voluntários

**Files:** Create `src/app/painel/padrinhos/page.tsx`, `src/app/painel/padrinhos/csv/route.ts`, `src/app/painel/voluntarios/page.tsx`, `src/lib/exportacao/csv.ts`, `tests/unit/exportacao.test.ts`.

**Interfaces — Produces:** `gerarCsvPadrinhos(rows): string` — `;` como separador, BOM UTF-8 (abre certo no Excel BR), colunas `codigo;crianca;pedido;padrinho;whatsapp;email;status;pedido_em;decidido_em;decidido_por`.

- [ ] Testes: campo com `;` ou aspas é escapado; começa com `﻿`; campo iniciado por `=`/`+`/`-`/`@` recebe `'` na frente (injeção de fórmula).
- [ ] Implementar lista com filtro por status, botão Cancelar (confirmação), rota CSV protegida por `exigirVoluntario`; tela de voluntários (adicionar e-mail, desativar).
- [ ] e2e da fase: login → aprovar a adoção da Task 6 → `/cartinhas` mostra "Apadrinhada".
- [ ] Commit, push, **mostrar preview** (fim da Fase 2).

---

## Fase 3 – Home, conteúdo e páginas de apoio

**Entregável:** Home completa, Entrega, Galeria, Apoiar, e telas de conteúdo no painel.
**Pronto quando:** cada bloco some quando vazio e aparece ao ser preenchido no painel; Lighthouse mobile ≥ 90 na Home.

### Task 11: Conteúdo editável no painel

**Files:** Create `src/lib/dados/conteudo.ts`, `src/app/painel/conteudo/{pontos,pix,patrocinadores,edicoes,geral}/page.tsx`.

**Interfaces — Produces:** `listarPontos()`, `listarPatrocinadores()`, `listarEdicoes()` (com fotos), `obterConfiguracoes()` — todos `'use cache'` com tags `pontos`, `patrocinadores`, `edicoes`, `config`; cada formulário do painel chama `updateTag` da sua tag.

- [ ] Formulários CRUD com ordenação (subir/descer); `maps_url` aceita link do Google Maps colado ou é gerado do endereço (`https://www.google.com/maps/search/?api=1&query=<endereço>`); upload de logos e fotos usa `otimizarImagem`.
- [ ] Teste manual: cadastrar 1 ponto, conferir que `/entrega` passa de "em breve" para o cartão sem novo deploy.
- [ ] Commit.

### Task 12: Pix

**Files:** Create `src/lib/pix/{brcode,qr}.ts`, `src/components/home/BlocoPix.tsx`, `tests/unit/pix.test.ts`.

**Interfaces — Produces:** `gerarPayloadPix({ chave, recebedor, cidade, txid?: string }): string`; `crc16(payload: string): string` (CRC-16/CCITT-FALSE, 4 hex maiúsculos); `qrPix(payload): Promise<string>` (SVG).

- [ ] Testes: `crc16("123456789")` → `"29B1"`; payload começa com `000201`, contém `br.gov.bcb.pix`, termina em `6304` + CRC válido; recebedor `"Associação Natal Feliz"` vira sem acento e ≤ 25 caracteres; cidade ≤ 15; `txid` padrão `***`.
- [ ] Implementar; `BlocoPix`: QR, chave, recebedor e banco, botão **Copiar chave Pix** com "Chave copiada" por 2s em `aria-live="polite"`; oculto sem chave.
- [ ] Commit.

### Task 13: Home

**Files:** Modify `src/app/(site)/page.tsx`; Create `src/components/home/{Edicoes,Cronometro,Video}.tsx`, `src/lib/tempo/contagem.ts`, `tests/unit/contagem.test.ts`.

**Interfaces — Produces:** `calcularContagem(agora: Date, alvo: Date): { dias; horas; minutos; segundos; encerrado: boolean }`.

- [ ] Testes: 1 dia e 1s antes → `{1,0,0,1}`; após o alvo → todos 0 e `encerrado: true`.
- [ ] Ordem da Home conforme spec §6.1; cronômetro no fim, uma linha a 360px (`font-variant-numeric: tabular-nums`), atualiza por segundo só quando visível; texto após o evento: "A entrega aconteceu em 29/12. Obrigado a quem participou."
- [ ] `Video`: oculto sem `video_url`; celular capa + play, `preload="none"`; desktop `muted playsinline` com autoplay só ao entrar na tela e sem `prefers-reduced-motion`.
- [ ] Commit.

### Task 14: Entrega, Galeria e Apoiar

**Files:** Create `src/app/(site)/{entrega,galeria,apoiar}/page.tsx`, `src/components/galeria/{Abas,Lightbox}.tsx`, `tests/e2e/paginas.spec.ts`.

- [ ] Entrega: cartão por ponto; **Ver no mapa** é `<a href=maps_url>` (abre o app no celular); `iframe` do mapa com `loading="lazy"` e só montado via IntersectionObserver.
- [ ] Galeria: abas por ano (desc.); grade `next/image` lazy; lightbox `<dialog>` com deslizar, setas do teclado e `Esc`; sem fotos → 6 placeholders neutros com o texto "Foto provisória".
- [ ] Apoiar: `BlocoPix`, logos com link (`rel="noopener"`), chamada de patrocínio para o WhatsApp de contato (oculta sem contato).
- [ ] e2e: lightbox abre, navega e fecha com teclado; "Ver no mapa" tem `href` do Google Maps.
- [ ] Commit, push, **mostrar preview** + entregar copy da Fase 3 (fim da Fase 3).

---

## Fase 4 – Vídeo de retrospectiva

**Entregável:** MP4 vertical e horizontal (20–25s) + capa, publicados na Home e na pasta `Vídeos` do Drive.
**Pronto quando:** usuário aprova o render; Home exibe o vídeo sem piorar o Lighthouse mobile abaixo de 90.
**Depende de:** fotos das edições anteriores no Drive.

### Task 15: Composição e render no Remotion

**Files:** Create `remotion/` (projeto separado, fora do bundle do site), `remotion/src/Retrospectiva.tsx`, `remotion/dados.json`.

- [ ] Usar skills `remotion:remotion-best-practices` e `remotion:remotion-create`; composição `Retrospectiva` com props `{ edicoes: { ano; criancas; presentes; fotos: string[] }[] }`, 30 fps, 1080×1920 e 1920×1080; mesma paleta e Caveat; sem texto com gradiente.
- [ ] Mostrar o Studio/um frame ao usuário antes do render final.
- [ ] `remotion:remotion-render`: MP4 H.264 ≤ 8 MB + capa WebP; subir no Storage, preencher `video_url` e `video_capa_path`, copiar para a pasta `Vídeos` do Drive.
- [ ] Commit.

---

## Fase 5 – Qualidade e lançamento

**Entregável:** site em produção com cartinhas reais.
**Pronto quando:** todos os itens abaixo verificados e aprovados pelo usuário.

### Task 16: SEO, Open Graph e README

**Files:** Create `src/app/opengraph-image.tsx`, `src/app/(site)/cartinhas/[codigo]/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/icon.svg`; Modify `README.md`.

- [ ] OG geral 1200×630 (papel, "NATAL FELIZ – 4ª Edição · Gama-DF"); OG por cartinha só com código, idade e pedido (teste: o HTML da imagem não contém `primeiro_nome`).
- [ ] README: rodar localmente, variáveis, como adicionar cartinhas (Drive → CSV → Importar), fotos das edições, patrocinadores, vídeo, trocar cartinhas de teste pelas reais, voluntários.
- [ ] Commit.

### Task 17: Revisões e lançamento

- [ ] `design:ux-copy` em todas as páginas; entregar copy final para aprovação.
- [ ] `design:accessibility-review`: teclado em todas as telas, foco visível, contraste, `alt`, leitor de tela no formulário.
- [ ] `design:design-critique` com prints a 360px e 1280px.
- [ ] Lighthouse mobile ≥ 90 nas 4 categorias em `/`, `/cartinhas`, `/cartinhas/[codigo]`, `/entrega`.
- [ ] Rolagem com 40+ cards a 360px sem travar (DevTools, CPU 4× lenta).
- [ ] `engineering:code-review` da branch inteira; `engineering:deploy-checklist`.
- [ ] Usuário apaga cartinhas de teste e importa as reais; conferir contador.
- [ ] Merge na `main`, produção `READY`, teste final de adoção real em celular.
