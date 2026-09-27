// ════════════════════════════════════════════════════════════
// SistemasGerais.js — Dia/noite, crafting, menu, áudio, save
// ════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { Mundo, BLOCO, INFO, BIOMA } from './Mundo.js';
import { FerasMaculadas, TIPO_FERA, CFG_FERA } from './FerasMaculadas.js';
import { Jogador } from './Jogador.js';

const DURACAO_DIA = 60;   // segundos
const DURACAO_NOITE = 40; // segundos

// ─── Gerenciador de Áudio ───
class AudioManager {
  constructor() {
    this.ctx = null; this.master = null; this.mus = null; this.sfx = null; this.amb = null;
    this.iniciado = false; this.musNome = null; this.ambNome = null;
    this.config = { volGeral: 0.8, volMusica: 0.5, volSfx: 0.8, volAmbiente: 0.6, mudo: false };
  }
  init() {
    if (this.iniciado) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.mus = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.amb = this.ctx.createGain();
      this.mus.connect(this.master); this.sfx.connect(this.master); this.amb.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.aplicarVolumes(); this.iniciado = true;
    } catch (e) { console.warn('Áudio indisponível', e); }
  }
  aplicarVolumes() {
    if (!this.iniciado) return;
    const m = this.config.mudo ? 0 : 1;
    this.master.gain.value = this.config.volGeral * m;
    this.mus.gain.value = this.config.volMusica;
    this.sfx.gain.value = this.config.volSfx;
    this.amb.gain.value = this.config.volAmbiente;
  }
  nota(freq, dur, tipo = 'sine', g = 0.15, dest = null) {
    if (!this.iniciado || this.config.mudo) return;
    const o = this.ctx.createOscillator(); const gn = this.ctx.createGain();
    o.type = tipo; o.frequency.value = freq;
    gn.gain.setValueAtTime(0, this.ctx.currentTime);
    gn.gain.linearRampToValueAtTime(g, this.ctx.currentTime + 0.01);
    gn.gain.setValueAtTime(g, this.ctx.currentTime + dur - 0.1);
    gn.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
    o.connect(gn); gn.connect(dest || this.sfx);
    o.start(); o.stop(this.ctx.currentTime + dur);
  }
  ruido(dur, ff = 1000, g = 0.1, dest = null, tf = 'lowpass') {
    if (!this.iniciado || this.config.mudo) return;
    const tam = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, tam, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < tam; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = tf; f.frequency.value = ff;
    const gn = this.ctx.createGain();
    gn.gain.setValueAtTime(g, this.ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    s.connect(f); f.connect(gn); gn.connect(dest || this.sfx);
    s.start(); s.stop(this.ctx.currentTime + dur);
  }
  sfxMinerar(t) { this.ruido(0.06, t === BLOCO.PEDRA ? 700 : 900, 0.05, this.sfx, 'bandpass'); }
  sfxQuebrarBloco(t) {
    const f = { [BLOCO.PEDRA]: 900, [BLOCO.LIXO]: 500, [BLOCO.SUCATA]: 1500 }[t] || 700;
    this.ruido(0.15, f, 0.15, this.sfx, 'bandpass');
    if (t === BLOCO.SUCATA || t === BLOCO.FERRO) this.nota(2000, 0.1, 'square', 0.06);
  }
  sfxAtacar() { this.ruido(0.08, 3000, 0.1, this.sfx, 'highpass'); this.nota(400, 0.06, 'sawtooth', 0.06); }
  sfxAcertar() { this.ruido(0.1, 800, 0.12, this.sfx, 'bandpass'); this.nota(150, 0.08, 'square', 0.08); }
  sfxColocarBloco() { this.ruido(0.1, 400, 0.12, this.sfx); this.nota(200, 0.08, 'triangle', 0.08); }
  sfxColetar() { this.nota(660, 0.08); setTimeout(() => this.nota(880, 0.08), 45); }
  registrarCombate() {}
  ligarAmbiente(nome) {
    if (!this.iniciado || this.ambNome === nome) return;
    this.desligarAmbiente();
    const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.amb);
    this.ambNodes = [];
    if (nome === 'noite') {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 4, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
      s.connect(f); f.connect(g); s.start();
      this.ambNodes.push(s);
    }
    g.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 2);
    this.ambGain = g; this.ambNome = nome;
  }
  desligarAmbiente() {
    if (!this.ambGain) return;
    const g = this.ambGain;
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    setTimeout(() => {
      if (this.ambNodes) for (const n of this.ambNodes) try { n.stop(); } catch (e) {}
      try { g.disconnect(); } catch (e) {}
    }, 1200);
    this.ambNome = null; this.ambNodes = null; this.ambGain = null;
  }
  tocarMusica(nome) {
    if (!this.iniciado || this.config.mudo || this.musNome === nome) return;
    this.pararMusica(); this.musNome = nome;
    const trilhas = {
      menu: { bpm: 70, loop: [196, 233, 294, 233, 175, 220, 262, 220] },
      dia: { bpm: 90, loop: [261, 329, 392, 329, 349, 440, 392, 349] },
      noite: { bpm: 55, loop: [147, 165, 131, 147, 110, 131, 98] },
      combate: { bpm: 140, loop: [220, 220, 277, 220, 196, 196, 247, 196] },
    };
    const t = trilhas[nome]; if (!t) return;
    const beat = 60 / t.bpm;
    let i = 0; this.musAtivo = true;
    const prox = () => {
      if (this.musNome !== nome || !this.musAtivo) return;
      const f = t.loop[i % t.loop.length];
      this.nota(f, beat, nome === 'combate' ? 'sawtooth' : 'sine', 0.06, this.mus);
      i++;
      this.musTimeout = setTimeout(prox, beat * 1000);
    };
    prox();
  }
  pararMusica() { this.musAtivo = false; if (this.musTimeout) clearTimeout(this.musTimeout); this.musNome = null; }
}

// ─── Sistema de Crafting ───
class SistemaCrafting {
  constructor(jogo) {
    this.jogo = jogo;
    this.bancadas = new Set(['maos']);
    this.receitas = [
      { id: 'tocha', nome: 'Tocha ×4', tier: 'maos', custo: { 'Fios': 1 }, cria: BLOCO.TOCHA, qtd: 4 },
      { id: 'bancada', nome: 'Bancada de Sucata', tier: 'maos', custo: { [BLOCO.SUCATA]: 15, [BLOCO.MADEIRA]: 5 }, cria: 'BANCADA', desbloqueia: 'bancada' },
      { id: 'espada', nome: 'Espada de Ferro', tier: 'bancada', custo: { [BLOCO.FERRO]: 8 }, cria: 'ESPADA' },
      { id: 'armadura', nome: 'Armadura de Sucata', tier: 'bancada', custo: { [BLOCO.SUCATA]: 30, 'Placa de Metal': 5 }, cria: 'ARMADURA' },
    ];
  }
  podeCraftar(r) {
    const inv = this.jogo.jogador.inventario;
    const mat = this.jogo.jogador.materiais;
    if (!this.bancadas.has(r.tier)) return false;
    for (const [k, v] of Object.entries(r.custo)) {
      const tem = inv[k] !== undefined ? inv[k] : (mat[k] || 0);
      if (tem < v) return false;
    }
    return true;
  }
  craftar(r) {
    if (!this.podeCraftar(r)) return false;
    const inv = this.jogo.jogador.inventario;
    const mat = this.jogo.jogador.materiais;
    for (const [k, v] of Object.entries(r.custo)) {
      if (inv[k] !== undefined) inv[k] -= v; else mat[k] -= v;
    }
    if (r.cria === BLOCO.TOCHA) inv[BLOCO.TOCHA] = (inv[BLOCO.TOCHA] || 0) + (r.qtd || 1);
    if (r.desbloqueia) this.bancadas.add(r.desbloqueia);
    if (this.jogo.audioHook) this.jogo.audioHook.sfxColetar();
    return true;
  }
}

// ─── Bootstrap principal ───
export class SistemasGerais {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.mundo = null;
    this.jogador = null;
    this.feras = null;
    this.crafting = null;
    this.audioManager = new AudioManager();
    this.clock = new THREE.Clock();
    this.tempo = 0;
    this.dia = 1;
    this.noite = false;
    this.pausado = false;
    this.telaAtual = 'menu';
    this.lastPasso = 0;
    this.config = this.carregarConfig();
  }

  carregarConfig() {
    try {
      const s = JSON.parse(localStorage.getItem('sucata3d_config') || '{}');
      return Object.assign({
        volGeral: 0.8, volMusica: 0.5, volSfx: 0.8, volAmbiente: 0.6, mudo: false,
      }, s);
    } catch (e) { return { volGeral: 0.8, volMusica: 0.5, volSfx: 0.8, volAmbiente: 0.6, mudo: false }; }
  }
  salvarConfig() {
    try { localStorage.setItem('sucata3d_config', JSON.stringify(this.config)); } catch (e) {}
  }

  iniciar() {
    // Configura renderer
    const app = document.getElementById('app');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    app.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Menu
    this.configurarMenu();

    // Carrega mundo em background
    window.__loading.set(20, 'Gerando terreno...');
    setTimeout(() => this.gerarMundo(), 100);
  }

  gerarMundo() {
    this.mundo = new Mundo(this.scene);
    window.__loading.set(60, 'Gerando chunks...');
    // Gera chunks iniciais em torno do spawn
    const spawnX = 0, spawnZ = 0;
    const superf = this.mundo.alturaSuperficie(spawnX, spawnZ);
    // Gera chunks ao redor
    this.mundo.atualizarChunks(spawnX, spawnZ);
    window.__loading.set(85, 'Criando jogador...');
    this.jogador = new Jogador(this.scene, this.camera, this.mundo, this.renderer.domElement);
    this.jogador.pos.set(spawnX + 0.5, superf + 2, spawnZ + 0.5);
    this.feras = new FerasMaculadas(this.scene, this.mundo);
    this.crafting = new SistemaCrafting(this);
    window.__loading.set(100, 'Pronto!');
    setTimeout(() => {
      window.__loading.esconder();
      document.getElementById('menu-principal').classList.remove('oculto');
      this.audioManager.init();
      this.audioManager.config = { ...this.config };
      this.audioManager.aplicarVolumes();
      this.audioManager.tocarMusica('menu');
      this.loop();
    }, 300);
  }

  configurarMenu() {
    document.querySelectorAll('.menu-botao').forEach(b => {
      b.addEventListener('click', () => this.acaoMenu(b.dataset.acao));
    });
  }

  acaoMenu(a) {
    if (a === 'jogar') {
      document.getElementById('menu-principal').classList.add('oculto');
      this.telaAtual = 'jogo';
      this.pausado = false;
      this.renderer.domElement.requestPointerLock();
      this.audioManager.tocarMusica('dia');
    } else if (a === 'voltar') {
      document.getElementById('menu-pausa').classList.add('oculto');
      this.pausado = false;
      this.renderer.domElement.requestPointerLock();
    } else if (a === 'menu') {
      document.getElementById('menu-pausa').classList.add('oculto');
      document.getElementById('menu-principal').classList.remove('oculto');
      this.telaAtual = 'menu';
      this.audioManager.tocarMusica('menu');
    } else if (a === 'config') {
      this.mostrarModal('Configurações', this.htmlConfig());
    } else if (a === 'tutorial') {
      this.mostrarModal('Tutorial', this.htmlTutorial());
    } else if (a === 'creditos') {
      this.mostrarModal('Créditos', '<p><b>SUCATA 3D</b> — Sandbox de sobrevivência</p><p>Feito com Three.js + HTML5</p>');
    } else if (a === 'sair') {
      window.close();
    }
  }

  htmlConfig() {
    return `
      <div style="display:flex;flex-direction:column;gap:14px">
        <label>Volume Geral: <input type="range" min="0" max="100" value="${this.config.volGeral * 100}" oninput="__sistemas.setVol('volGeral',this.value)"></label>
        <label>Música: <input type="range" min="0" max="100" value="${this.config.volMusica * 100}" oninput="__sistemas.setVol('volMusica',this.value)"></label>
        <label>Efeitos: <input type="range" min="0" max="100" value="${this.config.volSfx * 100}" oninput="__sistemas.setVol('volSfx',this.value)"></label>
        <label>Ambiente: <input type="range" min="0" max="100" value="${this.config.volAmbiente * 100}" oninput="__sistemas.setVol('volAmbiente',this.value)"></label>
        <label><input type="checkbox" ${this.config.mudo ? 'checked' : ''} onchange="__sistemas.setMudo(this.checked)"> Mudo</label>
      </div>
    `;
  }

  htmlTutorial() {
    return `
      <p><b>WASD</b> — Mover</p>
      <p><b>Mouse</b> — Olhar</p>
      <p><b>Espaço</b> — Pular · <b>Shift</b> — Correr</p>
      <p><b>Clique Esq</b> — Minerar/Atacar</p>
      <p><b>Clique Dir</b> — Colocar bloco</p>
      <p><b>1-8</b> — Selecionar bloco</p>
      <p><b>Q</b> — Alternar ferramenta</p>
      <p><b>ESC</b> — Pausar</p>
    `;
  }

  mostrarModal(titulo, html) {
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-conteudo').innerHTML = html;
    document.getElementById('modal-simples').classList.remove('oculto');
  }

  setVol(k, v) { this.config[k] = v / 100; this.audioManager.config[k] = this.config[k]; this.audioManager.aplicarVolumes(); this.salvarConfig(); }
  setMudo(v) { this.config.mudo = v; this.audioManager.config.mudo = v; this.audioManager.aplicarVolumes(); this.salvarConfig(); }

  // Teclas de atalho gerais
  instalarAtalhos() {
    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') {
        if (this.telaAtual === 'jogo') {
          this.pausado = true;
          document.getElementById('menu-pausa').classList.remove('oculto');
          document.exitPointerLock();
        } else if (this.telaAtual === 'pausa' || document.getElementById('menu-pausa').classList.contains('oculto') === false) {
          // já tratado
        }
      }
      if (this.telaAtual !== 'jogo') return;
      if (e.code === 'KeyQ') {
        this.jogador.ferramenta = this.jogador.ferramenta === 'picareta' ? 'bloco' : 'picareta';
      }
      if (e.code.startsWith('Digit')) {
        const n = parseInt(e.code.slice(5));
        const blocos = [BLOCO.CONCRETO, BLOCO.TERRA, BLOCO.PEDRA, BLOCO.LIXO, BLOCO.SUCATA, BLOCO.VIDRO, BLOCO.METAL_PURO, BLOCO.TOCHA];
        if (n >= 1 && n <= blocos.length) {
          this.jogador.blocoSel = blocos[n - 1];
          this.jogador.ferramenta = 'bloco';
        }
      }
    });
  }

  // ─── Loop principal ───
  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(0.05, this.clock.getDelta());
    if (!this.pausado && this.telaAtual === 'jogo') this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    // Tempo
    this.tempo += dt;
    const ciclo = DURACAO_DIA + DURACAO_NOITE;
    const fase = this.tempo % ciclo;
    const noiteAntes = this.noite;
    this.noite = fase >= DURACAO_DIA;
    const novoDia = Math.floor(this.tempo / ciclo) + 1;
    if (novoDia > this.dia) {
      this.dia = novoDia;
      this.mostrarMsg(`Dia ${this.dia}`);
    }

    // Fator dia/noite
    const tr = 4;
    let fator = 0;
    if (fase < DURACAO_DIA - tr) fator = 0;
    else if (fase < DURACAO_DIA) fator = (fase - (DURACAO_DIA - tr)) / tr;
    else if (fase < DURACAO_DIA + tr) fator = 1;
    else if (fase < ciclo - tr) fator = 1;
    else fator = 1 - (fase - (ciclo - tr)) / tr;

    this.mundo.aplicarCeu(fator);
    this.mundo
