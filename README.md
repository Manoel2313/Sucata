# 🏗️ SUCATA 3D — Sobrevivência no Ferro-Velho

Sandbox 3D de sobrevivência, exploração, construção e combate em Ferrum-9, um planeta devastado por lixo e sucata. Feito com **Three.js** e **JavaScript puro** (sem build/bundler).

## 🎮 Como Rodar

### Opção 1 — Abrir direto (mais simples)
1. Clone o repositório
2. Abra `index.html` no navegador (Chrome/Firefox/Edge)
3. Aguarde a geração do mundo (~5s)

> ⚠️ **Atenção**: alguns navegadores bloqueiam ES Modules abertos via `file://`. Se der erro, use a Opção 2.

### Opção 2 — Servidor local (recomendado)
```bash
# Python 3
python -m http.server 8000

# Ou Node.js
npx serve

# Ou PHP
php -S localhost:8000
