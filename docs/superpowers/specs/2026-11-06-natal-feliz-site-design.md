# NATAL FELIZ – 4ª Edição · Site de adoção de cartinhas

**Data:** 06/11/2026 · **Status:** aguardando revisão

## 1. Objetivo

Site para a ação social NATAL FELIZ (Gama-DF) em que crianças escrevem cartinhas e padrinhos/madrinhas adotam uma cartinha, compram o presente e entregam num ponto de coleta. O site publica as cartinhas, recebe as adoções, mostra edições anteriores, patrocinadores, pontos de entrega e recebe doações via Pix.

O público chega pelo celular, por links de WhatsApp e Instagram. Toda decisão parte da tela de 360–414px.

### Fatos fixos

| Item | Valor |
|---|---|
| Nome | NATAL FELIZ – 4ª Edição |
| Cidade | Gama – DF |
| Dia do evento (cronômetro) | 29/12/2026 (horário a definir; padrão 09:00, America/Sao_Paulo) |
| Prazo de entrega do presente | 23/12/2026 |
| URL inicial | `natalfeliz2026.vercel.app` |
| Pasta do Drive | `NATAL FELIZ 2026 - site` |

### Ainda a definir (entram pelo painel, sem mudar código)

Pontos de entrega, dados do Pix, patrocinadores, números e textos das edições anteriores, WhatsApp de contato, horário do evento. Enquanto um bloco estiver vazio, ele não aparece no site.

### Critérios de sucesso

- Um padrinho no celular encontra uma cartinha, lê, adota e recebe as instruções em menos de 2 minutos.
- Duas pessoas nunca conseguem adotar a mesma cartinha.
- Nenhum dado de padrinho é acessível sem login de voluntário.
- Nenhum dado identificador da criança além de primeiro nome, idade, gênero, pedido e tamanhos fica público.
- Lighthouse mobile ≥ 90 em Performance, Acessibilidade, Boas práticas e SEO na Home, na lista e na página de uma cartinha.
- Voluntários conseguem cadastrar cartinhas, aprovar adoções e editar conteúdo sem ajuda técnica.

### Fora do escopo

Pagamento online além do Pix copia-e-cola/QR, contas de padrinho, rastreio de entrega do presente, múltiplos idiomas, app nativo.

## 2. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Front + servidor | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Já instalado em `site-natal/`; páginas estáticas com revalidação, Server Actions para formulários. |
| Banco, login, arquivos | Supabase (Postgres + Auth + Storage), plano gratuito | Uma plataforma cobre tudo; transação/trava de linha nativa do Postgres; RLS protege dados de padrinhos. |
| Hospedagem | Vercel, repositório GitHub conectado (preview por branch, produção na `main`) | Pedido do projeto. |
| E-mail | Resend (plano gratuito, 3 mil/mês) | API simples; envio na aprovação. |
| Vídeo | Remotion, renderizado para MP4 + imagem de capa | Pedido do projeto. |
| QR Code Pix | Gerado no servidor a partir do payload BR Code (EMV) | Sem serviço externo. |

Descartado: Google Sheets como banco (sem transação, expõe dados); Postgres da Vercel + Auth.js + Blob (mais peças, sem ganho).

## 3. Modelo de dados

### Tabelas

**`cartinhas`**
| Coluna | Tipo | Público? |
|---|---|---|
| `id` | uuid PK | sim |
| `codigo` | text único, formato `C000` | sim |
| `primeiro_nome` | text | sim |
| `idade` | int (0–17) | sim |
| `genero` | enum `menino` \| `menina` | sim |
| `pedido` | text | sim |
| `tamanho_roupa` | text, opcional | sim |
| `tamanho_calcado` | text, opcional | sim |
| `observacoes` | text, opcional | **não** (interno) |
| `imagem_path` | text (caminho no Storage, nomeado pelo código) | sim |
| `status` | enum `disponivel` \| `pendente` \| `apadrinhada` | sim |
| `teste` | bool, padrão false | não |
| `criado_em`, `atualizado_em` | timestamptz | não |

Leitura pública via view `cartinhas_publicas` que expõe só as colunas marcadas "sim".

**`adocoes`** (somente voluntários)
`id`, `cartinha_id`, `padrinho_nome`, `padrinho_whatsapp` (só dígitos, com DDD), `padrinho_email`, `status` (`pendente` \| `aprovada` \| `recusada` \| `expirada` \| `cancelada`), `criado_em`, `expira_em` (criado_em + 24h), `decidido_em`, `decidido_por`, `ip_hash`.

**`historico`**: `id`, `adocao_id`, `acao`, `voluntario_email`, `quando`, `detalhe`.

**`pontos_entrega`**: `id`, `nome`, `endereco`, `horario`, `maps_url`, `ordem`, `ativo`.

**`patrocinadores`**: `id`, `nome`, `logo_path`, `link`, `ordem`, `ativo`.

**`edicoes`**: `id`, `ano`, `edicao_numero`, `criancas_atendidas`, `presentes_entregues`, `texto`, `ordem`. **`edicao_fotos`**: `id`, `edicao_id`, `foto_path`, `alt`, `ordem`.

**`configuracoes`** (linha única): `pix_chave`, `pix_tipo`, `pix_recebedor`, `pix_cidade`, `pix_banco`, `whatsapp_contato`, `evento_data_hora`, `prazo_entrega`, `video_url`, `video_capa_path`.

**`voluntarios`**: `email` PK, `nome`, `ativo`.

### Regras de acesso (RLS)

- Anônimo: `SELECT` em `cartinhas_publicas`, `pontos_entrega`, `patrocinadores`, `edicoes`, `edicao_fotos`, `configuracoes` (exceto colunas internas). Nenhum acesso direto a `adocoes`, `historico`, `voluntarios`.
- Adoção pública acontece só pela função `adotar_cartinha(...)` (`security definer`), nunca por `INSERT` direto.
- Voluntário autenticado (e-mail em `voluntarios` com `ativo = true`): leitura e escrita em tudo.

### Storage

Buckets: `cartinhas` (público, arquivos `C001.webp`), `galeria` (público), `patrocinadores` (público). Imagens redimensionadas no upload para no máximo 1600px de largura e ~300 KB, em WebP. Nenhum nome de criança em caminho de arquivo.

## 4. Fluxo de adoção

### Estados

```
disponivel ──adotar──▶ pendente ──aprovar──▶ apadrinhada
     ▲                    │                       │
     └──recusar/expirar───┘                       │
     └──────────────cancelar──────────────────────┘
```

### Função `adotar_cartinha(codigo, nome, whatsapp, email, ip_hash)`

Numa transação:
1. `SELECT ... FOR UPDATE` na cartinha pelo código.
2. Se `status <> 'disponivel'` → retorna `indisponivel`.
3. Se o mesmo WhatsApp ou e-mail já tem 3 adoções `pendente` → retorna `limite`.
4. Se o mesmo `ip_hash` fez mais de 10 tentativas na última hora → retorna `limite`.
5. Atualiza a cartinha para `pendente`, insere a adoção com `expira_em = now() + 24h`, registra no histórico, retorna `ok`.

### Expiração

`pg_cron` a cada hora: adoções `pendente` com `expira_em < now()` viram `expirada`; a cartinha volta a `disponivel`; registro no histórico.

### Formulário do padrinho

Campos: nome (`autocomplete="name"`), WhatsApp (`type="tel"`, `inputmode="numeric"`, máscara `(61) 9 9999-9999`), e-mail (`type="email"`), checkbox de compromisso com o prazo, campo honeypot oculto. Validação no cliente e no servidor (zod).

Respostas:
- `ok` → tela de confirmação (envelope), com código, prazo 23/12, pontos de entrega e aviso "A equipe confirma em até 24h por e-mail e WhatsApp".
- `indisponivel` → "Essa cartinha acabou de ser escolhida por outra pessoa." + "Ver outras cartinhas".
- `limite` → "Você já tem 3 cartinhas aguardando confirmação. Fale com a gente pelo WhatsApp para adotar mais."

### Aprovação

No painel, **Aprovar** muda adoção para `aprovada`, cartinha para `apadrinhada`, envia e-mail (Resend) com código, pedido, tamanhos, prazo, pontos de entrega e contato; registra no histórico. Botão **WhatsApp** abre `wa.me/55<numero>?text=<mensagem pronta>`. Falha no envio do e-mail não desfaz a aprovação: o painel mostra aviso e o botão de WhatsApp continua disponível.

## 5. Painel (`/painel`)

- Login por link mágico (Supabase Auth). Middleware bloqueia quem não está em `voluntarios`.
- **Pendentes** (tela inicial): código, padrinho, tempo de espera; Aprovar / Recusar / WhatsApp.
- **Cartinhas**: lista com filtros; criar/editar com upload; excluir; **Importar em lote** (CSV nas colunas da planilha modelo + várias fotos; pré-visualização lista códigos sem foto, fotos sem código e linhas inválidas antes de gravar); **Apagar cartinhas de teste**.
- **Padrinhos**: todas as adoções com status; Cancelar; **Exportar CSV**.
- **Conteúdo**: pontos de entrega, Pix, patrocinadores, edições + fotos, contato, data/hora do evento, vídeo.
- **Voluntários**: adicionar/desativar e-mails.
- **Histórico**: últimas ações com voluntário e horário.

Painel não precisa da estética de caderno completa; usa os mesmos tokens, layout simples, funcional no celular.

## 6. Páginas públicas

Menu inferior fixo no celular (≤ 5 itens): **Início · Cartinhas · Entrega · Galeria · Apoiar**. No desktop, barra no topo.

1. **Início** (`/`): título e frase de abertura com fatos; botão **Ler cartinhas**; contador (total, apadrinhadas, faltam) + barra de progresso; edições anteriores (cartão por ano com números e foto com fita); vídeo de retrospectiva; bloco Pix; cronômetro regressivo até o evento no fim da página.
2. **Cartinhas** (`/cartinhas`): contador; busca por nome/pedido/código; filtros (idade 0–3, 4–6, 7–9, 10+; Menino/Menina; Disponíveis/Todas); grade 2 col. no celular, 3–4 no desktop; card com miniatura, primeiro nome, idade, pedido, botão **Ler cartinha**; selo "Aguardando confirmação" ou carimbo "Apadrinhada"; indisponíveis ao final.
3. **Cartinha** (`/cartinhas/[codigo]`): imagem da carta em largura total; toque abre visualizador em tela cheia com zoom por pinça e botão de fechar de 48px; dados da criança abaixo; botão fixo **Quero apadrinhar** (oculto se indisponível); formulário em painel deslizante (bottom sheet).
4. **Entrega** (`/entrega`): cartão por ponto com endereço, horário, **Ver no mapa** (abre o app do Google Maps) e mapa embutido carregado só ao entrar na tela.
5. **Galeria** (`/galeria`): abas por ano; grade de fotos; lightbox com deslizar e teclado; placeholders neutros marcados "Foto provisória" enquanto não houver fotos.
6. **Apoiar** (`/apoiar`): bloco Pix; logos dos patrocinadores com link; chamada "Quer patrocinar? Fale com a gente" (WhatsApp).

Blocos sem dados (Pix, pontos, patrocinadores, edições, vídeo) não aparecem; a página **Entrega** sem pontos mostra "Os pontos de entrega serão divulgados em breve".

### Pix

Chave com botão **Copiar chave Pix** (confirmação visual "Chave copiada" por 2s, `aria-live`), QR Code gerado do payload BR Code estático, nome do recebedor e banco.

### Revalidação

Páginas públicas estáticas com cache por tags; toda escrita no painel e toda adoção chamam `revalidateTag` das páginas afetadas.

## 7. Direção visual

- **Caderno**: pautas horizontais e margem vermelha em CSS (`repeating-linear-gradient`), espaçamento proporcional à tela; no celular a margem fica a ~16px da borda e o conteúdo começa depois dela; textura de papel com ruído SVG inline (< 2 KB).
- **Tokens de cor**: vermelho-carta `#B3261E`, verde-pinheiro `#1F4D3A`, dourado `#B08D3C` (só detalhes, nunca texto pequeno), papel `#FBF6EA`, tinta `#2B2620`. Contraste AA verificado por par.
- **Tipografia**: Caveat (títulos, selos, detalhes); Source Serif 4 (corpo). Via `next/font`, subset latino.
- **Liquid glass**: cards interativos com fundo translúcido, `backdrop-filter: blur(6px)` no celular e `blur(14px)` no desktop, borda clara com reflexo e sombra suave. Fallback opaco com `prefers-reduced-transparency` ou sem suporte a `backdrop-filter`.
- **Elementos de carta**: selos postais nos contadores, fita adesiva nas fotos, envelope na confirmação, carimbo "Apadrinhada".
- **Regras**: proibido texto com gradiente; hover, elevação e `cursor: pointer` só em elementos clicáveis; animações curtas e desligadas com `prefers-reduced-motion`; alvos de toque ≥ 44px; contadores e cronômetro em uma linha a 360px.

## 8. Vídeo de retrospectiva (Remotion)

20–25s, 1080×1920 (vertical) e 1920×1080; fotos das edições com movimento lento, números de cada ano, fechamento com "4ª Edição · 29/12/2026". Renderizado para MP4 (H.264) e salvo no Storage e na pasta `Vídeos` do Drive. Celular: capa + botão play, `preload="none"`. Desktop: toca mudo ao entrar na tela. Bloco oculto até existir vídeo.

## 9. Copy

Português do Brasil, direto e específico. Sem "transformando vidas", "fazer a diferença", "jornada", triplas de adjetivos, emojis decorativos ou exclamação em toda frase. Botões com verbo: "Ler cartinha", "Quero apadrinhar", "Ver no mapa", "Copiar chave Pix". A copy de cada página é entregue para revisão antes de finalizar.

## 10. Privacidade (LGPD/ECA)

- Público: só primeiro nome, idade, gênero, pedido, tamanhos e a imagem da carta.
- A imagem da carta pode conter sobrenome, endereço ou escola escritos pela criança: o painel mostra um aviso no upload para conferir e cobrir esses dados antes de publicar.
- Texto alternativo: "Cartinha C001, criança de 7 anos" (sem nome).
- Imagem Open Graph de cada cartinha: só código, idade e pedido, sem a carta.
- Dados de padrinhos: acessíveis só a voluntários, usados só para a campanha; aviso curto no formulário.
- `noindex` no painel; `robots.txt` bloqueia `/painel`.

## 11. SEO e compartilhamento

Metadados por página, Open Graph com imagem 1200×630 de papel de carta ("NATAL FELIZ – 4ª Edição · Gama-DF"), imagem OG gerada por cartinha, `sitemap.xml`, favicon.

## 12. Tratamento de erros

- Falha de rede no formulário: mensagem e botão "Tentar de novo", sem perder o que foi digitado.
- Supabase indisponível: páginas públicas seguem servindo o cache; formulário mostra "Não conseguimos registrar agora. Tente em alguns minutos ou fale com a gente pelo WhatsApp".
- Falha de e-mail: aprovação mantida, aviso no painel.
- Importação em lote: nada é gravado se houver erro não aceito pelo voluntário na pré-visualização.

## 13. Testes

- **Banco** (TDD): `adotar_cartinha` com duas chamadas simultâneas na mesma carta (só uma `ok`); limite de 3 pendentes; expiração; RLS (anônimo não lê `adocoes`).
- **Unidade** (Vitest): payload Pix BR Code e CRC16; parser do CSV de importação; máscaras e validação do formulário; cálculo do cronômetro.
- **Ponta a ponta** (Playwright, viewport 390×844): adotar → confirmação; aprovar no painel; filtros da lista; copiar Pix.
- **Manual por fase**: modo dispositivo do navegador a 360px e 414px; Lighthouse mobile.

## 14. Arquivos do Drive → site

| Pasta do Drive | Como entra no site |
|---|---|
| `Cartinhas 2026` + `Planilhas/Cartinhas 2026 - dados` | Exportar a planilha em CSV e enviar junto com as fotos em Painel → Cartinhas → Importar em lote |
| `Fotos eventos anteriores/Natal Feliz AAAA` | Painel → Conteúdo → Edições → enviar fotos do ano |
| `Patrocinadores` | Painel → Conteúdo → Patrocinadores |
| `Vídeos` | Recebe o MP4 renderizado; o mesmo arquivo é enviado em Painel → Conteúdo → Vídeo |

O README documenta esse caminho passo a passo.

## 15. Mudanças aprovadas depois da spec

| Data | Mudança | Motivo |
|---|---|---|
| 06/11/2026 | Sem `SUPABASE_SERVICE_ROLE_KEY`: o site usa só a chave pública e a sessão do voluntário (RLS). Testes de banco rodam em SQL pelo conector. | Decisão do usuário; menos segredos para guardar. |
| 06/11/2026 | E-mail pelo Brevo (remetente Gmail verificado) no lugar do Resend. | Resend sem domínio próprio só envia ao dono da conta. |
| 06/11/2026 | **Adoção imediata, sem aprovação.** O pedido já vira "apadrinhada", o padrinho recebe o e-mail na hora, sem expiração de 24 h. Limite de 3 adoções ativas por WhatsApp/e-mail; canceladas não contam. | Decisão do usuário. Substitui §4 "Estados", "Expiração" e "Aprovação". |
| 06/11/2026 | **Painel só para o organizador.** Saem as telas Pendentes e Voluntários; a tela inicial é Padrinhos. A tabela `voluntarios` continua como lista de acesso (só o e-mail do organizador). | Decisão do usuário. Substitui §5 "Pendentes" e "Voluntários". |
| 06/11/2026 | Fotos comprimidas no navegador e enviadas direto ao Storage. | Limite de 4,5 MB por requisição na Vercel. |
