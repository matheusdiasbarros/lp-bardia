# BARDiA Sistemas — site institucional

Landing page estática de uma página só. Sem build, sem npm, sem framework, sem
CDN. É HTML, CSS e JavaScript puro: dá para abrir o `index.html` com dois
cliques e ver exatamente o que vai para o ar.

---

## Estrutura

```
BARDiA/
├── index.html               A página inteira (só o conteúdo; estilo e script saíram daqui)
├── 404.html                 Página de erro — o Cloudflare serve sozinho
├── robots.txt               Libera a indexação e aponta o sitemap
├── sitemap.xml              Uma URL só; atualize a data quando mexer no texto
├── site.webmanifest         Nome e ícones quando alguém salva o site na tela de início
├── _headers                 Cabeçalhos HTTP (segurança e cache) — lido pelo Cloudflare
├── _redirects               Atalhos de URL (/whatsapp, /contato…) — lido pelo Cloudflare
├── README.md                Este arquivo
│
└── assets/
    ├── css/styles.css       Todo o visual, em 14 blocos numerados
    ├── js/main.js           Menu, animações e destaque do menu
    ├── fonts/
    │   ├── inter-latin.woff2      47 KB — a fonte do site, servida daqui
    │   ├── inter-latin-ext.woff2  83 KB — só baixa se aparecer letra fora do latim
    │   └── OFL.txt                licença SIL Open Font License 1.1
    └── img/
        ├── logo.svg              Lettering "BARDiA" (era Logo.svg)
        ├── logo-mark.svg         Monograma quadrado, sem fundo (era Logo-Quadrada.svg)
        ├── favicon.svg           Monograma branco sobre quadrado âmbar — ícone da aba
        ├── og-image.jpg          1200×630 — miniatura ao compartilhar o link
        ├── favicon-32.png        32×32 — aba em navegador que não lê SVG
        ├── apple-touch-icon.png  180×180 — ícone no iPhone
        ├── logo-192.png          192×192 — ícone no Android
        └── logo-512.png          512×512 — logo da empresa na busca do Google
```

---

## As imagens

Está tudo gerado; nada pendente. Cada arquivo tem um destino específico:

| Arquivo                 | Onde aparece                                    |
|-------------------------|-------------------------------------------------|
| `og-image.jpg`          | Miniatura no WhatsApp, LinkedIn, Facebook e X    |
| `favicon.svg`           | Aba do navegador (quase todos leem SVG hoje)     |
| `favicon-32.png`        | Aba em navegador antigo, sem suporte a SVG       |
| `apple-touch-icon.png`  | Tela de início do iPhone/iPad                    |
| `logo-192.png`          | Tela de início do Android                        |
| `logo-512.png`          | Logo da empresa no resultado de busca do Google  |

Os ícones usam fundo **âmbar** com o monograma em branco, igual ao
`favicon.svg` — é o que mantém a mesma cara em qualquer navegador.

**Se um dia precisar refazer** (logo nova, texto diferente no OG), a
ferramenta que desenhou tudo isso continua no histórico do Git. Ela desenha
em `<canvas>` a partir dos traçados reais da logo — não é captura de tela:

```sh
git show 589606c:tools/gerar-imagens.html > gerar-imagens.html
```

Abra o arquivo no navegador, baixe o que precisar, mova para `assets/img/` e
apague a ferramenta de novo. Ela ficou fora do repositório porque não faz
parte do site.

> Por que não dá para usar SVG no `og:image`: WhatsApp, Facebook e LinkedIn
> não renderizam SVG em preview. Tem que ser PNG ou JPG.

> Por que o OG é JPEG e os ícones são PNG: a imagem de compartilhamento é
> cheia de degradê, que PNG comprime mal — o mesmo desenho fica em 71 KB em
> JPEG contra 407 KB em PNG, sem diferença visível numa miniatura de conversa.
> Prévia acima de ~300 KB deixa de ser renderizada por alguns clientes de
> WhatsApp. Os ícones continuam PNG porque são minúsculos e podem precisar
> de fundo transparente.

---

## Onde mexer em cada coisa

**Cor da marca** — `assets/css/styles.css`, bloco 1. São quatro variáveis
(`--accent`, `--accent-ink`, `--accent-soft`, `--accent-line`), repetidas
no bloco de tema escuro logo abaixo. Nenhuma cor está escrita em outro lugar
do arquivo, então trocar ali muda a página inteira.

**Textos** — `index.html`. Tudo que aparece na tela está lá, em português.
Se mudar o posicionamento da empresa, atualize junto o `<title>` e a
`<meta name="description">` no topo do arquivo, que é o que aparece no Google.

**Telefone** — o número `5562936181619` aparece 6 vezes no `index.html`, 1 no
`404.html` e 2 no `_redirects`. Use localizar-e-substituir.

**E-mail** — dois `mailto:` no `index.html` e uma vez no JSON-LD do rodapé.

**Novo produto** — há um comentário dentro do `index.html`, na seção
"Nossos produtos", explicando exatamente onde colar o card duplicado.

**Ano do rodapé** — não precisa mexer, o JavaScript escreve sozinho.

---

## Publicar no Cloudflare Pages

**Primeira vez, sem Git (mais simples):**

1. Entre no painel da Cloudflare → **Workers & Pages** → **Create** →
   aba **Pages** → **Upload assets**.
2. Dê um nome ao projeto (ex.: `bardia-site`) e arraste a **pasta BARDiA
   inteira** — não os arquivos soltos, senão a pasta `assets/` não sobe.
3. **Save and Deploy**. Em segundos o site está numa URL `*.pages.dev`.
4. Confira nessa URL antes de apontar o domínio.

**Atualizações depois:** mesmo projeto → **Create new deployment** → arrasta a
pasta de novo. Cada deploy fica no histórico e dá para voltar atrás em um clique.

**Se preferir Git:** conecte o repositório e deixe *Build command* e *Build
output directory* vazios — não existe build; o Cloudflare só copia os arquivos.

---

## Domínio e DNS

O jeito recomendado é deixar a Cloudflare cuidar do DNS inteiro, porque aí o
apex (`bardiasistemas.com.br`, sem www) funciona sem gambiarra:

1. Cloudflare → **Add a site** → `bardiasistemas.com.br` (plano Free serve).
2. A Cloudflare mostra dois **nameservers** (algo como `xxx.ns.cloudflare.com`).
3. No **Registro.br**, entre no domínio → *Alterar servidores DNS* → troque
   pelos dois da Cloudflare. A propagação costuma levar de minutos a algumas horas.
4. No projeto do Pages → **Custom domains** → **Set up a domain** →
   `bardiasistemas.com.br`. A Cloudflare cria o registro sozinha.
5. Repita para `www.bardiasistemas.com.br`.
6. O certificado HTTPS é emitido automaticamente. Não precisa comprar nada.

**Se você quiser manter o DNS fora da Cloudflare**, o apex não aceita CNAME
pelo padrão do DNS; nesse caso só o `www` funciona, apontando um **CNAME** para
`<seu-projeto>.pages.dev`. É mais um motivo para mover os nameservers.

**Redirecionar www → sem www** (opcional, ajuda no SEO): painel da Cloudflare →
**Rules** → **Redirect Rules** → *Create rule*:

- Se: `Hostname` **equals** `www.bardiasistemas.com.br`
- Então: **Dynamic redirect**, expressão
  `concat("https://bardiasistemas.com.br", http.request.uri.path)`, código **301**

Isso não pode ser feito no `_redirects`, que só entende caminho, não domínio.
Enquanto a regra não existe, o `<link rel="canonical">` do `index.html` já diz
ao Google qual é o endereço oficial.

---

## Detalhes que valem saber

**A logo troca de cor sozinha.** Os dois SVGs têm uma `@media
(prefers-color-scheme: dark)` dentro do próprio arquivo: escura no tema claro,
clara no tema escuro. Funciona até quando o SVG é carregado por `<img>`.
Se algum navegador antigo não aplicar, há uma regra de fallback comentada em
`styles.css`, no bloco 4.

**A fonte é a Inter, hospedada aqui.** Não vem do Google Fonts: o arquivo está
em `assets/fonts/` e é servido pelo mesmo domínio. Sai mais rápido (não abre
conexão com um terceiro), não entrega o IP do visitante para outra empresa e
mantém a página livre de dependência externa. É uma fonte *variável* — um
arquivo cobre os pesos de 100 a 900 — e por isso os pesos intermediários usados
no CSS (550, 650) são renderizados de verdade, não arredondados. A pilha do
sistema continua como reserva enquanto ela carrega. Licença SIL OFL 1.1, cujo
texto tem que continuar em `assets/fonts/OFL.txt` — é a única obrigação legal
de quem redistribui a fonte.

**Nenhuma requisição sai para fora.** Fonte hospedada aqui, ícones em SVG
escrito à mão dentro do HTML. O único tráfego externo acontece quando o
visitante clica num link (WhatsApp, PerfilVivo). O CSP no `_headers` reforça isso.

**Dois arquivos de logo quadrada, de propósito.** `logo-mark.svg` é o monograma
puro, sem fundo, que troca de cor conforme o tema. `favicon.svg` é o mesmo
monograma em branco sobre quadrado âmbar, com cor fixa — é o que aparece na
aba do navegador e o que combina com os PNGs de ícone. O monograma dentro dele
foi centralizado pela caixa real do desenho, não pelo `viewBox`: o SVG original
tem 12px de margem nas laterais e 35px em cima, então centralizar pelo quadrado
deixaria o símbolo visivelmente baixo.

**Caminhos relativos.** O `index.html` usa `assets/...` em vez de `/assets/...`,
então continua funcionando ao abrir o arquivo direto do disco. O `404.html` é a
exceção — usa caminho absoluto de propósito, porque o Cloudflare o serve a
partir de qualquer URL inexistente.

**Acessibilidade.** Um único `<h1>`, hierarquia de títulos sem pulo, `alt` em
toda imagem, foco visível no teclado, contraste AA nos dois temas, link "pular
para o conteúdo" e menu que fecha no `Esc`.
