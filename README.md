# Kin — landing page

A página inicial (`index.html`) é a capa: duas "capas de revista", uma para cada versão.

| Pasta | O que é |
| --- | --- |
| `versao-1/` | Versão com design próprio (tipografia Anybody + Atkinson, animação de trajetórias no hero) e copy do briefing. React + Vite. |
| `versao-2/` | Reprodução fiel do briefing `kin_LP_v.1.pdf`: layout, cores, vetores, tipografia e copy. HTML + CSS + Vite. |

Cada pasta é um projeto independente:

```bash
cd versao-1   # ou versao-2
npm install
npm run dev
```

Para gerar o site completo (capa + as duas versões) em `site/`:

```bash
npm run build     # testa e builda as duas versões e monta site/
npm run preview   # builda e serve em http://localhost:4173
```

A cada push na `main`, o GitHub Actions (`.github/workflows/pages.yml`) builda e publica no GitHub Pages.
