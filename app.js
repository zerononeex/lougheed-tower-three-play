import { TOWER, ZONES, FAMILIES, HOMES, PLANS, ROOM_DROPINS } from './data.js';

const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, html = '') => Object.assign(document.createElement(tag), attrs, html && { innerHTML: html });
const FLOORS = 37;

/* ---------- Tower explorer ---------- */
const bands = $('#bands');
const list = $('#floor-list');
const T = TOWER, canvasH = T.above + T.imgH;
const pct = (v, of) => `${(v / of) * 100}%`;
Object.assign($('#elev-img').style, { width: pct(T.imgW, T.cropW), left: pct(-T.cropX, T.cropW), top: pct(T.above, canvasH) });
bands.style.aspectRatio = `${T.cropW} / ${canvasH}`;

// edges[n] = top y of floor n (photo px); edges[0] = ground
const edges = [T.ground, (T.ground + T.podiumTop) / 2, T.podiumTop];
T.rows.forEach((y, i) => edges.push(i + 1 < T.rows.length ? (y + T.rows[i + 1]) / 2 : y - (T.rows[i - 1] - y) / 2));
while (edges.length <= FLOORS) edges.push(edges.at(-1) - T.pitchAbove);
const lerp = ([a, b], y) => a + ((b - a) * y) / 480;

for (let n = 1; n <= FLOORS; n++) {
  const podium = n <= 2, top = edges[n], bottom = edges[n - 1];
  const left = podium ? T.podiumLeft : lerp(T.left, bottom), right = podium ? T.podiumRight : lerp(T.right, bottom);
  const b = h('button', { type: 'button', className: 'band' + (podium ? ' podium' : '') + (top < 0 ? ' ghost' : '') + (n === 32 ? ' anchor' : ''), ariaLabel: `Floor ${n}` });
  b.dataset.n = n;
  b.dataset.label = podium ? `Podium · Floor ${n}` : n === 32 ? 'Level 32 · Sky Garden' : `Floor ${n}`;
  Object.assign(b.style, {
    top: pct(top + T.above, canvasH), height: pct(bottom - top, canvasH),
    left: pct(left - T.cropX, T.cropW), width: pct(right - left, T.cropW),
  });
  bands.append(b);
  list.prepend(h('li', {}, `<button type="button" data-n="${n}"${n === 32 ? ' class="anchor" title="Sky Garden"' : ''}>${n}</button>`));
}

let floor = 0;
function selectFloor(n) {
  floor = Math.min(FLOORS, Math.max(1, n));
  document.querySelectorAll('[data-n]').forEach(el => el.classList.toggle('sel', +el.dataset.n === floor));
  $('#floor-num').value = floor;
  const zones = ZONES.filter(z => floor >= z.from && floor <= z.to);
  const fams = FAMILIES.filter(f => f.plan && !!f.ph === zones.some(z => z.penthouse));
  $('#floor-panel').innerHTML = `<h2>${floor === 32 ? 'Level 32 — Sky Garden' : `Floor ${floor}`}</h2>` + zones.map(z => `
    <div class="zone">
      <h3>${z.name}</h3><p class="muted">${z.from === z.to ? `Floor ${z.from}` : `Floors ${z.from}–${z.to}`}</p>
      <p>${z.line}</p>
    </div>`).join('') + (zones.some(z => z.plans) ? `
    <h3>Representative plans for this floor</h3>
    <p class="muted small">The developer does not publish which plans sit on which floor.</p>
    <div class="plan-btns">${fams.map(f => `<button type="button" class="btn" data-plan="${f.plan}">${f.name} · 3D</button>`).join('')}</div>` : '');
}
const pick = e => e.target.dataset.n && selectFloor(+e.target.dataset.n);
bands.addEventListener('click', pick);
list.addEventListener('click', pick);
$('#floor-down').onclick = () => selectFloor(floor ? floor - 1 : 1);
$('#floor-up').onclick = () => selectFloor(floor + 1);

/* ---------- Available homes + plans ---------- */
$('#home-cards').innerHTML = HOMES.map(m => `
  <article class="card">
    <p class="tag">Published example</p>
    <h3>${m.unit}</h3>
    <p>${m.spec}</p>
    ${m.price ? `<p class="price">${m.price}</p>` : ''}<small>${m.src}</small>
    ${m.plan ? `<button type="button" class="btn" data-plan="${m.plan}">Open representative 3D</button>` : ''}
  </article>`).join('');
$('#plan-cards').innerHTML = FAMILIES.map(f => `
  <article class="card">
    <h3>${f.name}</h3>
    <p>${f.spec}</p>
    <small>${f.note}</small>
    ${f.plan ? `<button type="button" class="btn" data-plan="${f.plan}">Open 3D model</button>` : ''}
  </article>`).join('');

/* ---------- Register (demo) ---------- */
$('#register-form').addEventListener('submit', e => {
  e.preventDefault();
  $('#register-msg').textContent = 'Demo only — nothing was sent or saved.';
});

/* ---------- 3D viewer ---------- */
const dlg = $('#viewer');
const info = $('#room-info');
const HINT = 'Drag to rotate · scroll or pinch to zoom · right-drag or two fingers to pan · click a room.';
const ftIn = ft => { const i = Math.round(ft * 12); return `${Math.floor(i / 12)}'${i % 12}"`; };
const area = pts => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0) / 2);
let viewer, plan;

function pickRoom(room) {
  if (!room) return;
  const xs = room.points.map(p => p[0]), ys = room.points.map(p => p[1]);
  const dims = `${ftIn(Math.max(...xs) - Math.min(...xs))} × ${ftIn(Math.max(...ys) - Math.min(...ys))} · ${Math.round(area(room.points))} SF`;
  const dropped = `${plan.id}-${room.id}.jpg`;
  const src = ROOM_DROPINS.includes(dropped) ? `assets/rooms/${dropped}` : room.image;
  if (!src) {
    info.innerHTML = `<b>${room.name}</b> · ${dims} — Marketing image not published for this room`;
    return;
  }
  info.innerHTML = `<b>${room.name}</b> · ${dims}`;
  $('#lb-img').src = src;
  $('#lb-img').alt = room.name;
  $('#lb-title').textContent = room.name;
  $('#lb-note').textContent = src === room.image ? `— ${room.imageNote}` : '— concept image for this plan';
  $('#lightbox').showModal();
}

async function openPlan(id) {
  plan = PLANS[id];
  $('#viewer-title').textContent = plan.name;
  $('#viewer-specs').textContent = `${plan.sf.toLocaleString()} SF interior + ${plan.outdoorSf} SF ${plan.outdoorLabel} · ceiling ${plan.ceilingLabel}`;
  $('#viewer-label').textContent = plan.label;
  info.textContent = HINT;
  dlg.showModal();
  try {
    viewer ??= (await import('./viewer3d.js')).createViewer($('#viewer-canvas'), pickRoom);
  } catch {
    info.textContent = 'The 3D viewer could not load Three.js from unpkg.com — check your connection.';
    return;
  }
  $('#v-xray').setAttribute('aria-pressed', false);
  viewer.load(plan);
  viewer.start();
}
document.addEventListener('click', e => { const id = e.target.dataset?.plan; if (id) openPlan(id); });
$('#v-close').onclick = () => dlg.close();
dlg.addEventListener('close', () => viewer?.stop());
$('#v-top').onclick = () => viewer?.topDown();
$('#v-xray').onclick = e => {
  const on = e.target.getAttribute('aria-pressed') !== 'true';
  e.target.setAttribute('aria-pressed', on);
  viewer?.setXray(on);
};
$('#lb-close').onclick = () => $('#lightbox').close();
