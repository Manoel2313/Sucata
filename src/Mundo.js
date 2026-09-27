// ════════════════════════════════════════════════════════════
// Mundo.js — Terreno 3D, biomas, blocos, cavernas, estruturas
// ════════════════════════════════════════════════════════════
import * as THREE from 'three';

export const TILE = 1; // 1 bloco = 1 unidade 3D
export const CHUNK_SIZE = 16;
export const ALTURA_MUNDO = 64;
export const RAIO_RENDER = 6; // chunks visíveis em cada direção

// ─── Tipos de bloco ───
export const BLOCO = {
  VAZIO: 0, TERRA: 1, PEDRA: 2, LIXO: 3, SUCATA: 4, MADEIRA: 5, FERRO: 6, TOCHA: 7,
  CONCRETO: 20, CONCRETO_SUJO: 21, ASFALTO: 22, TIJOLO: 23, VIDRO: 24,
  METAL_PURO: 25, FERRO_VELHO: 26, CANO: 27, PLASTICO: 28,
  TERRA_TOXICA: 29, AGUA_TOXICA: 30, LAMA: 31,
  AREIA: 33, GRAMA_MORTA: 35, MUSGO_TOXICO: 36,
  CRISTAL: 37, URANIO: 38, OURO: 39,
  RUINA_MARROM: 40, RUINA_CINZA: 41,
  BARRIL: 44, VEICULO: 45, TV: 46, GELADEIRA: 47,
  ARVORE_MORTA: 49, ARVORE_TOXICA: 50,
};

export const INFO = {
  [BLOCO.TERRA]:   { nome: 'Terra',   cor: 0x5a3d28, dureza: 1.0 },
  [BLOCO.PEDRA]:   { nome: 'Pedra',   cor: 0x4e4e58, dureza: 1.4 },
  [BLOCO.LIXO]:    { nome: 'Lixo',    cor: 0x3a3a30, dureza: 0.6, dropChance: 0.05 },
  [BLOCO.SUCATA]:  { nome: 'Sucata',  cor: 0x6e6e78, dureza: 0.9, dropChance: 0.10 },
  [BLOCO.MADEIRA]: { nome: 'Madeira', cor: 0x3c2d28, dureza: 0.8 },
  [BLOCO.FERRO]:   { nome: 'Ferro',   cor: 0x8a6a4a, dureza: 1.6 },
  [BLOCO.TOCHA]:   { nome: 'Tocha',   cor: 0xffaa33, dureza: 0.2, luz: true },
  [BLOCO.CONCRETO]:     { nome: 'Concreto',  cor: 0x7a7a72, dureza: 1.5 },
  [BLOCO.CONCRETO_SUJO]:{ nome: 'Conc. Sujo',cor: 0x5a5a4a, dureza: 1.2 },
  [BLOCO.ASFALTO]:      { nome: 'Asfalto',   cor: 0x2a2a2e, dureza: 1.8 },
  [BLOCO.TIJOLO]:       { nome: 'Tijolo',    cor: 0x8a4a3a, dureza: 1.4 },
  [BLOCO.VIDRO]:        { nome: 'Vidro',     cor: 0x8ab8c8, dureza: 0.4, transparente: true },
  [BLOCO.METAL_PURO]:   { nome: 'Metal',     cor: 0x9a9a9a, dureza: 2.2 },
  [BLOCO.FERRO_VELHO]:  { nome: 'Ferro Velho',cor: 0x7a5a3a, dureza: 1.7 },
  [BLOCO.CANO]:         { nome: 'Cano',      cor: 0x5a6a6a, dureza: 1.0 },
  [BLOCO.PLASTICO]:     { nome: 'Plástico',  cor: 0x4a6a4a, dureza: 0.5 },
  [BLOCO.TERRA_TOXICA]: { nome: 'Terra Tóxica',cor: 0x4a5a2a, dureza: 1.1 },
  [BLOCO.AGUA_TOXICA]:  { nome: 'Água Tóxica', cor: 0x5a8a3a, dureza: 0.1, liquido: true, dano: 3 },
  [BLOCO.LAMA]:         { nome: 'Lama',      cor: 0x3a3020, dureza: 0.9, lento: true },
  [BLOCO.AREIA]:        { nome: 'Areia',     cor: 0x8a7a5a, dureza: 0.7 },
  [BLOCO.GRAMA_MORTA]:  { nome: 'Grama',     cor: 0x3a4a2a, dureza: 0.8 },
  [BLOCO.MUSGO_TOXICO]: { nome: 'Musgo',     cor: 0x4a6a2a, dureza: 0.6 },
  [BLOCO.CRISTAL]:      { nome: 'Cristal',   cor: 0x7aff44, dureza: 1.8, luz: true, corLuz: 0x88ff44 },
  [BLOCO.URANIO]:       { nome: 'Urânio',    cor: 0x3a6a3a, dureza: 2.5, luz: true, corLuz: 0x44aa44, dano: 2 },
  [BLOCO.OURO]:         { nome: 'Ouro Queimado', cor: 0xc8a020, dureza: 1.9 },
  [BLOCO.RUINA_MARROM]: { nome: 'Ruína',     cor: 0x6a4a3a, dureza: 1.2 },
  [BLOCO.RUINA_CINZA]:  { nome: 'Ruína',     cor: 0x6a6a68, dureza: 1.2 },
  [BLOCO.BARRIL]:       { nome: 'Barril',    cor: 0x8a8a2a, dureza: 1.2, dano: 2 },
  [BLOCO.VEICULO]:      { nome: 'Veículo',   cor: 0x6a2a2a, dureza: 1.6 },
  [BLOCO.ARVORE_MORTA]: { nome: 'Árvore',    cor: 0x3a2a1a, dureza: 0.7 },
  [BLOCO.ARVORE_TOXICA]:{ nome: 'Árv. Tóxica',cor: 0x4a3a2a, dureza: 0.7 },
};

// ─── Biomas ───
export const BIOMA = {
  PLANICIE: 'Planície Devastada',
  FLORESTA: 'Floresta Contaminada',
  PANTANO: 'Pântano Tóxico',
  DESERTO: 'Deserto de Sucata',
  MONTANHA: 'Montanha de Detritos',
  ATERRO: 'Aterro Gigante',
  CIDADE: 'Cidade Abandonada',
  INDUSTRIA: 'Complexo Industrial',
  RADIOATIVO: 'Zona Radioativa',
};

// ─── Ruído Perlin 2D/3D ───
class Noise {
  constructor(seed) {
    this.perm = new Uint8Array(512);
    let s = seed || 12345;
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a, b, t) { return a + (b - a) * t; }
  grad3(h, x, y, z) {
    const g = h & 15;
    const u = g < 8 ? x : y;
    const v = g < 4 ? y : (g === 12 || g === 14) ? x : z;
    return ((g & 1) ? -u : u) + ((g & 2) ? -v : v);
  }
  noise3D(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y), zf = z - Math.floor(z);
    const u = this.fade(xf), v = this.fade(yf), w = this.fade(zf);
    const A = this.perm[X] + Y, AA = this.perm[A] + Z, AB = this.perm[A + 1] + Z;
    const B = this.perm[X + 1] + Y, BA = this.perm[B] + Z, BB = this.perm[B + 1] + Z;
    return this.lerp(
      this.lerp(
        this.lerp(this.grad3(this.perm[AA], xf, yf, zf), this.grad3(this.perm[BA], xf-1, yf, zf), u),
        this.lerp(this.grad3(this.perm[AB], xf, yf-1, zf), this.grad3(this.perm[BB], xf-1, yf-1, zf), u),
        v),
      this.lerp(
        this.lerp(this.grad3(this.perm[AA+1], xf, yf, zf-1), this.grad3(this.perm[BA+1], xf-1, yf, zf-1), u),
        this.lerp(this.grad3(this.perm[AB+1], xf, yf-1, zf-1), this.grad3(this.perm[BB+1], xf-1, yf-1, zf-1), u),
        v),
      w);
  }
  fbm(x, y, z, oct = 4) {
    let v = 0, a = 1, f = 1, max = 0;
    for (let i = 0; i < oct; i++) {
      v += this.noise3D(x * f, y * f, z * f) * a;
      max += a; a *= 0.5; f *= 2;
    }
    return v / max;
  }
}

// ─── Classe Mundo ───
export class Mundo {
  constructor(scene, seed = null) {
    this.scene = scene;
    this.seed = seed ?? Math.floor(Math.random() * 999999);
    this.noiseAlt = new Noise(this.seed + 1);
    this.noiseBio = new Noise(this.seed + 2);
    this.noiseCav = new Noise(this.seed + 3);
    this.noiseDet = new Noise(this.seed + 4);

    // Armazena blocos: Map com chave "x,y,z" para economizar memória
    this.blocos = new Map();
    this.chunks = new Map(); // mesh por chunk
    this.chunksGerados = new Set();

    // Cache de materiais three.js por tipo de bloco
    this.materiais = {};
    for (const t in INFO) {
      const info = INFO[t];
      this.materiais[t] = new THREE.MeshLambertMaterial({
        color: info.cor,
        transparent: !!info.transparente,
        opacity: info.transparente ? 0.6 : 1,
        emissive: info.luz ? info.corLuz || info.cor : 0x000000,
        emissiveIntensity: info.luz ? 0.5 : 0,
      });
    }
    // Material wireframe para debug
    this.materialVazio = new THREE.MeshBasicMaterial({ visible: false });

    // Luz ambiente
    this.luzAmbiente = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(this.luzAmbiente);
    this.luzDirecional = new THREE.DirectionalLight(0xffd0a0, 0.9);
    this.luzDirecional.position.set(50, 100, 30);
    this.luzDirecional.castShadow = true;
    this.luzDirecional.shadow.mapSize.set(1024, 1024);
    this.luzDirecional.shadow.camera.near = 1;
    this.luzDirecional.shadow.camera.far = 200;
    this.luzDirecional.shadow.camera.left = -60;
    this.luzDirecional.shadow.camera.right = 60;
    this.luzDirecional.shadow.camera.top = 60;
    this.luzDirecional.shadow.camera.bottom = -60;
    scene.add(this.luzDirecional);

    this.ceu = new THREE.Color(0x9a785f);
    scene.background = this.ceu;
    scene.fog = new THREE.FogExp2(this.ceu, 0.008);
  }

  chave(x, y, z) { return `${x},${y},${z}`; }

  // ─── Altura do terreno em (x, z) ───
  alturaTerreno(x, z) {
    const base = 32;
    const n1 = this.noiseAlt.fbm(x * 0.008, 0, z * 0.008, 4);
    const n2 = this.noiseAlt.fbm(x * 0.03 + 100, 0, z * 0.03 + 100, 3);
    return Math.floor(base + n1 * 8 + n2 * 3);
  }

  // ─── Bioma em (x, z) ───
  biomaEm(x, z) {
    const t = this.noiseBio.fbm(x * 0.002, 0, z * 0.002, 3) * 0.5 + 0.5;
    const u = this.noiseBio.fbm(x * 0.002 + 50, 0, z * 0.002 + 50, 3) * 0.5 + 0.5;
    const a = this.noiseBio.fbm(x * 0.003 + 100, 0, z * 0.003 + 100, 3) * 0.5 + 0.5;
    if (a > 0.75) return BIOMA.MONTANHA;
    if (a > 0.65) return BIOMA.ATERRO;
    if (t > 0.65 && u < 0.35) return BIOMA.DESERTO;
    if (u > 0.65) return BIOMA.PANTANO;
    if (u > 0.5 && t > 0.5) return BIOMA.FLORESTA;
    if (Math.random() < 0.02) return BIOMA.RADIOATIVO;
    return BIOMA.PLANICIE;
  }

  // ─── Gera um chunk (16×16×64) ───
  gerarChunk(cx, cz) {
    const key = `${cx},${cz}`;
    if (this.chunksGerados.has(key)) return;
    this.chunksGerados.add(key);

    const ox = cx * CHUNK_SIZE;
    const oz = cz * CHUNK_SIZE;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const x = ox + lx, z = oz + lz;
        const superf = this.alturaTerreno(x, z);
        const bioma = this.biomaEm(x, z);

        for (let y = 0; y < ALTURA_MUNDO; y++) {
          let bloco = BLOCO.VAZIO;
          if (y < superf - 4) {
            // Subsolo profundo
            bloco = BLOCO.PEDRA;
            if (this.noiseDet.fbm(x*0.1, y*0.1, z*0.1, 2) > 0.4) bloco = BLOCO.FERRO;
            if (y < 15 && this.noiseDet.fbm(x*0.08, y*0.08, z*0.08, 2) > 0.55) bloco = BLOCO.OURO;
          } else if (y < superf - 1) {
            // Subsolo raso
            bloco = this.blocoSubsolo(bioma, x, y, z);
          } else if (y < superf) {
            // Superfície
            bloco = this.blocoSuperficie(bioma);
          } else if (y < superf + 2 && (bioma === BIOMA.PANTANO)) {
            bloco = BLOCO.AGUA_TOXICA;
          }

          // Cavernas
          if (y > 5 && y < superf - 4) {
            const c = this.noiseCav.fbm(x * 0.06, y * 0.08, z * 0.06, 3);
            if (c > 0.25) bloco = BLOCO.VAZIO;
          }

          if (bloco !== BLOCO.VAZIO) this.blocos.set(this.chave(x, y, z), bloco);
        }

        // Árvores
        if (Math.random() < (bioma === BIOMA.FLORESTA ? 0.1 : bioma === BIOMA.PANTANO ? 0.08 : 0.01)) {
          const tipo = (bioma === BIOMA.PANTANO || bioma === BIOMA.RADIOATIVO) ? BLOCO.ARVORE_TOXICA : BLOCO.ARVORE_MORTA;
          const alt = 3 + Math.floor(Math.random() * 4);
          for (let i = 0; i < alt; i++) {
            this.blocos.set(this.chave(x, superf + i, z), tipo);
          }
        }
      }
    }
    this.construirMeshChunk(cx, cz);
  }

  blocoSuperficie(bioma) {
    switch (bioma) {
      case BIOMA.FLORESTA: return BLOCO.GRAMA_MORTA;
      case BIOMA.PANTANO:  return BLOCO.TERRA_TOXICA;
      case BIOMA.DESERTO:  return BLOCO.AREIA;
      case BIOMA.ATERRO:   return Math.random() < 0.5 ? BLOCO.SUCATA : BLOCO.LIXO;
      case BIOMA.MONTANHA: return BLOCO.PEDRA;
      case BIOMA.RADIOATIVO: return BLOCO.MUSGO_TOXICO;
      default: return Math.random() < 0.4 ? BLOCO.LIXO : BLOCO.TERRA;
    }
  }
  blocoSubsolo(bioma, x, y, z) {
    if (bioma === BIOMA.DESERTO) return BLOCO.AREIA;
    if (bioma === BIOMA.CIDADE)  return BLOCO.CONCRETO_SUJO;
    if (bioma === BIOMA.INDUSTRIA) return BLOCO.CONCRETO;
    if (bioma === BIOMA.RADIOATIVO) return BLOCO.TERRA_TOXICA;
    return Math.random() < 0.3 ? BLOCO.LIXO : BLOCO.TERRA;
  }

  // ─── Constrói mesh do chunk com InstancedMesh (1 por tipo de bloco) ───
  construirMeshChunk(cx, cz) {
    const key = `${cx},${cz}`;
    // Agrupa por tipo de bloco
    const porTipo = new Map();
    const ox = cx * CHUNK_SIZE, oz = cz * CHUNK_SIZE;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const x = ox + lx, z = oz + lz;
        for (let y = 0; y < ALTURA_MUNDO; y++) {
          const t = this.blocos.get(this.chave(x, y, z));
          if (!t) continue;
          if (!porTipo.has(t)) porTipo.set(t, []);
          porTipo.get(t).push([x, y, z]);
        }
      }
    }

    // Geometria base (cubo)
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const grupoChunk = new THREE.Group();
    grupoChunk.userData.cx = cx;
    grupoChunk.userData.cz = cz;

    for (const [tipo, posicoes] of porTipo) {
      const mat = this.materiais[tipo] || this.materiais[BLOCO.TERRA];
      const inst = new THREE.InstancedMesh(geo, mat, posicoes.length);
      inst.castShadow = true;
      inst.receiveShadow = true;
      const matrix = new THREE.Matrix4();
      for (let i = 0; i < posicoes.length; i++) {
        const [x, y, z] = posicoes[i];
        matrix.makeTranslation(x + 0.5, y + 0.5, z + 0.5);
        inst.setMatrixAt(i, matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      grupoChunk.add(inst);
    }

    this.scene.add(grupoChunk);
    this.chunks.set(key, grupoChunk);
  }

  // ─── Gera chunks ao redor do jogador (streaming) ───
  atualizarChunks(px, pz) {
    const ccx = Math.floor(px / CHUNK_SIZE);
    const ccz = Math.floor(pz / CHUNK_SIZE);
    // Gera os que faltam
    for (let dx = -RAIO_RENDER; dx <= RAIO_RENDER; dx++) {
      for (let dz = -RAIO_RENDER; dz <= RAIO_RENDER; dz++) {
        if (dx*dx + dz*dz > RAIO_RENDER*RAIO_RENDER) continue;
        this.gerarChunk(ccx + dx, ccz + dz);
      }
    }
    // Esconde os distantes
    for (const [key, grupo] of this.chunks) {
      const gx = grupo.userData.cx, gz = grupo.userData.cz;
      const d = Math.hypot(gx - ccx, gz - ccz);
      grupo.visible = d <= RAIO_RENDER + 1;
    }
  }

  // ─── API pública ───
  getBloco(x, y, z) {
    return this.blocos.get(this.chave(Math.floor(x), Math.floor(y), Math.floor(z))) ?? BLOCO.VAZIO;
  }
  setBloco(x, y, z, tipo) {
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    if (y < 0 || y >= ALTURA_MUNDO) return;
    const k = this.chave(x, y, z);
    if (tipo === BLOCO.VAZIO) this.blocos.delete(k);
    else this.blocos.set(k, tipo);
    // Regenerar chunk
    const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE);
    const gk = `${cx},${cz}`;
    const grupo = this.chunks.get(gk);
    if (grupo) {
      this.scene.remove(grupo);
      this.chunks.delete(gk);
    }
    this.chunksGerados.delete(gk);
    this.gerarChunk(cx, cz);
  }

  // Retorna Y da superfície (primeiro bloco sólido de cima para baixo) em (x, z)
  alturaSuperficie(x, z) {
    x = Math.floor(x); z = Math.floor(z);
    for (let y = ALTURA_MUNDO - 1; y >= 0; y--) {
      if (this.blocos.has(this.chave(x, y, z))) return y + 1;
    }
    return 0;
  }

  // Verifica se há bloco sólido em (x, y, z)
  ehSolido(x, y, z) {
    const b = this.getBloco(x, y, z);
    if (b === BLOCO.VAZIO) return false;
    const info = INFO[b];
    return info ? !info.liquido && !info.transparente : true;
  }

  // ─── Ciclo dia/noite ───
  aplicarCeu(fatorNoite) {
    // fatorNoite: 0 = dia, 1 = noite
    const dia = new THREE.Color(0x9a785f);
    const noite = new THREE.Color(0x0a0a1e);
    this.ceu.lerpColors(dia, noite, fatorNoite);
    this.scene.background = this.ceu;
    this.scene.fog.color.copy(this.ceu);
    this.luzAmbiente.intensity = 0.4 - 0.3 * fatorNoite;
    this.luzDirecional.intensity = 0.9 - 0.85 * fatorNoite;
  }

  // Deslocamento do sol para animação
  moverSol(tempo) {
    const ang = (tempo / 60) * Math.PI * 2;
    this.luzDirecional.position.set(Math.cos(ang) * 100, Math.sin(ang) * 100 + 20, 30);
  }

  // Bioma em uma posição
  biomaNome(x, z) { return this.biomaEm(x, z); }
}
