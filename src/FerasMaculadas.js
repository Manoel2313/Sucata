// ════════════════════════════════════════════════════════════
// FerasMaculadas.js — Criaturas, IA, ataques, variantes
// ════════════════════════════════════════════════════════════
import * as THREE from 'three';

export const TIPO_FERA = {
  SMALL: 'small',
  AVERAGE: 'average',
  IMMENSE: 'immense',
  BEHEMOTH: 'behemoth',
  TRIBAL: 'tribal',
};

export const CFG_FERA = {
  [TIPO_FERA.SMALL]: {
    nome: 'Miúdo', raio: 0.5, altura: 0.5,
    vidaMax: 25, dano: 8, velocidade: 8, pulo: 8,
    cor: 0x6a5a3a, corDet: 0x4a3a20, corOlho: 0xffcc33,
    visao: 25, cooldownAtaque: 0.6, xpDrop: 5,
  },
  [TIPO_FERA.AVERAGE]: {
    nome: 'Médio', raio: 0.8, altura: 1.6,
    vidaMax: 80, dano: 18, velocidade: 3.5, pulo: 9,
    cor: 0x7a4a4a, corDet: 0x3a2020, corOlho: 0xff4444,
    visao: 30, cooldownAtaque: 1.0, xpDrop: 15,
  },
  [TIPO_FERA.IMMENSE]: {
    nome: 'Imenso', raio: 4, altura: 4,
    vidaMax: 400, dano: 45, velocidade: 1.2, pulo: 6,
    cor: 0x5a4a2a, corDet: 0x2a2010, corOlho: 0xff8800,
    visao: 35, cooldownAtaque: 1.8, xpDrop: 80,
  },
  [TIPO_FERA.BEHEMOTH]: {
    nome: 'Behemoth', raio: 7, altura: 7,
    vidaMax: 2500, dano: 100, velocidade: 0.5, pulo: 4,
    cor: 0x3a3a2a, corDet: 0x1a1a10, corOlho: 0xff2200,
    visao: 50, cooldownAtaque: 3.0, xpDrop: 500,
  },
  [TIPO_FERA.TRIBAL]: {
    nome: 'Tribal', raio: 0.7, altura: 1.8,
    vidaMax: 150, dano: 25, velocidade: 3.2, pulo: 10,
    cor: 0x8a7a4a, corDet: 0x4a3a1a, corOlho: 0xffaa00,
    visao: 28, cooldownAtaque: 1.2, xpDrop: 40,
  },
};

// ─── Cria geometria visual única para cada tipo ───
function criarMeshFera(tipo) {
  const cfg = CFG_FERA[tipo];
  const grupo = new THREE.Group();

  const matCorpo = new THREE.MeshLambertMaterial({ color: cfg.cor });
  const matDet = new THREE.MeshLambertMaterial({ color: cfg.corDet });
  const matOlho = new THREE.MeshBasicMaterial({ color: cfg.corOlho });

  if (tipo === TIPO_FERA.SMALL) {
    // Pequeno animal deformado — esfera achatada com pontas
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(cfg.raio, 8, 6), matCorpo);
    corpo.scale.set(1.4, 0.8, 1.0);
    grupo.add(corpo);
    // Patas
    for (let i = 0; i < 4; i++) {
      const pata = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), matDet);
      pata.position.set((i % 2 ? 0.3 : -0.3), -0.3, i < 2 ? -0.2 : 0.2);
      grupo.add(pata);
    }
    // Olhos
    for (const dx of [-0.15, 0.15]) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), matOlho);
      o.position.set(dx, 0.1, 0.4);
      grupo.add(o);
    }
  }
  else if (tipo === TIPO_FERA.AVERAGE) {
    // Humanoide corcunda
    const tronco = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), matCorpo);
    tronco.position.y = 0.6;
    grupo.add(tronco);
    const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), matCorpo);
    cabeca.position.y = 1.4;
    grupo.add(cabeca);
    // Corcunda
    const corc = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), matDet);
    corc.position.set(-0.2, 1.1, -0.2);
    grupo.add(corc);
    // Braços
    for (const dx of [-0.55, 0.55]) {
      const braco = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), matCorpo);
      braco.position.set(dx, 0.6, 0);
      grupo.add(braco);
    }
    // Pernas
    for (const dx of [-0.2, 0.2]) {
      const perna = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.25), matDet);
      perna.position.set(dx, -0.3, 0);
      grupo.add(perna);
    }
    // Olhos
    for (const dx of [-0.15, 0.15]) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), matOlho);
      o.position.set(dx, 1.4, 0.35);
      grupo.add(o);
    }
    // Placas de metal no corpo
    for (let i = 0; i < 3; i++) {
      const placa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.55), new THREE.MeshLambertMaterial({ color: 0x8a8a90 }));
      placa.position.set(0, 0.3 + i * 0.3, 0);
      grupo.add(placa);
    }
  }
  else if (tipo === TIPO_FERA.IMMENSE) {
    // Massa compactada — vários blocos com múltiplas cabeças
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 6), matCorpo);
    corpo.position.y = 2.5;
    grupo.add(corpo);
    // Cabeças
    for (let i = 0; i < 4; i++) {
      const cab = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), matDet);
      cab.position.set(-2.5 + i * 1.6, 6, 0);
      grupo.add(cab);
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), matOlho);
      o.position.set(-2.5 + i * 1.6, 6, 1.1);
      grupo.add(o);
    }
    // Braços gigantes
    for (const dx of [-3.5, 3.5]) {
      const braco = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 1.5), matCorpo);
      braco.position.set(dx, 2, 0);
      grupo.add(braco);
    }
    // Faixas de metal
    for (let i = 0; i < 3; i++) {
      const faixa = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.3, 6.2), new THREE.MeshLambertMaterial({ color: 0x6a6a70 }));
      faixa.position.set(0, 1 + i * 1.5, 0);
      grupo.add(faixa);
    }
  }
  else if (tipo === TIPO_FERA.BEHEMOTH) {
    // Colosso
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 12), matCorpo);
    corpo.position.y = 5;
    grupo.add(corpo);
    // Torres no dorso
    for (let i = 0; i < 6; i++) {
      const torre = new THREE.Mesh(new THREE.BoxGeometry(1, 4 + Math.random() * 4, 1), matDet);
      torre.position.set(-4 + i * 1.6, 12 + torre.geometry.parameters.height / 2, (Math.random() - 0.5) * 6);
      grupo.add(torre);
    }
    // Olhos brilhantes
    for (let i = 0; i < 6; i++) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), matOlho);
      o.position.set(-3 + i * 1.2, 7, 6);
      grupo.add(o);
    }
    // Braços
    for (const dx of [-6.5, 6.5]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 2), matCorpo);
      b.position.set(dx, 3, 0);
      grupo.add(b);
    }
  }
  else if (tipo === TIPO_FERA.TRIBAL) {
    // Humanoide com máscara
    const tronco = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.4), matCorpo);
    tronco.position.y = 0.6;
    grupo.add(tronco);
    // Máscara
    const mascara = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), new THREE.MeshLambertMaterial({ color: 0x5a5a62 }));
    mascara.position.y = 1.4;
    grupo.add(mascara);
    // Fendas dos olhos (brilhantes)
    for (const dx of [-0.15, 0.15]) {
      const olho = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.05), matOlho);
      olho.position.set(dx, 1.5, 0.3);
      grupo.add(olho);
    }
    // Braços
    for (const dx of [-0.5, 0.5]) {
      const braco = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), matCorpo);
      braco.position.set(dx, 0.6, 0);
      grupo.add(braco);
    }
    // Pernas
    for (const dx of [-0.18, 0.18]) {
      const perna = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), matDet);
      perna.position.set(dx, -0.3, 0);
      grupo.add(perna);
    }
    // Arma (espada improvisada)
    const arma = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 0.05), new THREE.MeshLambertMaterial({ color: 0x8a8a92 }));
    arma.position.set(0.55, 1.0, 0.2);
    arma.rotation.z = -0.3;
    grupo.add(arma);
  }

  return grupo;
}

// ─── Classe Fera ───
export class Fera {
  constructor(scene, mundo, x, y, z, tipo) {
    this.scene = scene;
    this.mundo = mundo;
    this.tipo = tipo;
    this.cfg = CFG_FERA[tipo];
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3();
    this.vidaMax = this.cfg.vidaMax;
    this.vida = this.vidaMax;
    this.noChao = false;
    this.visao = this.cfg.visao;
    this.cooldownAtaque = 0;
    this.estado = 'idle'; // idle, andar, atacar
    this.tempoAnim = 0;
    this.direcao = 1;
    this.morta = false;

    // Mesh
    this.mesh = criarMeshFera(tipo);
    this.mesh.position.copy(this.pos);
    this.mesh.castShadow = true;
    this.mesh.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(this.mesh);
  }

  // AABB simples: considera o raio do corpo
  get raio() { return this.cfg.raio; }
  get altura() { return this.cfg.altura; }

  update(dt, jogador) {
    if (this.morta) return;
    this.tempoAnim += dt;
    if (this.cooldownAtaque > 0) this.cooldownAtaque -= dt;

    // Distância até o jogador
    const dx = jogador.pos.x - this.pos.x;
    const dz = jogador.pos.z - this.pos.z;
    const dy = jogador.pos.y - this.pos.y;
    const dist = Math.hypot(dx, dy, dz);

    const persegue = dist < this.visao;

    if (persegue && this.cooldownAtaque <= 0 && dist < this.raio + 1.5) {
      // Ataque
      jogador.tomarDano(this.cfg.dano);
      this.cooldownAtaque = this.cfg.cooldownAtaque;
      this.estado = 'atacar';
    } else if (persegue && dist > 1.2) {
      // Persegue
      const dir = new THREE.Vector3(dx, 0, dz).normalize();
      this.vel.x = dir.x * this.cfg.velocidade;
      this.vel.z = dir.z * this.cfg.velocidade;
      this.direcao = dir.x > 0 ? 1 : -1;
      this.estado = 'andar';
    } else {
      this.vel.x = 0; this.vel.z = 0;
      this.estado = 'idle';
    }

    // Gravidade
    this.vel.y -= 20 * dt;
    if (this.vel.y < -30) this.vel.y = -30;

    // Integra e colide
    this.moverComColisao(dt);

    // Aplica à mesh
    this.mesh.position.copy(this.pos);
    this.mesh.rotation.y = this.direcao > 0 ? -Math.PI / 2 : Math.PI / 2;

    // Animação de bob
    if (this.estado === 'andar') {
      this.mesh.position.y += Math.sin(this.tempoAnim * 12) * 0.05;
    }
  }

  // Movimento com colisão AABB por eixo
  moverComColisao(dt) {
    const m = this.mundo;
    const r = this.raio;
    const h = this.altura;

    // X
    let nx = this.pos.x + this.vel.x * dt;
    if (!this.colide(nx, this.pos.y, this.pos.z, r, h)) this.pos.x = nx;
    else this.vel.x = 0;

    // Z
    let nz = this.pos.z + this.vel.z * dt;
    if (!this.colide(this.pos.x, this.pos.y, nz, r, h)) this.pos.z = nz;
    else this.vel.z = 0;

    // Y
    let ny = this.pos.y + this.vel.y * dt;
    this.noChao = false;
    if (!this.colide(this.pos.x, ny, this.pos.z, r, h)) {
      this.pos.y = ny;
    } else {
      if (this.vel.y < 0) {
        // Pousa
        const gridY = Math.floor(this.pos.y - h);
        this.pos.y = gridY + h;
        this.noChao = true;
      }
      this.vel.y = 0;
    }

    // Se no chão e obstáculo à frente, pula (para "average", "small")
    if (this.noChao && Math.random() < 0.02) this.vel.y = this.cfg.pulo;
  }

  // Verifica colisão do AABB (centrado em x,z, base em y-h) com blocos sólidos
  colide(cx, cy, cz, r, h) {
    const m = this.mundo;
    const x0 = Math.floor(cx - r), x1 = Math.floor(cx + r);
    const y0 = Math.floor(cy - h), y1 = Math.floor(cy);
    const z0 = Math.floor(cz - r), z1 = Math.floor(cz + r);
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++)
          if (m.ehSolido(x, y, z)) return true;
    return false;
  }

  levarDano(q, dir) {
    if (this.morta) return;
    this.vida -= q;
    // Knockback leve
    if (dir) this.vel.x += dir * 3;
    if (this.vida <= 0) this.morrer();
  }

  morrer() {
    this.morta = true;
    this.scene.remove(this.mesh);
    // Free resources
    this.mesh.traverse(o => {
      if (o.isMesh) {
        o.geometry.dispose();
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
  }
}

// ─── Gerenciador de Feras ───
export class FerasMaculadas {
  constructor(scene, mundo) {
    this.scene = scene;
    this.mundo = mundo;
    this.lista = [];
    this.tempoSpawn = 0;
    this.noite = false;
    this.dia = 1;
  }

  setAmbiente(noite, dia) {
    this.noite = noite;
    this.dia = dia;
  }

  spawnarNoturnas(jogador, dt) {
    if (!this.noite) return;
    const max = 6 + this.dia * 2;
    if (this.lista.length >= max) return;
    this.tempoSpawn += dt;
    const intervalo = Math.max(0.5, 1.5 - this.dia * 0.1);
    if (this.tempoSpawn < intervalo) return;
    this.tempoSpawn = 0;

    // Escolhe tipo
    const r = Math.random();
    let tipo = TIPO_FERA.SMALL;
    if (r > 0.7 && this.dia >= 3) tipo = TIPO_FERA.AVERAGE;
    if (r > 0.9 && this.dia >= 5) tipo = TIPO_FERA.IMMENSE;
    if (r > 0.98 && this.dia >= 7) tipo = TIPO_FERA.BEHEMOTH;

    // Posição: 30-60 blocos de distância
    const ang = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 30;
    const x = jogador.pos.x + Math.cos(ang) * dist;
    const z = jogador.pos.z + Math.sin(ang) * dist;
    const y = this.mundo.alturaSuperficie(x, z) + 2;
    this.lista.push(new Fera(this.scene, this.mundo, x, y, z, tipo));
  }

  spawnarTribal(x, z) {
    const y = this.mundo.alturaSuperficie(x, z) + 2;
    this.lista.push(new Fera(this.scene, this.mundo, x, y, z, TIPO_FERA.TRIBAL));
  }

  update(dt, jogador) {
    for (const f of this.lista) f.update(dt, jogador);
    // Remove mortas
    this.lista = this.lista.filter(f => !f.morta);
  }

  // Retorna a fera mais próxima em uma direção (raycast simples)
  atacarEm(jogador, direcao, alcance = 4) {
    let melhor = null;
    let melhorDist = Infinity;
    for (const f of this.lista) {
      const toF = new THREE.Vector3().subVectors(f.mesh.position, jogador.pos);
      const dist = toF.length();
      if (dist > alcance) continue;
      const dot = toF.clone().normalize().dot(direcao);
      if (dot > 0.6 && dist < melhorDist) {
        melhor = f;
        melhorDist = dist;
      }
    }
    return melhor;
  }
}
