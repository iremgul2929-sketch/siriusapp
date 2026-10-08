import type { FullPose } from './handModel';
import type { Tutor } from '@/data/tutors';

/**
 * WebView/iframe icinde calisan 3B hologram avatar sayfasi. three.js ile
 * neon cizgili tulum giyen bir karakter ve isikli bir platform kurar; verilen
 * poz dizisini karakterin eliyle dongu halinde oynatir (parmaklar eklemlerinden
 * bukulur, el kayar/doner).
 *
 * Mesajlar: {type:'ready'} | {type:'error', message}
 */

// jsdelivr'in "+esm" paketleri: GLTFLoader three'yi ayni adresten ice aktarir, boylece
// import map gerekmez (eski WebView'lerde de calisir) ve tek bir three kopyasi olur.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
const LOADER_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';

export function avatarHtml(poses: FullPose[], color: string, tutor: Tutor) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
<style>
  html, body { margin: 0; height: 100%; background: transparent; overflow: hidden; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<script type="module">
  const send = (m) => {
    const s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else window.parent.postMessage({ __sirius: true, data: s }, '*');
  };
  const POSES = ${JSON.stringify(poses)};
  const COLOR = '${color}';
  const TUTOR = ${JSON.stringify(tutor)};
  const STEP_MS = 650, HOLD_MS = 250;
  const DEG = Math.PI / 180;
  const REACH = 3.4; // poz kaymasi -> sahne birimi
  const ARM = 0.56; // ust kol ve on kol uzunlugu
  // Hazir model ayarlari
  const MODEL_URL = TUTOR.model || ''; // egitmenin iskeletli GLB modeli (varsa)
  const RIG_WAIT_MS = 25000;
  const RIG_HEIGHT = 4.5; // modelin sahnedeki boyu
  const RIG_HEAD_Y = 0.72;
  const RIG_WRIST = [0.5, 0.05, 0.8]; // bilegin dinlenme konumu
  const RIG_REACH = 2.6;
  const RIG_HAND_SCALE = 1.4;
  const RIG_SKIN_REF = 0.085; // modelin dokusundaki ten parlakligi (yeniden boyamada olcek)
  const RIG_HEAD_R = 0.29; // modelin basinin yaklasik yaricapi (sahne birimi)
  // Ozel bas (modelHead): yaricapi, kafa kemigine gore merkezi ve modelin kesildigi yukseklik.
  const RIG_FACE_R = 0.31;
  const RIG_FACE = [0, 0.25, 0.03];
  const RIG_HEAD_CUT = -0.05;
  const RIG_HAIR = [0, 0.34, 0.0]; // sac merkezinin kafa kemigine gore yeri
  const RIG_HAIR_SIZE = [0.52, 0.4, 0.36]; // tutamlarin dizildigi elipsoit

  async function main() {
    const THREE = await import('${THREE_URL}');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 5);
    // WebView ilk acildiginda boyut 0 gelebilir; her karede kontrol edilir.
    let sizeW = 0, sizeH = 0;
    const fit = () => {
      const w = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
      const h = Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
      if (w === sizeW && h === sizeH) return w > 0 && h > 0;
      sizeW = w;
      sizeH = h;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      return w > 0 && h > 0;
    };

    // --- Hologram malzemesi: kenarlarda parlayan (fresnel), tarama cizgili yuzey ---
    const VERT = [
      'varying vec3 vN; varying vec3 vV; varying float vY;',
      'void main() {',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  vN = normalize(normalMatrix * normal);',
      '  vV = normalize(-mv.xyz);',
      '  vY = (modelMatrix * vec4(position, 1.0)).y;',
      '  gl_Position = projectionMatrix * mv;',
      '}',
    ].join(' ');
    const FRAG = [
      'uniform vec3 uColor; uniform vec3 uRim; uniform float uRimPower; uniform float uScan; uniform float uTime;',
      'varying vec3 vN; varying vec3 vV; varying float vY;',
      'void main() {',
      '  vec3 n = normalize(vN);',
      '  float rim = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.4);',
      '  float light = 0.5 + 0.5 * max(dot(n, normalize(vec3(0.35, 0.55, 0.75))), 0.0);',
      '  float scan = 1.0 - uScan * (0.5 + 0.5 * sin(vY * 70.0 - uTime * 2.5));',
      '  vec3 c = uColor * light * scan + uRim * rim * uRimPower;',
      '  gl_FragColor = vec4(pow(c, vec3(0.4545)), 1.0);',
      '}',
    ].join(' ');
    const time = { value: 0 };
    const holo = (color, rim, rimPower, scan) =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uRim: { value: new THREE.Color(rim) },
          uRimPower: { value: rimPower },
          uScan: { value: scan },
          uTime: time,
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
    const basic = (c, opacity) =>
      new THREE.MeshBasicMaterial({ color: c, transparent: opacity !== undefined, opacity: opacity === undefined ? 1 : opacity });

    const skin = holo(TUTOR.skin, 0xffe2a8, 0.6, 0.05);
    const suit = holo(0x1c1842, 0xffdc85, 1.5, 0.22);
    const hair = holo(TUTOR.hair, 0xd9c2ff, 0.9, 0.1);
    // Cubbe kiyafeti: kil heykel havasinda acik gri-mavi kumas, koyu alt katman ve acik seritler.
    const ROBE = TUTOR.outfit === 'robe';
    const cloth = ROBE ? holo(0x8f9cc6, 0xa8f1ff, 0.9, 0.06) : suit;
    const clothDark = holo(0x65729c, 0xa8f1ff, 0.8, 0.06);
    clothDark.side = THREE.DoubleSide;
    const trim = holo(0xdfe6fb, 0xffffff, 0.5, 0.03);
    const ink = basic(0x15103a);
    const lips = basic(0xd9667a);
    const white = basic(0xffffff);
    const line = basic(COLOR);
    const mesh = (geo, m, parent, x, y, z) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(x || 0, y || 0, z || 0);
      parent.add(o);
      return o;
    };

    const PX = -0.55; // karakterin yatay merkezi
    const FLOOR = -1.3;

    // --- Platform: altin halkalar, zemin diski ve yukari yayilan isik konisi ---
    const TILT = 0.18;
    const halo = [
      { r: 0.85, color: 0xffdc85 },
      { r: 1.1, color: 0xb89af0 },
      { r: 1.38, color: 0xe6b84f },
    ].map((h) => {
      const ring = mesh(new THREE.TorusGeometry(h.r, 0.014, 8, 80), basic(h.color, 0.8), scene, PX, FLOOR, 0);
      ring.rotation.x = Math.PI / 2 - TILT;
      return ring;
    });
    mesh(new THREE.CircleGeometry(1.38, 64), basic(0xffdc85, 0.07), scene, PX, FLOOR, 0).rotation.x = -Math.PI / 2 - TILT;
    const beam = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0xf2c56b) } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uColor; varying vec2 vUv; void main() { float a = pow(1.0 - vUv.y, 1.6) * 0.18; gl_FragColor = vec4(uColor * a, a); }',
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    mesh(new THREE.CylinderGeometry(0.95, 1.3, 2.4, 48, 1, true), beam, scene, PX, FLOOR + 1.2, 0);

    const proc = new THREE.Group(); // kodla cizilen yedek karakter
    scene.add(proc);

    // --- Govde: omuzdan kalcaya daralan tulum ---
    const PROFILE = ROBE
      ? [
          [0.7, -1.9], [0.56, -1.3], [0.4, -0.95], [0.31, -0.72], [0.385, -0.3],
          [0.42, -0.1], [0.4, 0.0], [0.2, 0.06], [0.12, 0.12], [0.001, 0.14],
        ]
      : [
          [0.44, -1.9], [0.44, -1.3], [0.36, -1.0], [0.31, -0.72], [0.4, -0.3],
          [0.43, -0.1], [0.4, 0.0], [0.2, 0.06], [0.12, 0.12], [0.001, 0.14],
        ];
    const DEPTH = 0.6; // govde onden arkaya daha ince
    const torso = mesh(
      new THREE.LatheGeometry(PROFILE.map((p) => new THREE.Vector2(p[0], p[1])), 48),
      cloth, proc, PX, 0, 0,
    );
    torso.scale.z = DEPTH;
    const radiusAt = (y) => {
      for (let i = 0; i < PROFILE.length - 1; i++) {
        const a = PROFILE[i], b = PROFILE[i + 1];
        if (y >= a[1] && y <= b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
      }
      return PROFILE[0][0];
    };
    // Govdenin on yuzeyinin derinligi (yatay kayma dx, yukseklik y).
    const frontZ = (dx, y) => {
      const r = radiusAt(y) * 1.02;
      return Math.sqrt(Math.max(r * r - dx * dx, 0)) * DEPTH;
    };
    if (ROBE) {
      // Capraz yaka: omuzlardan karsi bele inen iki serit.
      [-1, 1].forEach((side) => {
        const pts = [];
        for (let i = 0; i <= 8; i++) {
          const k = i / 8;
          const dx = side * (0.17 - 0.33 * k);
          const y = 0.08 - 0.75 * k;
          pts.push(new THREE.Vector3(PX + dx, y, frontZ(dx, y) + 0.014));
        }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.028, 8), trim, proc);
      });
      mesh(new THREE.OctahedronGeometry(0.05), line, proc, PX, -0.2, frontZ(0, -0.2) + 0.05).scale.set(0.7, 1.25, 0.5);
      // Kusak, on dugum ve sarkan uclar.
      const sash = mesh(new THREE.TorusGeometry(radiusAt(-0.72) * 1.06, 0.06, 10, 48), trim, proc, PX, -0.72, 0);
      sash.rotation.x = Math.PI / 2;
      sash.scale.y = DEPTH;
      const knotZ = frontZ(0, -0.72) + 0.07;
      mesh(new THREE.SphereGeometry(0.078, 16, 12), trim, proc, PX, -0.72, knotZ);
      [-1, 1].forEach((side) => {
        mesh(new THREE.CapsuleGeometry(0.03, 0.3, 4, 10), trim, proc, PX + side * 0.06, -0.95, knotZ + 0.03).rotation.z = side * 0.18;
      });
      // Katmanli etek: az kenarli koniler kumas kivrimi gibi durur.
      [
        { pts: [[0.64, -1.6], [0.335, -0.76]], seg: 13, mat: clothDark, turn: 0 },
        { pts: [[0.53, -1.22], [0.345, -0.74]], seg: 11, mat: cloth, turn: 0.3 },
      ].forEach((layer) => {
        const skirt = mesh(new THREE.LatheGeometry(layer.pts.map((p) => new THREE.Vector2(p[0], p[1])), layer.seg), layer.mat, proc, PX, 0, 0);
        skirt.scale.z = DEPTH * 1.06;
        skirt.rotation.y = layer.turn;
      });
    }
    // Tulumun ustundeki neon cizgiler: on yuzeyi izleyen egriler ve bel/gogus bantlari.
    if (!ROBE) [-0.6, 0, 0.6].forEach((angle) => {
      const pts = [];
      for (let y = 0.0; y >= -1.3; y -= 0.1) {
        const r = radiusAt(y) * 1.012;
        pts.push(new THREE.Vector3(PX + Math.sin(angle) * r, y, Math.cos(angle) * r * DEPTH));
      }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.009, 6), line, proc);
    });
    if (!ROBE) [-0.72, -0.22].forEach((y) => {
      const band = mesh(new THREE.TorusGeometry(radiusAt(y) * 1.012, 0.009, 6, 64), line, proc, PX, y, 0);
      band.rotation.x = Math.PI / 2;
      band.scale.y = DEPTH;
    });
    mesh(new THREE.CylinderGeometry(0.095, 0.11, 0.3, 20), skin, proc, PX, 0.2, 0);
    if (!ROBE) mesh(new THREE.TorusGeometry(0.125, 0.012, 6, 40), line, proc, PX, 0.1, 0).rotation.x = Math.PI / 2;

    // --- Bas (0.5 yaricapli olcude kurulur, sonra kucultulur) ---
    const head = new THREE.Group();
    head.position.set(PX, 0.58, 0.02);
    head.scale.setScalar(0.7);
    proc.add(head);
    mesh(new THREE.SphereGeometry(0.5, 40, 32), skin, head).scale.y = 1.06;
    mesh(new THREE.SphereGeometry(0.535, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.47), hair, head, 0, 0.05, -0.04).rotation.x = -0.5;
    if (TUTOR.hairStyle === 'bob') {
      // Cene hizasinda kut sac: arkada ve yanaklarda hacim, alinda yana taranmis kahkul.
      mesh(new THREE.SphereGeometry(0.5, 36, 28), hair, head, 0, -0.06, -0.24).scale.set(1.1, 1.08, 0.85);
      [-1, 1].forEach((side) => {
        const lock = mesh(new THREE.SphereGeometry(0.5, 24, 20), hair, head, side * 0.44, -0.1, 0.02);
        lock.scale.set(0.24, 0.8, 0.55);
      });
      const bangs = mesh(new THREE.SphereGeometry(0.5, 32, 24), hair, head, 0.1, 0.27, 0.05);
      bangs.scale.set(0.88, 0.36, 0.92);
      bangs.rotation.z = -0.3;
    } else if (TUTOR.hairStyle === 'wavy') {
      // Omuzlardan gogse dokulen uzun dalgali sac: her tutam kureciklerden bir zincir.
      mesh(new THREE.SphereGeometry(0.5, 32, 24), hair, head, 0, 0.04, -0.12).scale.set(1.1, 1.04, 0.95);
      for (let k = 0; k < 11; k++) {
        const ang = -2.3 + (k / 10) * 4.6; // 0 = ense, +-2.3 = on omuzlar
        const pts = [];
        for (let i = 0; i < 12; i++) {
          const y = 0.2 - i * 0.15;
          const out = 0.45 + Math.max(0, -y - 0.45) * 0.22 + Math.sin(i * 1.5 + k * 1.7) * 0.05;
          const a = ang + Math.sin(i * 1.1 + k) * 0.09;
          pts.push(new THREE.Vector3(Math.sin(a) * out, y, -Math.cos(a) * out * 0.9));
        }
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, 0.115, 8), hair, head);
        const tip = pts[pts.length - 1];
        mesh(new THREE.SphereGeometry(0.115, 12, 10), hair, head, tip.x, tip.y, tip.z);
      }
    } else if (TUTOR.hairStyle === 'bun') {
      mesh(new THREE.SphereGeometry(0.2, 24, 20), hair, head, 0, 0.56, -0.22);
    } else if (TUTOR.hairStyle === 'long') {
      // Omuzlara inen sac: basin arkasinda ve yanlarinda.
      mesh(new THREE.SphereGeometry(0.5, 32, 24), hair, head, 0, -0.22, -0.2).scale.set(1.12, 1.35, 0.8);
    } else if (TUTOR.hairStyle === 'curly') {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        mesh(new THREE.SphereGeometry(0.17, 16, 12), hair, head, Math.cos(a) * 0.36, 0.42 + Math.sin(a * 2) * 0.04, -0.06 + Math.sin(a) * 0.3);
      }
      mesh(new THREE.SphereGeometry(0.2, 16, 12), hair, head, 0, 0.52, -0.02);
    }
    if (TUTOR.elf) {
      // Sactan disari cikan sivri kulaklar.
      [-1, 1].forEach((side) => {
        const ear = mesh(new THREE.ConeGeometry(0.075, 0.36, 12), skin, head, side * 0.57, 0.1, -0.02);
        ear.rotation.z = -side * 1.05;
        ear.scale.z = 0.5;
      });
    }
    if (TUTOR.glasses) {
      [-0.17, 0.17].forEach((x) => {
        mesh(new THREE.TorusGeometry(0.105, 0.014, 8, 28), line, head, x, 0.05, 0.47);
      });
      mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 8), line, head, 0, 0.06, 0.49).rotation.z = Math.PI / 2;
    }
    mesh(new THREE.SphereGeometry(0.085, 16, 12), skin, head, -0.49, -0.02, 0);
    mesh(new THREE.SphereGeometry(0.085, 16, 12), skin, head, 0.49, -0.02, 0);
    const eyes = [-0.17, 0.17].map((x) => {
      const e = mesh(new THREE.SphereGeometry(0.064, 16, 12), ink, head, x, 0.04, 0.452);
      mesh(new THREE.SphereGeometry(0.02, 8, 8), white, e, 0.022, 0.024, 0.052);
      return e;
    });
    mesh(new THREE.SphereGeometry(0.035, 12, 10), skin, head, 0, -0.07, 0.5);
    mesh(new THREE.TorusGeometry(0.1, 0.02, 10, 24, Math.PI), lips, head, 0, -0.17, 0.455).rotation.z = Math.PI;

    // --- Kollar ---
    const SHOULDER = new THREE.Vector3(PX + 0.4, -0.06, 0.04);
    const UP = new THREE.Vector3(0, 1, 0);
    const between = (o, a, b) => {
      const d = new THREE.Vector3().subVectors(b, a);
      const len = Math.max(d.length(), 0.01);
      o.position.copy(a).addScaledVector(d, 0.5);
      o.quaternion.setFromUnitVectors(UP, d.normalize());
      o.scale.set(1, len, 1);
    };
    mesh(new THREE.SphereGeometry(0.12, 20, 16), cloth, proc, SHOULDER.x, SHOULDER.y, SHOULDER.z);
    const upper = mesh(new THREE.CylinderGeometry(0.095, 0.105, 1, 20), cloth, proc);
    const fore = mesh(new THREE.CylinderGeometry(0.068, 0.09, 1, 20), ROBE ? skin : suit, proc);
    const elbowBall = mesh(new THREE.SphereGeometry(0.094, 20, 16), cloth, proc);
    // Can kol: dirsekten bilege dogru genisleyen kumas ve asagi sarkan parca. Kol
    // bilekten once biter ki el acikta kalsin.
    const bellGeo = () => new THREE.CylinderGeometry(0.21, 0.105, 1, 14, 1, true);
    const drapeGeo = () => {
      const g = new THREE.ConeGeometry(0.2, 0.78, 9, 1, true);
      g.rotateX(Math.PI);
      return g;
    };
    const sleeveOn = (a, b) => {
      const end = a.clone().lerp(b, 0.72);
      return { end, mid: a.clone().lerp(b, 0.5) };
    };
    let sleeve = null, drape = null;
    if (ROBE) {
      sleeve = mesh(bellGeo(), clothDark, proc);
      drape = mesh(drapeGeo(), clothDark, proc);
      drape.scale.z = 0.5;
    }
    const cuffGeo = new THREE.TorusGeometry(0.074, 0.012, 6, 32);
    cuffGeo.rotateX(Math.PI / 2);
    const cuff = mesh(cuffGeo, line, proc);
    cuff.visible = !ROBE;
    // Diger kol: tek elli isaretlerde yanda durur, iki elli isaretlerde destek eli kalkar.
    const SHOULDER2 = new THREE.Vector3(PX - 0.4, -0.06, 0.04);
    const DOWN2 = new THREE.Vector3(PX - 0.4, -1.1, 0.3);
    const UP2 = new THREE.Vector3(PX - 0.55, -0.5, 0.8);
    mesh(new THREE.SphereGeometry(0.12, 20, 16), cloth, proc, SHOULDER2.x, SHOULDER2.y, SHOULDER2.z);
    const upper2 = mesh(new THREE.CylinderGeometry(0.095, 0.105, 1, 20), cloth, proc);
    const fore2 = mesh(new THREE.CylinderGeometry(0.068, 0.09, 1, 20), ROBE ? skin : suit, proc);
    const elbowBall2 = mesh(new THREE.SphereGeometry(0.094, 20, 16), cloth, proc);
    let sleeve2 = null, drape2 = null;
    if (ROBE) {
      sleeve2 = mesh(bellGeo(), clothDark, proc);
      drape2 = mesh(drapeGeo(), clothDark, proc);
      drape2.scale.z = 0.5;
    }

    // --- El: avuc + eklemli parmaklar (isaret eli ve aynalanmis destek eli) ---
    const buildHand = () => {
      const group = new THREE.Group();
      proc.add(group);
      mesh(new THREE.SphereGeometry(1, 32, 24), skin, group, 0, 0.42, 0).scale.set(0.39, 0.44, 0.17);
      const chain = (x, y, z, lens, r) => {
        const joints = [];
        let parent = group;
        lens.forEach((len, i) => {
          const j = new THREE.Group();
          if (i === 0) j.position.set(x, y, z);
          else j.position.set(0, lens[i - 1], 0);
          parent.add(j);
          mesh(new THREE.CapsuleGeometry(r * (1 - i * 0.07), len, 6, 14), skin, j, 0, len / 2, 0);
          joints.push(j);
          parent = j;
        });
        return joints;
      };
      const fingers = [
        { x: -0.26, y: 0.72, len: [0.32, 0.23, 0.19], r: 0.098, splay: 0.1 },
        { x: -0.085, y: 0.81, len: [0.36, 0.25, 0.2], r: 0.1, splay: 0.03 },
        { x: 0.09, y: 0.78, len: [0.32, 0.23, 0.19], r: 0.096, splay: -0.05 },
        { x: 0.26, y: 0.68, len: [0.25, 0.18, 0.16], r: 0.084, splay: -0.14 },
      ].map((f) => {
        const j = chain(f.x, f.y, 0, f.len, f.r);
        j[0].rotation.z = f.splay;
        return j;
      });
      return { group, fingers, thumb: chain(-0.3, 0.3, 0.03, [0.24, 0.2, 0.17], 0.105) };
    };
    const main1 = buildHand();
    const hand = main1.group;
    const other = buildHand();

    // Parmak acikliklarini (0 kapali .. 1 acik) elin eklemlerine uygular.
    const setFingers = (h, f) => {
      h.fingers.forEach((j, i) => {
        const c = 1 - f[i + 1];
        j[0].rotation.x = c * 1.35;
        j[1].rotation.x = c * 1.6;
        j[2].rotation.x = c * 0.9;
      });
      // Basparmak kapaninca avucun onune dogru kivrilir.
      const t = 1 - f[0];
      h.thumb[0].rotation.set(t * 0.55, 0, 0.95 - t * 1.5);
      h.thumb[1].rotation.z = -t * 0.5;
      h.thumb[2].rotation.z = -t * 0.45;
    };
    // Kol: dirsek omuz-bilek arasinda asagi/disa dogru bukulur.
    const setArm = (shoulder, to, bend, parts) => {
      const d = new THREE.Vector3().subVectors(to, shoulder);
      const len = Math.max(d.length(), 0.01);
      const half = Math.min(len, 2 * ARM - 0.01) / 2;
      const dir = d.clone().divideScalar(len);
      const perp = bend.clone().addScaledVector(dir, -bend.dot(dir)).normalize();
      const elbow = shoulder.clone().addScaledVector(dir, half).addScaledVector(perp, Math.sqrt(ARM * ARM - half * half));
      between(parts.upper, shoulder, elbow);
      between(parts.fore, elbow, to);
      parts.elbowBall.position.copy(elbow);
      if (parts.sleeve) {
        const at = sleeveOn(elbow, to);
        between(parts.sleeve, elbow, at.end);
        parts.drape.position.set(at.mid.x, at.mid.y - 0.36, at.mid.z);
      }
    };

    const RELAXED = [0.7, 0.7, 0.7, 0.7, 0.7];
    const wrist = new THREE.Vector3();
    const wrist2 = new THREE.Vector3();
    const hint = new THREE.Vector3(0.5, -1, 0.3);
    const hint2 = new THREE.Vector3(-0.5, -1, 0.3);
    function apply(p) {
      wrist.set(0.62 + p.x * REACH, -0.32 - p.y * REACH, 0.8 + (p.s - 1) * 1.2);
      hand.position.copy(wrist);
      hand.rotation.z = -p.r * DEG;
      hand.scale.setScalar(0.56 * p.s);
      setFingers(main1, p.f);
      setArm(SHOULDER, wrist, hint, { upper, fore, elbowBall, sleeve, drape });
      cuff.position.copy(wrist);
      cuff.quaternion.copy(fore.quaternion);

      // Destek eli: kalkikken avuc kameraya, inikken parmaklar asagi bakar.
      const w = p.ow;
      wrist2.copy(DOWN2).lerp(UP2, w);
      other.group.position.copy(wrist2);
      other.group.rotation.z = (1 - w) * Math.PI;
      other.group.scale.set(-0.56, 0.56, 0.56);
      setFingers(other, (p.o || RELAXED).map((v) => 0.7 + (v - 0.7) * w));
      setArm(SHOULDER2, wrist2, hint2, { upper: upper2, fore: fore2, elbowBall: elbowBall2, sleeve: sleeve2, drape: drape2 });
    }

    // --- Hazir 3B model: iskeletli insan karakteri (yuklenemezse ustteki cizim kalir) ---
    // Mixamo iskeleti (mixamorig... kemik adlari, parmak kemikleri) beklenir.
    let rig = null;
    async function loadRig() {
      const { GLTFLoader } = await import('${LOADER_URL}');
      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      const model = gltf.scene;
      model.visible = false; // kurulum bitene kadar gizli; hata olursa cizim karakter kalir
      scene.add(model);
      scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x30407a, 1.5));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(1.5, 2.5, 4);
      scene.add(key);

      const bone = (name) => {
        let found = null;
        model.traverse((o) => {
          if (!found && o.isBone && o.name.replace(/[^A-Za-z0-9]/g, '').endsWith('mixamorig' + name)) found = o;
        });
        if (!found) throw new Error('kemik yok: ' + name);
        return found;
      };

      // Boyu ayarla ve basi sahnedeki yerine tasi (gogusten yukarisi gorunur).
      model.updateMatrixWorld(true);
      const tall = bone('Head').getWorldPosition(new THREE.Vector3()).y - bone('LeftFoot').getWorldPosition(new THREE.Vector3()).y;
      model.scale.multiplyScalar((RIG_HEIGHT * 0.86) / tall);
      model.updateMatrixWorld(true);
      const headPos = bone('Head').getWorldPosition(new THREE.Vector3());
      model.position.add(new THREE.Vector3(PX, RIG_HEAD_Y, 0).sub(headPos));
      model.updateMatrixWorld(true);

      const wq = (b) => b.getWorldQuaternion(new THREE.Quaternion());
      const wp = (b) => b.getWorldPosition(new THREE.Vector3());

      // Gorunum: model tek parca ve dokulu oldugu icin renkler dokuya gore yeniden
      // boyanir. Sac = boyun ustundeki koyu, renksiz pikseller; ten = kahverengi
      // tonlu (kirmizi > yesil > mavi) pikseller; geri kalan her sey kiyafet/aksesuar.
      if (TUTOR.modelHair || TUTOR.modelSkin || TUTOR.modelSuit) {
        const NL = String.fromCharCode(10);
        const RECOLOR = [
          'vec3 rcPos = -vViewPosition;',
          'float rcMax = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));',
          'float rcSat = rcMax - min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));',
          'float rcLum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));',
          'float rcHead = step(uNeckY, rcPos.y);',
          // Ozel bas takilacaksa modelin kendi basi (sac ve aksesuarlarla) cizilmez.
          'if (uCutHead > 0.5 && rcPos.y > uHeadCutY) discard;',
          'float skinRaw = step(diffuseColor.g * 1.12, diffuseColor.r) * step(diffuseColor.b * 1.08, diffuseColor.g) * smoothstep(0.045, 0.08, rcSat) * smoothstep(0.07, 0.11, diffuseColor.r) * (1.0 - smoothstep(0.45, 0.6, diffuseColor.r));',
          'float hairRaw = rcHead * (1.0 - smoothstep(0.06, 0.13, rcMax)) * (1.0 - smoothstep(0.025, 0.06, rcSat));',
          'if (uCutHead > 0.5 && hairRaw > 0.5) discard;',
          // Toplu sac: basin iki yanina tasan sac parcalari cizilmez.
          'if (uCutPuffs > 0.5 && hairRaw > 0.5 && (abs(rcPos.x - uHeadX) > uHeadR || rcPos.y > uHeadTop)) discard;',
          'diffuseColor.rgb = mix(diffuseColor.rgb, uSkinTint * clamp(rcLum / RIG_SKIN_REF, 0.5, 1.15), uSkinOn * skinRaw);',
          // Tulum olacak ten bolgeleri (kol, karin) once kumas parlakligina indirilir.
          'rcLum = mix(rcLum, 0.05, skinRaw * (1.0 - smoothstep(0.35, 0.6, vHand)) * (1.0 - rcHead));',
          'diffuseColor.rgb = mix(diffuseColor.rgb, uHairTint * (0.7 + rcMax * 3.5), uHairOn * hairRaw);',
          // Siber tulum: boyundan asagi ten olmayan her yer koyu yuzeye doner; bastaki
          // aksesuarlar (gozluk, kulaklik) mor tona cekilir.
          'float suitMask = uSuitOn * (1.0 - rcHead) * (1.0 - skinRaw * smoothstep(0.35, 0.6, vHand));',
          'float gearMask = uGearOn * rcHead * (1.0 - skinRaw) * (1.0 - hairRaw) * smoothstep(0.08, 0.2, rcSat);',
          'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.016, 0.06) + rcLum * vec3(0.03, 0.04, 0.12), suitMask);',
          'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.45, 0.2, 1.0) * (0.25 + rcLum * 1.6), gearMask);',
        ].join(' ').replace('RIG_SKIN_REF', RIG_SKIN_REF.toFixed(3));
        // Neon cizgiler ve kenar isigi (yayilan isik olarak eklenir).
        const GLOW = [
          'vec3 neonA = vec3(0.25, 0.85, 1.0); vec3 neonB = vec3(0.5, 0.42, 1.0);',
          'vec3 neonCol = mix(neonA, neonB, 0.5 + 0.5 * sin(rcPos.y * 2.6 + uTime * 1.2));',
          // Yatay halkalar, dikey hatlar ve araya giren kisa capraz izler.
          'float ringLine = 1.0 - smoothstep(0.0, 0.035, abs(fract(rcPos.y * 1.45 + 0.1) - 0.5));',
          'float colLine = 1.0 - smoothstep(0.0, 0.05, abs(fract((rcPos.x - uHeadX) * 2.3) - 0.5));',
          'float diagLine = (1.0 - smoothstep(0.0, 0.04, abs(fract((rcPos.x - uHeadX) * 3.0 + rcPos.y * 3.0) - 0.5))) * step(0.5, fract(rcPos.y * 1.6));',
          'float flow = 0.55 + 0.45 * sin(rcPos.y * 9.0 - uTime * 3.0);',
          'float facing = smoothstep(0.1, 0.5, normal.z);',
          'float neonRim = pow(1.0 - max(dot(normal, normalize(vViewPosition)), 0.0), 2.6);',
          'totalEmissiveRadiance += suitMask * neonCol * (uLines * max(ringLine, max(colLine * facing, diagLine * 0.0)) * flow * 1.35 + neonRim * 1.3);',
          'totalEmissiveRadiance += uSuitOn * (1.0 - suitMask) * neonCol * neonRim * 0.45;',
        ].join(' ');
        const uniforms = {
          uNeckY: { value: wp(bone('Neck')).y },
          uHairOn: { value: TUTOR.modelHair ? 1 : 0 },
          uSkinOn: { value: TUTOR.modelSkin ? 1 : 0 },
          uSuitOn: { value: TUTOR.modelSuit ? 1 : 0 },
          uHairTint: { value: new THREE.Color(TUTOR.modelHair || '#ffffff') },
          uSkinTint: { value: new THREE.Color(TUTOR.modelSkin || '#ffffff') },
          uCutPuffs: { value: TUTOR.modelHairStyle === 'wavy' || TUTOR.modelHairStyle === 'bun' ? 1 : 0 },
          // Tel kafes aciksa tulumdaki cizgi deseni kapatilir (ikisi ust uste karisik durur).
          uLines: { value: TUTOR.modelWire ? 0 : 1 },
          uCutHead: { value: TUTOR.modelHead ? 1 : 0 },
          uGearOn: { value: TUTOR.modelGear ? 1 : 0 },
          uHeadCutY: { value: wp(bone('Head')).y + RIG_HEAD_CUT },
          uHandRange: { value: new THREE.Vector4(0, -1, 0, -1) },
          uHeadX: { value: wp(bone('Head')).x },
          uHeadR: { value: RIG_HEAD_R },
          uHeadTop: { value: wp(bone('Head')).y + RIG_HEAD_R * 2.3 },
          uTime: time,
        };
        model.traverse((o) => {
          if (!o.isMesh || !o.material) return;
          o.material.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, uniforms);
            // El maskesi: kose, el ve parmak kemiklerine ne kadar bagli? (Iskelet
            // dizisinde el kemigi ile parmaklari art arda gelir.)
            if (o.isSkinnedMesh) {
              const range = (name) => {
                const bones = o.skeleton.bones;
                const start = bones.indexOf(bone(name));
                let end = start;
                bone(name).traverse((b) => {
                  end = Math.max(end, bones.indexOf(b));
                });
                return [start, end];
              };
              const l = range('LeftHand'), r = range('RightHand');
              uniforms.uHandRange.value.set(l[0], l[1], r[0], r[1]);
            }
            shader.vertexShader =
              'varying float vHand; uniform vec4 uHandRange;' +
              NL +
              shader.vertexShader.replace(
                '#include <skinbase_vertex>',
                '#include <skinbase_vertex>' +
                  NL +
                  'vHand = 0.0;' +
                  NL +
                  '#ifdef USE_SKINNING' +
                  NL +
                  'for (int hi = 0; hi < 4; hi++) { float hb = skinIndex[hi]; if ((hb >= uHandRange.x && hb <= uHandRange.y) || (hb >= uHandRange.z && hb <= uHandRange.w)) vHand += skinWeight[hi]; }' +
                  NL +
                  '#endif',
              );
            shader.fragmentShader =
              'varying float vHand; uniform float uNeckY; uniform float uHairOn; uniform float uSkinOn; uniform float uSuitOn; uniform vec3 uHairTint; uniform vec3 uSkinTint; uniform float uCutPuffs; uniform float uHeadX; uniform float uHeadR; uniform float uHeadTop; uniform float uTime; uniform float uLines; uniform float uCutHead; uniform float uHeadCutY; uniform float uGearOn;' +
              NL +
              shader.fragmentShader
                .replace('#include <map_fragment>', '#include <map_fragment>' + NL + RECOLOR)
                .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>' + NL + GLOW);
          };
          o.material.needsUpdate = true;
        });
        if (TUTOR.modelWire) {
          // Tel kafes: modelin kendi ucgen agi neon cizgilerle cizilir; ayni iskelete
          // bagli oldugu icin kollar, eller ve parmaklarla birlikte bukulur.
          const wireMat = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
          });
          wireMat.onBeforeCompile = (shader) => {
            shader.uniforms.uNeckY = uniforms.uNeckY;
            shader.uniforms.uTime = time;
            shader.vertexShader =
              'varying vec3 vWirePos;' +
              NL +
              shader.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>' + NL + 'vWirePos = mvPosition.xyz;');
            shader.fragmentShader =
              'varying vec3 vWirePos; uniform float uNeckY; uniform float uTime;' +
              NL +
              shader.fragmentShader.replace(
                '#include <color_fragment>',
                '#include <color_fragment>' +
                  NL +
                  'if (vWirePos.y > uNeckY) discard; diffuseColor.rgb = mix(vec3(0.4, 0.1, 0.95), vec3(0.04, 0.4, 1.0), 0.5 + 0.5 * sin(vWirePos.y * 2.6 + uTime * 1.2)) * (0.7 + 0.3 * sin(vWirePos.y * 9.0 - uTime * 3.0));',
              );
          };
          const skinned = [];
          model.traverse((o) => {
            if (o.isSkinnedMesh) skinned.push(o);
          });
          skinned.forEach((o) => {
            const wire = new THREE.SkinnedMesh(o.geometry, wireMat);
            wire.position.copy(o.position);
            wire.quaternion.copy(o.quaternion);
            wire.scale.copy(o.scale);
            wire.frustumCulled = false;
            o.parent.add(wire);
            wire.bind(o.skeleton, o.bindMatrix);
          });
        }
        if (TUTOR.modelSuit) {
          // Sinematik isik: iki yandan mor ve altin kenar isiklari.
          const violet = new THREE.PointLight(0xb89af0, 2.2, 0, 0);
          violet.position.set(-3, 1.2, 1.5);
          scene.add(violet);
          const blue = new THREE.PointLight(0xffc766, 2.0, 0, 0);
          blue.position.set(3, 0.2, 1.5);
          scene.add(blue);
        }
      }

      // Bir kemigi, dinlenme yonunden istenen dunya yonune cevirir.
      const aim = (b, restDir, restQ, dir, parentQ) => {
        const q = new THREE.Quaternion().setFromUnitVectors(restDir, dir).multiply(restQ);
        b.quaternion.copy(parentQ.clone().invert().multiply(q));
        return q;
      };

      const tmpQ = new THREE.Quaternion();
      /**
       * Bir kolun (Left: isaret eli, Right: destek eli) T pozundaki dinlenme
       * degerlerini okur ve bilegi verilen noktaya goturen bir kurucu dondurur.
       * Iki kol birbirinin aynasidir; eksenler dinlenme pozundan turetildigi icin
       * ayni formuller ikisinde de calisir.
       */
      const makeArm = (side, bend) => {
        const arm = bone(side + 'Arm'), fore = bone(side + 'ForeArm'), hand = bone(side + 'Hand');
        const shoulder = wp(arm);
        const restArm = { q: wq(arm), dir: wp(fore).sub(wp(arm)).normalize(), parentQ: wq(arm.parent) };
        const restFore = { q: wq(fore), dir: wp(hand).sub(wp(fore)).normalize() };
        const L1 = wp(fore).distanceTo(wp(arm)), L2 = wp(hand).distanceTo(wp(fore));

        // Elin dinlenme eksenleri: parmak yonu, avuc normali ve bukulme ekseni.
        const f0 = wp(bone(side + 'HandMiddle1')).sub(wp(hand)).normalize();
        const side0 = wp(bone(side + 'HandIndex1')).sub(wp(bone(side + 'HandPinky1'))).normalize();
        const n0 = new THREE.Vector3().crossVectors(side0, f0).normalize();
        if (n0.y > 0) n0.negate(); // T pozunda avuc asagi bakar
        const c0 = new THREE.Vector3().crossVectors(f0, n0).normalize();
        const restHandQ = wq(hand);
        const restHandLocal = hand.quaternion.clone();
        const basis0 = new THREE.Matrix4().makeBasis(f0, n0, c0);
        const basis1 = new THREE.Matrix4();

        const joints = ['Index', 'Middle', 'Ring', 'Pinky'].map((name) =>
          [1, 2, 3].map((k) => {
            const b = bone(side + 'Hand' + name + k);
            return { b, rest: b.quaternion.clone(), axis: c0.clone().applyQuaternion(wq(b).invert()) };
          }),
        );
        const thumbDir = wp(bone(side + 'HandThumb2')).sub(wp(bone(side + 'HandThumb1'))).normalize();
        const flex = new THREE.Vector3().crossVectors(thumbDir, n0).normalize();
        const adduct = n0.clone().multiplyScalar(Math.sign(new THREE.Vector3().crossVectors(thumbDir, f0).dot(n0)) || 1);
        const thumb = [1, 2, 3].map((k) => {
          const b = bone(side + 'HandThumb' + k);
          const inv = wq(b).invert();
          return { b, rest: b.quaternion.clone(), flex: flex.clone().applyQuaternion(inv), adduct: adduct.clone().applyQuaternion(inv) };
        });
        const curl = (j, angle) => j.b.quaternion.copy(j.rest).multiply(tmpQ.setFromAxisAngle(j.axis, angle));

        return {
          shoulder,
          reach: L1 + L2,
          /** wrist: bilek hedefi; roll: derece; scale: el olcegi; f: parmaklar; up: 0 el kolun devami .. 1 avuc kameraya. */
          set(wrist, roll, scale, f, up) {
            // Kol: omuz-bilek arasinda dirsek asagi/disa bukulur.
            const d = new THREE.Vector3().subVectors(wrist, shoulder);
            const len = Math.min(Math.max(d.length(), 0.01), L1 + L2 - 0.005);
            const dir = d.normalize();
            const a = (L1 * L1 - L2 * L2 + len * len) / (2 * len);
            const h = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
            const perp = bend.clone().addScaledVector(dir, -bend.dot(dir)).normalize();
            const elbow = shoulder.clone().addScaledVector(dir, a).addScaledVector(perp, h);
            const reach = shoulder.clone().addScaledVector(dir, len);
            const qArm = aim(arm, restArm.dir, restArm.q, elbow.clone().sub(shoulder).normalize(), restArm.parentQ);
            const qFore = aim(fore, restFore.dir, restFore.q, reach.sub(elbow).normalize(), qArm);

            // El: parmaklar yukari (poz donusu kadar yatik), avuc kameraya.
            const r = roll * DEG;
            const f1 = new THREE.Vector3(Math.sin(r), Math.cos(r), 0);
            const n1 = new THREE.Vector3(0, 0, 1);
            basis1.makeBasis(f1, n1, new THREE.Vector3().crossVectors(f1, n1));
            const qHand = new THREE.Quaternion()
              .setFromRotationMatrix(basis1.multiply(basis0.clone().transpose()))
              .multiply(restHandQ);
            const raised = qFore.clone().invert().multiply(qHand);
            hand.quaternion.copy(restHandLocal).slerp(raised, up);
            hand.scale.setScalar(scale);

            joints.forEach((finger, i) => {
              const c = 1 - f[i + 1];
              curl(finger[0], c * 1.4);
              curl(finger[1], c * 1.65);
              curl(finger[2], c * 1.0);
            });
            const t = 1 - f[0];
            thumb.forEach((j, k) => {
              j.b.quaternion
                .copy(j.rest)
                .multiply(tmpQ.setFromAxisAngle(j.adduct, k === 0 ? t * 0.55 : 0))
                .multiply(tmpQ.setFromAxisAngle(j.flex, t * [0.45, 0.6, 0.75][k]));
            });
          },
        };
      };
      // Iki kolun dinlenme degerleri, hicbiri oynatilmadan (T pozunda) okunur.
      const signArm = makeArm('Left', new THREE.Vector3(0.45, -1, 0.1));
      const supportArm = makeArm('Right', new THREE.Vector3(-0.45, -1, 0.1));
      // Destek eli: inikken govdenin yaninda, kalkikken gogus hizasinda.
      const supportDown = supportArm.shoulder.clone().add(new THREE.Vector3(-0.12, -supportArm.reach * 0.97, 0.16));
      const supportUp = new THREE.Vector3(PX - 0.55, RIG_WRIST[1] - 0.1, RIG_WRIST[2]);
      const headBone = bone('Head');
      const headRest = headBone.quaternion.clone();

      // Ozel bas: stilize yuz ve mavi-mor omuz hizasi sac. Birim yaricapli kurulur,
      // RIG_FACE_R ile olceklenir ve kafa kemigine baglanir.
      if (TUTOR.modelHead) {
        const std = (c, rough) => new THREE.MeshStandardMaterial({ color: c, roughness: rough });
        const flat = (c) => new THREE.MeshBasicMaterial({ color: c });
        const skinM = std(TUTOR.modelSkin || TUTOR.skin, 0.6);
        const hairA = std(0x3f55d8, 0.55);
        const hairB = std(0x7b4ff0, 0.55);
        hairA.emissive = new THREE.Color(0x10206a);
        hairB.emissive = new THREE.Color(0x2a1470);
        const g = new THREE.Group();
        const put = (geo, m, x, y, z) => {
          const o = new THREE.Mesh(geo, m);
          o.position.set(x || 0, y || 0, z || 0);
          g.add(o);
          return o;
        };
        const sphere = (r) => new THREE.SphereGeometry(r, 28, 22);
        const lock = (points, r, m) =>
          put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), 32, r, 10), m);

        // Yuz: oval kafatasi, sivrilen cene, kulaklar.
        put(sphere(1), skinM).scale.set(0.92, 1.08, 0.95);
        put(sphere(0.62), skinM, 0, -0.55, 0.12).scale.set(1, 1, 0.9);
        [-1, 1].forEach((s) => {
          put(sphere(0.16), skinM, s * 0.9, -0.08, -0.02).scale.set(0.5, 1, 0.8);
          // Goz: ak, iris, bebek, parlama, ust kirpik cizgisi ve kas.
          put(sphere(0.2), flat(0xffffff), s * 0.36, 0.02, 0.8).scale.set(1, 1.15, 0.45);
          put(sphere(0.125), flat(0x5fb3a8), s * 0.36, 0.02, 0.868).scale.set(1, 1, 0.4);
          put(sphere(0.065), flat(0x10122a), s * 0.36, 0.02, 0.905).scale.set(1, 1, 0.4);
          put(sphere(0.032), flat(0xffffff), s * 0.36 + 0.05, 0.08, 0.93);
          const lash = put(new THREE.TorusGeometry(0.21, 0.028, 8, 20, Math.PI), flat(0x161430), s * 0.36, 0.03, 0.86);
          lash.scale.y = 0.85;
          const brow = put(new THREE.TorusGeometry(0.26, 0.03, 8, 18, Math.PI * 0.6), flat(0x232a70), s * 0.37, 0.14, 0.86);
          brow.rotation.z = Math.PI * 0.2;
          brow.scale.y = 0.7;
          put(sphere(0.13), new THREE.MeshBasicMaterial({ color: 0xff9aa8, transparent: true, opacity: 0.28 }), s * 0.55, -0.3, 0.72).scale.z = 0.3;
        });
        put(sphere(0.07), skinM, 0, -0.22, 0.95).scale.y = 1.2;
        put(sphere(1), flat(0xd96a8a), 0, -0.47, 0.845).scale.set(0.2, 0.05, 0.08);
        put(sphere(1), flat(0xe88aa2), 0, -0.535, 0.83).scale.set(0.17, 0.06, 0.08);

        // Sac: tepe, ense hacmi, omuza inen yan tutamlar ve yana taranmis kahkul.
        const cap = put(new THREE.SphereGeometry(1.07, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.5), hairA, 0, 0.05, -0.05);
        cap.rotation.x = -0.5;
        put(sphere(1.05), hairA, 0, -0.2, -0.32).scale.set(1.05, 1.25, 0.85);
        [-1, 1].forEach((s) => {
          lock([[s * 0.8, 0.5, 0.3], [s * 1.0, -0.15, 0.3], [s * 0.98, -0.85, 0.34], [s * 0.86, -1.35, 0.42]], 0.21, hairA);
          lock([[s * 0.92, 0.3, 0.0], [s * 1.08, -0.4, 0.02], [s * 1.02, -1.0, 0.1], [s * 0.9, -1.45, 0.2]], 0.2, hairB);
        });
        lock([[-0.3, 1.0, 0.4], [0.3, 0.86, 0.82], [0.82, 0.42, 0.72], [1.0, -0.1, 0.45]], 0.22, hairA);
        lock([[-0.3, 1.0, 0.4], [-0.72, 0.66, 0.62], [-0.96, 0.12, 0.42]], 0.2, hairB);

        g.scale.setScalar(RIG_FACE_R);
        g.position.copy(wp(headBone)).add(new THREE.Vector3(RIG_FACE[0], RIG_FACE[1], RIG_FACE[2]));
        scene.add(g);
        headBone.attach(g);
      }

      // Eklenen sac: kafa kemigine baglanir, basla birlikte oynar.
      if (TUTOR.modelHairStyle) {
        const hairMat = new THREE.MeshStandardMaterial({ color: TUTOR.modelHair || 0xf1f2f8, roughness: 0.75 });
        const extra = new THREE.Group();
        extra.position.copy(wp(headBone)).add(new THREE.Vector3(RIG_HAIR[0], RIG_HAIR[1], RIG_HAIR[2]));
        scene.add(extra);
        let seed = 11;
        const rnd = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };
        if (TUTOR.modelHairStyle === 'messy') {
          // Daginik: basin cevresine rastgele yonlere bakan tutamlar.
          for (let i = 0; i < 70; i++) {
            const az = rnd() * Math.PI * 2, el = 0.1 + rnd() * 1.4;
            const dir = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
            if (dir.z > 0.4 && dir.y < 0.8) continue; // yuz acik kalsin
            const len = 0.2 + rnd() * 0.28;
            const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.045 + rnd() * 0.045, len, 7), hairMat);
            const lean = dir
              .clone()
              .add(new THREE.Vector3((rnd() - 0.5) * 1.1, (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 1.1))
              .normalize();
            tuft.position
              .set(dir.x * RIG_HAIR_SIZE[0], dir.y * RIG_HAIR_SIZE[1], dir.z * RIG_HAIR_SIZE[2])
              .addScaledVector(lean, len * 0.35);
            tuft.quaternion.setFromUnitVectors(UP, lean);
            extra.add(tuft);
          }
        } else if (TUTOR.modelHairStyle === 'bun') {
          // Arkada duzgunce toplanmis sac: basi saran duz hacim ve tepe-arkada topuz.
          const R = RIG_HEAD_R;
          const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.09, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.46), hairMat);
          cap.position.set(0, -R * 0.05, -R * 0.1);
          cap.rotation.x = -0.62;
          extra.add(cap);
          const back = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 28, 20), hairMat);
          back.position.set(0, -R * 0.1, -R * 0.3);
          back.scale.set(1.0, 1.0, 0.8);
          extra.add(back);
          const bun = new THREE.Mesh(new THREE.SphereGeometry(R * 0.5, 24, 18), hairMat);
          bun.position.set(0, R * 0.85, -R * 0.75);
          extra.add(bun);
          const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.3, R * 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: 0x9b6bff }));
          band.position.set(0, R * 0.62, -R * 0.55);
          band.rotation.x = Math.PI / 2 - 0.75;
          extra.add(band);
        } else {
          // Acik dalgali sac: tepeyi orten hacim ve omuzlara, gogse dokulen dalgali tutamlar.
          const R = RIG_HEAD_R;
          const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.44), hairMat);
          cap.position.set(0, -R * 0.05, -R * 0.12);
          cap.rotation.x = -0.62;
          extra.add(cap);
          for (let k = 0; k < 15; k++) {
            const ang = -2.1 + (k / 14) * 4.2; // 0 = ense, +-2.1 = yanaklarin yani
            const pts = [];
            for (let i = 0; i < 11; i++) {
              const y = R * 0.7 - i * R * 0.36;
              const out = R * 1.06 + Math.max(0, -y - R * 0.6) * 0.24 + Math.sin(i * 1.45 + k * 1.7) * R * 0.13;
              const a2 = ang + Math.sin(i * 1.1 + k) * 0.1;
              pts.push(new THREE.Vector3(Math.sin(a2) * out, y, -Math.cos(a2) * out * 0.92));
            }
            extra.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, R * 0.2, 8), hairMat));
            const tip = new THREE.Mesh(new THREE.SphereGeometry(R * 0.2, 10, 8), hairMat);
            tip.position.copy(pts[pts.length - 1]);
            extra.add(tip);
          }
        }
        headBone.attach(extra);
      }

      const wrist = new THREE.Vector3();
      const wrist2 = new THREE.Vector3();
      const RELAXED = [0.7, 0.7, 0.7, 0.7, 0.7];

      rig = {
        apply(p) {
          wrist.set(RIG_WRIST[0] + p.x * RIG_REACH, RIG_WRIST[1] - p.y * RIG_REACH, RIG_WRIST[2] + (p.s - 1) * 1.0);
          signArm.set(wrist, p.r, RIG_HAND_SCALE * (0.9 + 0.1 * p.s), p.f, 1);
          // Destek eli: tek elli pozlarda inik, iki ellilerde kalkik.
          const w = p.ow;
          wrist2.copy(supportDown).lerp(supportUp, w);
          supportArm.set(wrist2, 0, 1 + (RIG_HAND_SCALE - 1) * w, (p.o || RELAXED).map((v) => 0.7 + (v - 0.7) * w), w);
        },
        idle(s) {
          headBone.quaternion
            .copy(headRest)
            .multiply(tmpQ.setFromEuler(new THREE.Euler(Math.sin(s * 0.9) * 0.03, 0.12 + Math.sin(s * 0.6) * 0.05, Math.sin(s * 1.3) * 0.02)));
        },
      };
      model.visible = true;
      proc.visible = false;
    }
    // Model en fazla RIG_WAIT_MS beklenir; gelmezse cizim karakterle devam edilir.
    if (MODEL_URL) await Promise.race([
      loadRig().catch((e) => console.warn('Sirius avatar modeli yuklenemedi:', e)),
      new Promise((resolve) => setTimeout(resolve, RIG_WAIT_MS)),
    ]);

    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const mix = (a, b, t) => a + (b - a) * t;
    const start = performance.now();
    function frame() {
      // rAF zaman damgasi bazi WebView'lerde guvenilir degil; saati kendimiz okuruz.
      const now = performance.now();
      const segment = STEP_MS + HOLD_MS;
      const elapsed = (now - start) % (segment * POSES.length);
      const i = Math.floor(elapsed / segment);
      const t = ease(Math.min((elapsed - i * segment) / STEP_MS, 1));
      const a = POSES[i], b = POSES[(i + 1) % POSES.length];
      const pose = {
        f: a.f.map((v, k) => mix(v, b.f[k], t)),
        x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), r: mix(a.r, b.r, t), s: mix(a.s, b.s, t),
        // Destek eli: biri tek elliyse sekli korur, sadece inip kalkar.
        o: a.o && b.o ? a.o.map((v, k) => mix(v, b.o[k], t)) : (b.o || a.o),
        ow: mix(a.ow, b.ow, t),
      };
      if (rig) rig.apply(pose);
      else apply(pose);
      // Canlilik: hafif bas hareketi ve goz kirpma.
      const s = (now - start) / 1000;
      if (rig) rig.idle(s);
      head.rotation.set(Math.sin(s * 0.9) * 0.03, 0.2 + Math.sin(s * 0.6) * 0.05, Math.sin(s * 1.3) * 0.03);
      const blink = s % 3.6 < 0.12 ? 0.1 : 1;
      eyes.forEach((e) => (e.scale.y = blink));
      time.value = s;
      halo.forEach((ring, i) => {
        ring.material.opacity = 0.55 + Math.sin(s * 2 + i * 1.6) * 0.3;
        ring.rotation.z = s * (i % 2 ? -0.25 : 0.35);
      });
      if (fit()) {
        renderer.render(scene, camera);
        // Ilk gercek kare cizilince haber ver; cizilemezse uygulama 2B cizime duser.
        if (!announced) {
          announced = true;
          send({ type: 'ready' });
        }
      }
      requestAnimationFrame(frame);
    }
    let announced = false;
    requestAnimationFrame(frame);
  }

  main().catch((e) => send({ type: 'error', message: String(e && e.message ? e.message : e) }));
</script>
</body>
</html>`;
}
