// Stylized 3D massing model of the whole of Tower Three: the Tower Explorer's second view.
// Generated procedurally from the TOWER calibration in data.js (measured on assets/07-aerial-day-t3-focus.jpg).
// The rendering is a reference for proportion, colour and mood only; nothing is textured with a photo.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const FLOORS = 37;
/* Scale. Model units are metres, but only proportions come from the image. One assumption fixes the
   scale: a typical floor-to-floor of 2.9 m (the published 8'6" ceilings plus a slab). */
const TYPICAL_H = 2.9;
// Read off asset 07 by eye (not part of the facet calibration):
const CORNER_X = 1137;    // the near corner: right edge of the white spine, where the front face begins
const GROUND_Y = 972;     // street level under the near corner (the podium base is below slab line 0)
const CAP = { left: 1102, corner: 1142, right: 1180, h: 8.5, westInset: 3 }; // roof crown cap: edges in px, height in m
const PODIUM = { x0: -2, east: 49, proud: 5, back: 4 }; // podium footprint beyond the tower (m), estimated from the photo
const SLAB = 0.3, LEDGE = 0.3, BAY_OUT = 1.4, PARAPET = 1.1;
const HAZE = '#c6ddec'; // horizon haze: the sky's lowest band, and the fog colour

const C = {
  front: '#7f9db3', west: '#a3b6c3', back: '#8a9eae',
  slab: '#f5f4f0', cap: '#d9d2c4', capSide: '#c9c1b2',
  podGlass: '#4f7389', podWarm: '#b59d7f', stone: '#cdc3b2', podSlab: '#eeece6',
  grass: '#86a464', terrace: '#6f9a4f', plaza: '#cbc5b8', street: '#8e958b', road: '#62666b', trunk: '#6b5440',
  ctx: '#c5c8cc', gold: '#ffd45c', goldFill: '#f0b43c', pin: '#2f6f6a', sky: '#1f5a3b',
};

// fixed seed: the same trees grow on every load
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const avg = ([a, b]) => (a + b) / 2;
const slope = (f, j) => { const [y0, y1] = f.lines[j - f.from]; return (y1 - y0) / (f.x[1] - f.x[0]); };

/** Floor plates from the facet calibration. Exported so the derivation can be checked.
 *  Plan axes: x runs along the front (blue) face from the near corner to the east end; z runs out of the
 *  front face, so the west face is the plane x = 0 and the plate is x ∈ [0, east], z ∈ [−depth, 0]. */
export function towerPlan(T) {
  const f = T.facets;
  // Camera from the two faces' slab slopes at mid-height (line 18). For a horizontal line at angle a to the
  // image plane seen from a pitch-down angle p, the image slope is tan(a)·sin(p); the faces are perpendicular,
  // so slopeW · slopeE = −sin²(p).
  const sw = slope(f.west, 18), se = slope(f.east, 18);
  const sinP = Math.sqrt(-sw * se), pitch = Math.asin(sinP);
  const aW = Math.atan(sw / sinP), aE = Math.atan(-se / sinP); // aW + aE = 90°
  // vertical scale: the corner (spine) slab spacing, 37 floors from line 0 to line 37
  const sp = f.spine.lines, pxFloor = (avg(sp[0]) - avg(sp[37])) / 37;
  const k = pxFloor / (TYPICAL_H * Math.cos(pitch)); // image px per metre before foreshortening
  const alongW = px => px / (k * Math.cos(aW)), alongE = px => px / (k * Math.cos(aE));
  const depth = alongW(CORNER_X - f.west.x[0]);  // west face incl. the spine
  const east = alongE(f.east.x[1] - CORNER_X);    // front face incl. the balcony bay
  const crownEast = alongE(f.crownEast.x[1] - CORNER_X); // floors above the step
  const bay = [alongE(f.bay.x[0] - CORNER_X), alongE(f.bay.x[1] - CORNER_X)];
  const spine = alongW(CORNER_X - f.spine.x[0]);
  // floor heights from the spine slab spacing; a spacing over 1.2 typical is a taller floor
  const base = (GROUND_Y - avg(sp[0])) / pxFloor * TYPICAL_H;
  const floors = [];
  let y = base;
  for (let n = 1; n <= FLOORS; n++) {
    const r = (avg(sp[n - 1]) - avg(sp[n])) / pxFloor;
    const h = (r > 1.2 ? r : 1) * TYPICAL_H;
    floors[n] = { n, y0: y, h, x1: n > T.stepBelow ? crownEast : east };
    y += h;
  }
  // crown cap: its west face spans CAP.left→corner, its front face corner→right
  const cx0 = CAP.westInset, cz1 = ((CAP.corner - CORNER_X) / k - cx0 * Math.cos(aE)) / Math.cos(aW);
  const cap = { x0: cx0, x1: cx0 + alongE(CAP.right - CAP.corner), z0: cz1 - alongW(CAP.corner - CAP.left), z1: cz1 };
  return { floors, roof: y, base, depth, east, crownEast, bay, spine, cap,
    camera: { pitchDeg: pitch * 180 / Math.PI, westDeg: aW * 180 / Math.PI, eastDeg: aE * 180 / Math.PI, pxPerM: k } };
}

function boxGeo(x0, x1, y0, y1, z0, z1) {
  return new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
}
// Box faces in BoxGeometry order: +x, −x, +y, −y, +z, −z. Per-face vertex colours, and u (and optionally v)
// scaled to metres so a texture repeats every `ru` m along and `rv` m up.
function paintedBox(x0, x1, y0, y1, z0, z1, cols, ru = 1.5, rv = 0) {
  const g = boxGeo(x0, x1, y0, y1, z0, z1);
  const col = new Float32Array(24 * 3), uv = g.attributes.uv.array;
  const lens = [z1 - z0, z1 - z0, 0, 0, x1 - x0, x1 - x0];
  const c = new THREE.Color();
  for (let f = 0; f < 6; f++) {
    c.set(cols[f]);
    for (let v = f * 4; v < f * 4 + 4; v++) {
      c.toArray(col, v * 3);
      if (lens[f]) { uv[v * 2] *= lens[f] / ru; if (rv) uv[v * 2 + 1] *= (y1 - y0) / rv; } else uv[v * 2] = uv[v * 2 + 1] = 0.02;
    }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

function canvasTex(w, h, draw) {
  const cv = Object.assign(document.createElement('canvas'), { width: w, height: h });
  draw(cv.getContext('2d'));
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
// window wall: pale frame mullions and a spandrel band at the slab (one tile = 1.5 m × one floor)
const mullionTexture = () => canvasTex(64, 64, g => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#dfe5ea'; g.fillRect(0, 0, 4, 64);
  g.fillStyle = '#e8ecef'; g.fillRect(0, 52, 64, 12);
});
// podium curtain wall: vertical fins
const finTexture = () => canvasTex(32, 32, g => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#c9d3d9'; g.fillRect(0, 0, 5, 32);
});
// grey neighbours: faint floor bands only
const bandTexture = () => canvasTex(16, 32, g => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 16, 32);
  g.fillStyle = '#e4e6e8'; g.fillRect(0, 26, 16, 6);
});
const radialTexture = () => canvasTex(128, 128, g => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(40,46,52,.42)'); gr.addColorStop(0.55, 'rgba(40,46,52,.18)'); gr.addColorStop(1, 'rgba(40,46,52,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
// daytime sky dome: deep blue overhead to a pale haze at the horizon; also baked into the environment map
function skyDome() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color('#4a8fcb') }, mid: { value: new THREE.Color('#9fcbe8') },
      horizon: { value: new THREE.Color(HAZE) }, ground: { value: new THREE.Color('#c9cbc4') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, horizon, ground; varying vec3 vP;
      void main(){ float h = vP.y;
        vec3 c = h > 0.0 ? mix(mix(horizon, mid, smoothstep(0.0, 0.1, h)), top, smoothstep(0.1, 0.55, h)) : mix(horizon, ground, smoothstep(0.0, 0.1, -h));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), mat);
}

export function createTower3D(host, { T, label, onPick, onAmenity, amenityLabel, skyLabel }) {
  const plan = towerPlan(T);
  const { floors, roof, base, depth: DEP, east: E, crownEast: EC, bay, spine, cap } = plan;
  const rand = rng(3);
  const cx = E / 2, cz = -DEP / 2;

  /* ---------- renderer, scene, lights ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // static scene: render the shadow map once
  renderer.domElement.className = 't3d-canvas';
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(skyDome());
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(skyDome());
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();
  scene.fog = new THREE.Fog(HAZE, 260, 950);

  scene.add(new THREE.HemisphereLight('#dcebf7', '#8c8a7c', 1.15));
  // the aerial's sun: high, from the left of the photo, so the west face is the lit one
  const sun = new THREE.DirectionalLight('#fff4e2', 2.3);
  sun.position.set(cx - 330, 300, cz + 60);
  sun.target.position.set(cx, 0, cz);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 50, far: 1100 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.4;
  scene.add(sun, sun.target);

  /* ---------- building ---------- */
  const mat = {
    glass: new THREE.MeshStandardMaterial({ vertexColors: true, map: mullionTexture(), roughness: 0.32, metalness: 0.1, envMapIntensity: 0.7 }),
    podium: new THREE.MeshStandardMaterial({ vertexColors: true, map: finTexture(), roughness: 0.3, metalness: 0.1, envMapIntensity: 0.7 }),
    slab: new THREE.MeshStandardMaterial({ color: C.slab, roughness: 0.8 }),
    podSlab: new THREE.MeshStandardMaterial({ color: C.podSlab, roughness: 0.8 }),
    rail: new THREE.MeshStandardMaterial({ color: '#d9e8ef', roughness: 0.2, transparent: true, opacity: 0.55 }),
    cap: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }),
    terrace: new THREE.MeshStandardMaterial({ color: C.terrace, roughness: 1 }),
    planter: new THREE.MeshStandardMaterial({ color: '#5f8a45', roughness: 0.95, flatShading: true }),
    gold: new THREE.MeshStandardMaterial({ color: C.gold, emissive: C.goldFill, emissiveIntensity: 0.9, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    goldFill: new THREE.MeshBasicMaterial({ color: C.goldFill, transparent: true, opacity: 0.32, depthWrite: false }),
    goldLine: new THREE.LineBasicMaterial({ color: C.gold }),
  };
  const bucket = { glass: [], podium: [], podSlab: [], slab: [], rail: [], cap: [], terrace: [] };
  const slabGeo = [], glassBand = [];
  const P = { x0: PODIUM.x0, x1: PODIUM.east, z0: -DEP - PODIUM.back, z1: PODIUM.proud };
  const podTop = floors[2].y0; // podium roof = slab line 1, so Floor 1 is the podium's top band
  const WALL = [C.back, C.west, 0, 0, C.front, C.back]; // +x (east end), −x (west), top, bottom, +z (front), −z (back)

  // the tower: a slab plate + window wall per floor, from Floor 2 (above the podium roof) to Floor 37
  for (let n = 2; n <= FLOORS; n++) {
    const f = floors[n], below = floors[n - 1];
    // slab under floor n: one plate width, the edge showing as a ledge; on the crown step it spans the
    // wider floor below, so the Sky Garden terrace is Floor 32's own slab
    const sx1 = Math.max(f.x1, below.x1);
    const sg = [boxGeo(-LEDGE, sx1 + LEDGE, f.y0, f.y0 + SLAB, -DEP - LEDGE, LEDGE),
      boxGeo(bay[0], bay[1], f.y0, f.y0 + SLAB, LEDGE, BAY_OUT)]; // the balcony bay: a shallow continuous ledge strip on the front
    slabGeo[n] = mergeGeometries(sg);
    bucket.slab.push(...sg);
    const gy0 = f.y0 + SLAB, gy1 = f.y0 + f.h;
    bucket.glass.push(paintedBox(0, f.x1, gy0, gy1, -DEP, 0, WALL));
    // bay balconies: lighter glass rail on the ledge
    bucket.rail.push(boxGeo(bay[0], bay[1], gy0, gy0 + 1.05, BAY_OUT - 0.08, BAY_OUT));
    glassBand[n] = [boxGeo(-0.12, f.x1 + 0.12, gy0, gy1, -DEP - 0.12, 0.12)];
  }
  // Sky Garden terrace on the exposed plate at Level 32: green surface, glass guard, planters
  const f32 = floors[32], yT = f32.y0 + SLAB;
  bucket.terrace.push(boxGeo(EC + 0.05, E - 0.2, yT, yT + 0.12, -DEP + 0.2, -0.2));
  bucket.rail.push(boxGeo(E - 0.1, E + 0.1, yT, yT + 1.1, -DEP, 0), boxGeo(EC, E, yT, yT + 1.1, -0.1, 0.1), boxGeo(EC, E, yT, yT + 1.1, -DEP - 0.1, -DEP + 0.1));
  // roof over Floor 37 with a parapet, then the crown cap (no floor inside it)
  bucket.slab.push(boxGeo(-LEDGE - 0.2, EC + LEDGE + 0.2, roof, roof + PARAPET, -DEP - LEDGE - 0.2, LEDGE + 0.2));
  const CAPC = [C.capSide, C.cap, C.cap, C.cap, C.capSide, C.capSide];
  bucket.cap.push(paintedBox(cap.x0, cap.x1, roof + PARAPET, roof + PARAPET + CAP.h, cap.z0, cap.z1, CAPC));
  // the crown's planted tier in front of the cap (green on the roof, as in the photo)
  bucket.terrace.push(boxGeo(cap.x0 + 1, cap.x1 - 1, roof + PARAPET, roof + PARAPET + 0.5, cap.z1, -1.2));
  // the white spine on the near corner, podium roof to the parapet
  bucket.slab.push(boxGeo(-0.35, 0.7, podTop, roof + PARAPET + 0.6, -spine, 0.35));

  // podium: one clean mass; warm glass at street level, curtain wall above, a stone block on the corner
  const POD = [C.podGlass, C.podGlass, 0, 0, C.podGlass, C.podGlass];
  const WARM = [C.podWarm, C.podWarm, 0, 0, C.podWarm, C.podWarm];
  const streetH = Math.min(5.5, base * 0.42);
  bucket.podium.push(paintedBox(P.x0 + 0.8, P.x1 - 0.8, 0, streetH, P.z0 + 0.8, P.z1 - 0.8, WARM, 1.2));
  bucket.podium.push(paintedBox(P.x0, P.x1, streetH, podTop, P.z0, P.z1, POD, 1.2));
  bucket.cap.push(paintedBox(P.x0 - 0.3, 7, 0, podTop + 0.6, -7, P.z1 + 0.3, Array(6).fill(C.stone)));
  bucket.podSlab.push(boxGeo(P.x0 - 0.15, P.x1 + 0.15, streetH - 0.4, streetH, P.z0 - 0.15, P.z1 + 0.15)); // canopy line
  bucket.podSlab.push(boxGeo(P.x0 - 0.1, P.x1 + 0.1, podTop, podTop + 0.5, P.z0 - 0.1, P.z1 + 0.1)); // roof edge
  // Floor 1 = the podium's top band: highlighted as that band
  slabGeo[1] = boxGeo(P.x0 - 0.2, P.x1 + 0.2, floors[1].y0, floors[1].y0 + 0.4, P.z0 - 0.2, P.z1 + 0.2);
  glassBand[1] = [boxGeo(P.x0 - 0.15, P.x1 + 0.15, floors[1].y0, podTop, P.z0 - 0.15, P.z1 + 0.15)];

  const building = new THREE.Group();
  const meshes = {};
  for (const [k, list] of Object.entries(bucket)) {
    const mesh = new THREE.Mesh(mergeGeometries(list), mat[k]);
    mesh.castShadow = k !== 'rail';
    mesh.receiveShadow = true;
    meshes[k] = mesh;
    building.add(mesh);
  }
  scene.add(building);

  /* ---------- landscape ---------- */
  const o = new THREE.Object3D();
  const trees = [], planters = [];
  const tree = (x, y, z, s) => trees.push({ x, y, z, s });
  const planter = (x0, x1, y, z0, z1, hgt = 0.6) => planters.push({ x: (x0 + x1) / 2, y: y + hgt / 2, z: (z0 + z1) / 2, w: x1 - x0, h: hgt, d: z1 - z0 });
  const yDeck = podTop + 0.5;
  // podium roof: planters along its front and east rims
  planter(E + 2, P.x1 - 1, yDeck, P.z1 - 1.6, P.z1 - 0.4);
  planter(P.x1 - 1.6, P.x1 - 0.4, yDeck, P.z0 + 1, P.z1 - 1.6);
  for (let x = E + 4; x < P.x1 - 2; x += 4.5) tree(x, yDeck, P.z1 - 3, 0.5);
  // Sky Garden: low planting and two small trees
  planter(EC + 0.5, E - 0.6, yT + 0.12, -1.6, -0.6, 0.55);
  planter(E - 1.6, E - 0.6, yT + 0.12, -DEP + 1, -1.6, 0.55);
  tree(EC + 2.2, yT + 0.12, -DEP / 2, 0.32); tree(E - 3, yT + 0.12, -3.5, 0.3);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(1700, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: C.street, roughness: 1 }));
  ground.receiveShadow = true;
  scene.add(ground);
  const pad = 10, px0 = P.x0 - pad, px1 = P.x1 + pad, pz0 = P.z0 - pad, pz1 = P.z1 + pad;
  const flat = (x0, x1, z0, z1, color, y = 0.06) => { const m = new THREE.Mesh(boxGeo(x0, x1, 0, y, z0, z1), new THREE.MeshStandardMaterial({ color, roughness: 1 })); m.receiveShadow = true; scene.add(m); return m; };
  flat(px0, px1, pz0, pz1, C.plaza);
  // roads: one along the west side (the street in the photo's lower left), one across the front
  flat(px0 - 16, px0 - 2, -1400, 1400, C.road, 0.1);
  flat(-1400, 1400, pz1 + 2, pz1 + 16, C.road, 0.1);
  // green areas: the park strip on the east side (photo right) and a front lawn
  const greens = [[px1 + 2, px1 + 46, pz0 - 30, pz1 + 1], [px0 + 2, P.x0 + 14, P.z1 + 1.5, pz1 - 1], [px1 + 2, px1 + 46, pz1 + 18, pz1 + 60]];
  for (const [a, b, c, d] of greens) flat(a, b, c, d, C.grass, 0.09);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false }));
  catcher.position.set((P.x0 + P.x1) / 2, 0.14, (P.z0 + P.z1) / 2);
  catcher.scale.set(P.x1 - P.x0 + 45, 1, P.z1 - P.z0 + 45);
  scene.add(catcher);
  for (const [a, b, c, d] of greens) {
    const cnt = Math.round((b - a) * (d - c) / 90);
    for (let i = 0; i < cnt; i++) tree(a + 2 + rand() * (b - a - 4), 0, c + 2 + rand() * (d - c - 4), 0.8 + rand() * 0.45);
  }
  // street trees along both roads
  for (let s = -220; s < 220; s += 11) {
    for (const x of [px0 - 0.5, px0 - 17.5]) if (rand() < 0.75) tree(x, 0, cz + s + rand() * 3, 0.75 + rand() * 0.3);
    for (const z of [pz1 + 0.5, pz1 + 17.5]) if (rand() < 0.75) tree(cx + s + rand() * 3, 0, z, 0.75 + rand() * 0.3);
  }
  const crowns = [];
  const trunkMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.3, 1, 5).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: C.trunk, roughness: 1 }), trees.length);
  trees.forEach((t, i) => {
    o.position.set(t.x, t.y, t.z); o.rotation.set(0, 0, 0); o.scale.set(t.s, 3 * t.s, t.s); o.updateMatrix(); trunkMesh.setMatrixAt(i, o.matrix);
    const k = 2 + (rand() < 0.5 ? 1 : 0);
    for (let j = 0; j < k; j++) crowns.push({ x: t.x + (rand() - 0.5) * 1.5 * t.s, y: t.y + (3.3 + j * 1.4 + rand() * 0.5) * t.s, z: t.z + (rand() - 0.5) * 1.5 * t.s, r: (2 - j * 0.42) * t.s });
  });
  const crownMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true }), crowns.length);
  const green = new THREE.Color();
  crowns.forEach((c, i) => {
    o.position.set(c.x, c.y, c.z); o.rotation.set(rand() * 3, rand() * 3, 0); o.scale.setScalar(c.r); o.updateMatrix(); crownMesh.setMatrixAt(i, o.matrix);
    crownMesh.setColorAt(i, green.setHSL(0.23 + rand() * 0.07, 0.36 + rand() * 0.14, 0.3 + rand() * 0.09));
  });
  const planterMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat.planter, planters.length);
  planters.forEach((p, i) => { o.position.set(p.x, p.y, p.z); o.rotation.set(0, 0, 0); o.scale.set(p.w, p.h, p.d); o.updateMatrix(); planterMesh.setMatrixAt(i, o.matrix); });
  for (const m of [trunkMesh, crownMesh, planterMesh]) { m.castShadow = true; m.receiveShadow = true; scene.add(m); }

  // neighbouring towers: abstract grey masses placed roughly where the aerial shows them (not models of them)
  const GREY = Array(6).fill(C.ctx);
  const ctx = [
    [-84, -60, -112, -88, 128], [0, 28, -138, -112, 140], [70, 92, -34, -12, 74], [-146, -124, -30, -8, 96],
    [118, 138, -110, -90, 92], [70, 88, -170, -150, 104], [-46, -24, -190, -168, 72], [-136, -118, 72, 90, 58],
  ];
  // each near mass is its own mesh so it can fade out while it stands between the camera and Tower Three
  const bandMap = bandTexture();
  const ctxMat = () => new THREE.MeshStandardMaterial({ vertexColors: true, map: bandMap, roughness: 0.95, transparent: true, opacity: 1 });
  const near = ctx.map(([x0, x1, z0, z1, h]) => {
    const m = new THREE.Mesh(paintedBox(x0, x1, 0, h, z0, z1, GREY, 3, TYPICAL_H), ctxMat());
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    return { m, box: new THREE.Box3(new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x1, h, z1)), fade: 1 };
  });
  const far = [];
  for (let i = 0; i < 9; i++) { // low-detail far field
    const a = i / 9 * Math.PI * 2 + rand() * 0.4, r = 300 + rand() * 300, w = 22 + rand() * 24, d = 18 + rand() * 20, h = 18 + rand() * 50;
    far.push(paintedBox(-w / 2, w / 2, 0, h, -d / 2, d / 2, GREY, 3, TYPICAL_H).rotateY(rand() * Math.PI).translate(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r));
  }
  const ctxMesh = new THREE.Mesh(mergeGeometries(far), new THREE.MeshStandardMaterial({ vertexColors: true, map: bandMap, roughness: 0.95 }));
  ctxMesh.castShadow = ctxMesh.receiveShadow = true;
  scene.add(ctxMesh);

  /* ---------- pins: amenity centre (podium roof) and Level 32 Sky Garden ---------- */
  const pins = [];
  function addPin({ x, y, z, h, color, text, onClick, tag }) {
    const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 });
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 6).translate(0, h / 2, 0), m), new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12).translate(0, h, 0), m));
    g.position.set(x, y, z);
    g.traverse(c => { c.userData.pin = tag; });
    scene.add(g);
    const btn = Object.assign(document.createElement('button'), { type: 'button', className: `t3d-pin t3d-pin-${tag}`, textContent: text });
    btn.addEventListener('click', onClick);
    host.append(btn);
    pins.push({ top: new THREE.Vector3(x, y + h, z), btn, group: g });
    return g;
  }
  addPin({ x: P.x1 - 6, y: yDeck, z: P.z1 - 7, h: 7, color: C.pin, text: amenityLabel, onClick: onAmenity, tag: 'amenity' });
  addPin({ x: (EC + E) / 2, y: yT + 0.12, z: -4, h: 5, color: C.sky, text: skyLabel, onClick: () => onPick(32), tag: 'sky' });
  const chip = Object.assign(document.createElement('span'), { className: 'floor-chip t3d-chip', hidden: true });
  host.append(chip);

  /* ---------- selection highlight (same gold treatment as the photo view) ---------- */
  const hiSlab = new THREE.Mesh(new THREE.BufferGeometry(), mat.gold);
  const hiFill = new THREE.Mesh(new THREE.BufferGeometry(), mat.goldFill);
  const hiLine = new THREE.LineSegments(new THREE.BufferGeometry(), mat.goldLine);
  hiSlab.visible = hiFill.visible = hiLine.visible = false;
  hiFill.renderOrder = 2;
  scene.add(hiSlab, hiFill, hiLine);
  let floor = 0;
  function setFloor(n) {
    floor = n || 0;
    const on = floor >= 1 && floor <= FLOORS;
    hiSlab.visible = hiFill.visible = hiLine.visible = on;
    if (!on) { chip.hidden = true; return; }
    hiSlab.geometry = slabGeo[floor];
    hiFill.geometry.dispose();
    hiFill.geometry = mergeGeometries(glassBand[floor]);
    hiLine.geometry.dispose();
    hiLine.geometry = mergeGeometries(glassBand[floor].map(g => new THREE.EdgesGeometry(g)));
    chip.textContent = label(floor);
    chip.hidden = false;
  }

  /* ---------- camera + controls ---------- */
  const H = roof + PARAPET + CAP.h;
  const center = new THREE.Vector3(cx, H * 0.46, cz);
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 5000);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, screenSpacePanning: true, minDistance: 35, maxDistance: 650,
    minPolarAngle: 0.12, maxPolarAngle: Math.PI / 2 - 0.04, rotateSpeed: 0.7, autoRotateSpeed: 0.45 });
  controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  // slow auto-rotate until the first pointer interaction, then never again
  controls.addEventListener('start', () => { controls.autoRotate = false; });
  // panning stays near the building and above the ground
  controls.addEventListener('change', () => {
    const t = controls.target;
    t.y = THREE.MathUtils.clamp(t.y, 2, H);
    const dx = t.x - cx, dz = t.z - cz, r = Math.hypot(dx, dz);
    if (r > 110) { t.x = cx + dx * 110 / r; t.z = cz + dz * 110 / r; }
  });
  // wheel at a zoom limit scrolls the page instead of being swallowed (no scroll trap)
  host.addEventListener('wheel', e => {
    if (e.ctrlKey) return;
    const d = camera.position.distanceTo(controls.target);
    if ((e.deltaY > 0 && d >= controls.maxDistance * 0.99) || (e.deltaY < 0 && d <= controls.minDistance * 1.01)) e.stopPropagation();
  }, { capture: true });

  // azimuth −45° looks at the near corner with the west face on the left and the front on the right, as in
  // the aerial; the pitch defaults to the one derived from the photo
  function view(azimuthDeg = -45, elevDeg = plan.camera.pitchDeg) {
    const a = THREE.MathUtils.degToRad(azimuthDeg), el = THREE.MathUtils.degToRad(elevDeg);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(H * 0.62 / tanV, 48 / (tanV * camera.aspect)); // whole tower + podium in frame, also on a phone
    controls.target.copy(center);
    camera.position.set(cx + Math.sin(a) * Math.cos(el) * dist, center.y + Math.sin(el) * dist, cz + Math.cos(a) * Math.cos(el) * dist);
    controls.update();
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return false;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return true;
  }
  let framed = false;
  new ResizeObserver(() => { if (resize() && !framed) { framed = true; view(); } }).observe(host);

  /* ---------- picking: a tap (not a drag) selects the floor under it ---------- */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const pickables = [meshes.glass, meshes.slab, meshes.podium, meshes.podSlab, meshes.rail, meshes.terrace, meshes.cap, ...pins.map(p => p.group)];
  const floorAtY = y => { for (let n = 1; n <= FLOORS; n++) { const f = floors[n]; if (y >= f.y0 - 0.01 && y < f.y0 + f.h) return n; } return 0; };
  const capTop = roof + 0.01;
  const floorOf = hit => {
    if (hit.object.userData.pin) return 0;
    const y = hit.point.y;
    if (y >= capTop) return 0;                    // parapet + crown cap: no floor
    if (hit.object === meshes.podium || hit.object === meshes.podSlab || hit.object === meshes.cap) return y > podTop + 0.3 ? 0 : floorAtY(y - 0.5); // podium: Floor 1 band only
    return floorAtY(y);
  };
  const hitAt = (clientX, clientY) => {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    camera.updateMatrixWorld();
    ray.setFromCamera(ptr, camera);
    return ray.intersectObjects(pickables, true)[0];
  };
  const pointers = new Map();
  let gesture = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 1) gesture = { x: e.clientX, y: e.clientY, multi: false, moved: false };
    else if (gesture) gesture.multi = true;
  });
  el.addEventListener('pointermove', e => {
    if (gesture && pointers.has(e.pointerId) && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 6) gesture.moved = true;
    if (e.pointerType === 'mouse' && !pointers.size) { const h = hitAt(e.clientX, e.clientY); el.style.cursor = h && (h.object.userData.pin || floorOf(h)) ? 'pointer' : 'grab'; }
  });
  const up = e => {
    if (!pointers.delete(e.pointerId)) return;
    const g = gesture;
    if (pointers.size) return;
    gesture = null;
    if (e.type !== 'pointerup' || !g || g.multi || g.moved) return; // a rotate / pan / pinch never selects
    const hit = hitAt(e.clientX, e.clientY);
    if (!hit) return;
    if (hit.object.userData.pin === 'amenity') return onAmenity();
    if (hit.object.userData.pin === 'sky') return onPick(32);
    const n = floorOf(hit);
    if (n) onPick(n);
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  /* ---------- overlays + loop ---------- */
  const v = new THREE.Vector3();
  const toScreen = p => { v.copy(p).project(camera); return [(v.x + 1) / 2 * host.clientWidth, (1 - v.y) / 2 * host.clientHeight, v.z < 1]; };
  let frame = 0;
  const occluders = [meshes.glass, meshes.slab, meshes.cap];
  const sight = [new THREE.Vector3(cx, 4, cz), new THREE.Vector3(cx, roof * 0.5, cz), new THREE.Vector3(cx, roof, cz), new THREE.Vector3(P.x1, 6, P.z1)];
  const sightRay = new THREE.Ray(), hitP = new THREE.Vector3();
  function fadeNeighbours() { // a grey neighbour in the line of sight to the tower goes see-through
    for (const c of near) {
      const blocks = sight.some(t => {
        sightRay.origin.copy(camera.position); sightRay.direction.copy(t).sub(camera.position).normalize();
        return sightRay.intersectBox(c.box, hitP) && hitP.distanceTo(camera.position) < t.distanceTo(camera.position);
      });
      c.fade += ((blocks ? 0.22 : 1) - c.fade) * 0.25;
      c.m.material.opacity = c.fade;
      c.m.material.depthWrite = c.fade > 0.98;
    }
  }
  function overlays() {
    fadeNeighbours();
    for (const p of pins) {
      const [px, py, ok] = toScreen(p.top);
      p.btn.hidden = !ok;
      // label to the right of the pin head (both pins sit on the east side, so it clears the tower), kept in frame
      const x = Math.min(px + 8, host.clientWidth - p.btn.offsetWidth - 4);
      p.btn.style.transform = `translate(${Math.round(x)}px, ${Math.round(py)}px) translateY(-50%)`;
    }
    if (frame++ % 10 === 0) for (const p of pins) { // fade a pin label when the building is in front of it
      ray.set(camera.position, v.copy(p.top).sub(camera.position).normalize());
      const hit = ray.intersectObjects(occluders, false)[0];
      p.btn.classList.toggle('behind', !!hit && hit.distance < camera.position.distanceTo(p.top) - 1);
    }
    if (floor) {
      // chip beside the selected floor: at its rightmost visible corner, kept inside the frame
      const f = floors[floor], b = floor === 1 ? { x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z1 } : { x0: 0, x1: f.x1, z0: -DEP, z1: 0 };
      let best = null;
      for (const x of [b.x0, b.x1]) for (const z of [b.z0, b.z1]) {
        const [sx, sy, vis] = toScreen(v.set(x, f.y0 + f.h / 2, z));
        if (vis && (!best || sx > best[0])) best = [sx, sy];
      }
      if (best) {
        chip.style.left = `${Math.round(Math.min(best[0] + 6, host.clientWidth - chip.offsetWidth - 4))}px`;
        chip.style.top = `${Math.round(best[1])}px`;
      }
    }
  }
  let wanted = false, onScreen = true, running = false;
  const tick = () => { controls.update(); renderer.render(scene, camera); overlays(); };
  const sync = () => {
    const go = wanted && onScreen;
    if (go === running) return;
    running = go;
    renderer.setAnimationLoop(go ? tick : null);
  };
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; sync(); }).observe(host);
  renderer.shadowMap.needsUpdate = true;

  const api = {
    setFloor,
    selected: () => (hiSlab.visible ? floor : 0), // the floor whose slab is gold
    start() { resize(); wanted = true; sync(); },
    stop() { wanted = false; sync(); },
    view,
    camera, controls,
    info: () => ({ frame, ...renderer.info.render }),
    // viewport coordinates of a floor's front-face centre (used by the verification script)
    floorPoint(n) {
      const f = floors[n], r = el.getBoundingClientRect();
      camera.updateMatrixWorld();
      const [x, y] = toScreen(n === 32 ? v.set((EC + E) / 2 + 2, yT + 0.2, -2) : v.set(Math.min(f.x1, E) * 0.7, f.y0 + f.h * 0.6, 0.15));
      return { x: r.left + x, y: r.top + y };
    },
    plan,
  };
  host.tower3d = api; // handle for devtools and the verification script
  return api;
}
