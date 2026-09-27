// ════════════════════════════════════════════════════════════
// Jogador.js — Movimento 3D, câmera, vida, inventário, combate
// ════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { BLOCO, INFO } from './Mundo.js';

export class Jogador {
  constructor(scene, camera, mundo, canvas) {
    this.scene = scene;
    this.camera = camera;
    this.mundo = mundo;
    this.canvas = canvas;

    // Posição e física
    this.pos = new THREE.Vector3(0, 50, 0);
    this.vel = new THREE.Vector3();
    this.largura = 0.6; // AABB
    this.altura = 1.8;
    this.noChao = false;
    this.correndo = false;

    // Vida / energia
    this.vidaMax = 100; this.vida = 100;
    this.energiaMax = 100; this.energia = 100;
    this.invuln = 0;

    // Câmera (FPS)
    this.yaw = 0;    // rotação horizontal
    this.pitch = 0;  // rotação vertical
    this.sensibilidade = 0.002;
    this.cameraHeight = 1.6;

    // Inventário
    this.inventario = {
      [BLOCO.TERRA]: 0, [BLOCO.PEDRA]: 0, [BLOCO.LIXO]: 0, [BLOCO.SUCATA]: 0,
      [BLOCO.MADEIRA]: 0, [BLOCO.FERRO]: 0, [BLOCO.TOCHA]: 10,
      [BLOCO.CONCRETO]: 20, [BLOCO.METAL_PURO]: 10, [BLOCO.VIDRO]: 5,
    };
    this.materiais = {
      'Placa de Metal': 0, 'Pregos': 0, 'Fios': 0, 'Engrenagens': 0,
      'Parafusos': 0, 'Molas': 0, 'Peças Mecânicas': 0,
    };
    this.blocoSel = BLOCO.CONCRETO;
    this.ferramenta = 'picareta'; // ou 'bloco'
    this.cooldown = 0;

    // Mineração
    this.minerando = null; // {x, y, z, prog, tot}

    // Teclas e mouse
    this.teclas = {};
    this.mouseEsq = false;
    this.mouseDir = false;
    this.instalarControles();
  }

  instalarControles() {
    window.addEventListener('keydown', e => {
      this.teclas[e.code] = true;
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.teclas[e.code] = false; });

    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement !== this.canvas) return;
      this.yaw   -= e.movementX * this.sensibilidade;
      this.pitch -= e.movementY * this.sensibilidade;
      const maxPitch = Math.PI / 2 - 0.05;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    });

    document.addEventListener('mousedown', e => {
      if (document.pointerLockElement !== this.canvas) return;
      if (e.button === 0) this.mouseEsq = true;
      if (e.button === 2) this.mouseDir = true;
    });
    document.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouseEsq = false;
      if (e.button === 2) this.mouseDir = false;
    });
    document.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Vetor de direção da câmera
  direcao() {
    return new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
  }

  update(dt, feras) {
    // Movimento horizontal
    const velBase = this.correndo ? 8 : 4.5;
    const dirFrente = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const dirDir = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const mov = new THREE.Vector3();
    if (this.teclas['KeyW']) mov.add(dirFrente);
    if (this.teclas['KeyS']) mov.sub(dirFrente);
    if (this.teclas['KeyD']) mov.add(dirDir);
    if (this.teclas['KeyA']) mov.sub(dirDir);
    if (mov.lengthSq() > 0) mov.normalize();
    this.correndo = this.teclas['ShiftLeft'] || this.teclas['ShiftRight'];

    this.vel.x = mov.x * velBase;
    this.vel.z = mov.z * velBase;

    // Pulo
    if (this.teclas['Space'] && this.noChao) {
      this.vel.y = 8;
      this.noChao = false;
    }

    // Gravidade
    this.vel.y -= 20 * dt;
    if (this.vel.y < -30) this.vel.y = -30;

    // Integra + colisão por eixo
    this.moverComColisao(dt);

    // Cooldown de ação
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.invuln > 0) this.invuln -= dt;

    // Câmera segue a cabeça
    this.camera.position.copy(this.pos);
    this.camera.position.y += this.cameraHeight;
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Dano por blocos perigosos
    const gx = Math.floor(this.pos.x), gy = Math.floor(this.pos.y), gz = Math.floor(this.pos.z);
    const b = this.mundo.getBloco(gx, gy, gz);
    const info = INFO[b];
    if (info && info.dano) this.tomarDano(info.dano * dt * 3);

    // Regeneração lenta
    if (this.vida < this.vidaMax) this.vida = Math.min(this.vidaMax, this.vida + 0.5 * dt);
  }

  moverComColisao(dt) {
    const m = this.mundo;
    const hw = this.largura / 2;
    const h = this.altura;

    // X
    let nx = this.pos.x + this.vel.x * dt;
    if (!this.colide(nx, this.pos.y, this.pos.z, hw, h)) this.pos.x = nx;
    else this.vel.x = 0;

    // Z
    let nz = this.pos.z + this.vel.z * dt;
    if (!this.colide(this.pos.x, this.pos.y, nz, hw, h)) this.pos.z = nz;
    else this.vel.z = 0;

    // Y
    let ny = this.pos.y + this.vel.y * dt;
    this.noChao = false;
    if (!this.colide(this.pos.x, ny, this.pos.z, hw, h)) {
      this.pos.y = ny;
    } else {
      if (this.vel.y < 0) {
        const gridY = Math.floor(this.pos.y - h);
        this.pos.y = gridY + h + 0.01;
        this.noChao = true;
      }
      this.vel.y = 0;
    }
  }

  colide(cx, cy, cz, hw, h) {
    const m = this.mundo;
    const x0 = Math.floor(cx - hw), x1 = Math.floor(cx + hw);
    const y0 = Math.floor(cy - h), y1 = Math.floor(cy - 0.01);
    const z0 = Math.floor(cz - hw), z1 = Math.floor(cz + hw);
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++)
          if (m.ehSolido(x, y, z)) return true;
    return false;
  }

  // Raycast simples para achar bloco alvo a partir da câmera
  blocoAlvo(alcance = 6) {
    const m = this.mundo;
    const origem = new THREE.Vector3(this.pos.x, this.pos.y + this.cameraHeight, this.pos.z);
    const dir = this.direcao();
    // Marcha pela grade
    let lastVazio = null;
    for (let t = 0; t < alcance; t += 0.1) {
      const px = origem.x + dir.x * t;
      const py = origem.y + dir.y * t;
      const pz = origem.z + dir.z * t;
      const bx = Math.floor(px), by = Math.floor(py), bz = Math.floor(pz);
      if (m.ehSolido(bx, by, bz)) {
        return { bloco: { x: bx, y: by, z: bz }, vazio: lastVazio };
      }
      lastVazio = { x: bx, y: by, z: bz };
    }
    return null;
  }

  acoes(dt, audioHook) {
    // Minerar (segurando Clique Esq)
    if (this.mouseEsq && this.ferramenta === 'picareta') {
      const alvo = this.blocoAlvo();
      if (alvo) {
        const { bloco } = alvo;
        const tipo = this.mundo.getBloco(bloco.x, bloco.y, bloco.z);
        const info = INFO[tipo];
        if (info) {
          const dureza = info.dureza;
          const tempoTotal = dureza * 0.8;
          if (!this.minerando ||
              this.minerando.x !== bloco.x ||
              this.minerando.y !== bloco.y ||
              this.minerando.z !== bloco.z) {
            this.minerando = { x: bloco.x, y: bloco.y, z: bloco.z, prog: 0, tot: tempoTotal };
          }
          this.minerando.prog += dt;
          if (Math.random() < dt * 8) audioHook.sfxMinerar(tipo);
          if (this.minerando.prog >= this.minerando.tot) {
            // Quebra
            this.mundo.setBloco(bloco.x, bloco.y, bloco.z, BLOCO.VAZIO);
            if (this.inventario[tipo] !== undefined) this.inventario[tipo]++;
            // Chance de material
            if (info.dropChance && Math.random() < info.dropChance) {
              const mats = ['Placa de Metal', 'Pregos', 'Fios', 'Engrenagens', 'Parafusos', 'Molas', 'Peças Mecânicas'];
              const mat = mats[Math.floor(Math.random() * mats.length)];
              this.materiais[mat]++;
            }
            audioHook.sfxQuebrarBloco(tipo);
            this.minerando = null;
            audioHook.registrarCombate?.();
          }
        }
      }
    } else this.minerando = null;

    // Atacar (Clique Esq com bloco)
    if (this.mouseEsq && this.ferramenta === 'bloco') {
      if (this.cooldown <= 0) {
        this.cooldown = 0.35;
        audioHook.sfxAtacar();
        const alvo = feras.atacarEm(this, this.direcao(), 4);
        if (alvo) {
          alvo.levarDano(18, Math.sign(this.direcao().x));
          audioHook.sfxAcertar();
          audioHook.registrarCombate();
        }
      }
    }

    // Colocar bloco (Clique Dir)
    if (this.mouseDir && this.ferramenta === 'bloco') {
      if (this.cooldown <= 0) {
        const alvo = this.blocoAlvo();
        if (alvo && alvo.vazio && (this.inventario[this.blocoSel] || 0) > 0) {
          const v = alvo.vazio;
          // Não colocar sobre o próprio jogador
          const boxJog = { x0: this.pos.x - 0.4, x1: this.pos.x + 0.4,
                           y0: this.pos.y, y1: this.pos.y + this.altura,
                           z0: this.pos.z - 0.4, z1: this.pos.z + 0.4 };
          const boxBloco = { x0: v.x, x1: v.x + 1, y0: v.y, y1: v.y + 1, z0: v.z, z1: v.z + 1 };
          const colide = !(boxBloco.x1 <= boxJog.x0 || boxBloco.x0 >= boxJog.x1 ||
                           boxBloco.y1 <= boxJog.y0 || boxBloco.y0 >= boxJog.y1 ||
                           boxBloco.z1 <= boxJog.z0 || boxBloco.z0 >= boxJog.z1);
          if (!colide) {
            this.mundo.setBloco(v.x, v.y, v.z, this.blocoSel);
            this.inventario[this.blocoSel]--;
            this.cooldown = 0.2;
            audioHook.sfxColocarBloco();
          }
        }
      }
    }
  }

  tomarDano(d) {
    if (this.invuln > 0) return;
    this.vida -= d;
    this.invuln = 0.6;
  }
}
