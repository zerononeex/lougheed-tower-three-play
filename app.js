import { TOWER, ZONES, FAMILIES, HOMES, PLANS, ROOM_DROPINS } from './data.js';

const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, html = '') => Object.assign(document.createElement(tag), attrs, html && { innerHTML: html });
const FLOORS = 37;

/* ---------- Tower explorer ---------- */
// One SVG <polygon> per floor, in image-pixel space (viewBox = the crop window), so each quad is the
// floor's hit area and its highlight and scales exactly with the photo underneath.
const SVG = 'http://www.w3.org/2000/svg';
const view = $('#tower-view');
const svg = $('#tower-svg');
const chip = $('#floor-chip');
const anchorChip = $('#anchor-chip');
const list = $('#floor-list');
const T = TOWER, C = T.crop;
const pct = (v, of) => `${(v / of) * 100}%`;
Object.assign($('#elev-img').style, { width: pct(T.img.w, C.w), left: pct(-C.x, C.w), top: pct(-C.y, C.h) });
view.style.aspectRatio = `${C.w} / ${C.h}`;
svg.setAttribute('viewBox', `${C.x} ${C.y} ${C.w} ${C.h}`);

// Floor n spans slab line n-1 (bottom) to slab line n (top). Each facet gives every slab line's y at
// its own left and right edge, so the polygon's edges lie on the measured slab lines at every vertex.
function lineAt(j, upper) {
  const f = T.facets, east = upper ? f.crownEast : f.east;
  return [f.west, f.spine, f.bay, east].flatMap(({ x, from, lines }) => {
    const [y0, y1] = lines[j - from];
    return [[x[0], y0], [x[1], y1]];
  });
}
function floorPoints(n) {
  const upper = n > T.stepBelow;
  return [...lineAt(n, upper), ...lineAt(n - 1, upper).reverse()];
}
const labelOf = n => n <= 2 ? `Podium · Floor ${n}` : n === 32 ? 'Level 32 · Sky Garden' : `Floor ${n}`;
// chip sits just right of the floor's east edge, at the quad's mid-height
function placeChip(el, n) {
  const p = floorPoints(n), i = p.length / 2 - 1, r = (p[i][1] + p[i + 1][1]) / 2;
  Object.assign(el.style, { left: pct(p[i][0] + 6 - C.x, C.w), top: pct(r - C.y, C.h) });
}

for (let n = 1; n <= FLOORS; n++) {
  const q = document.createElementNS(SVG, 'polygon');
  q.setAttribute('points', floorPoints(n).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '));
  q.setAttribute('class', 'floor-quad');
  q.setAttribute('role', 'button');
  q.setAttribute('tabindex', '0');
  q.setAttribute('aria-label', n === 32 ? 'Floor 32, Sky Garden' : `Floor ${n}`);
  q.dataset.n = n;
  svg.append(q);
  list.prepend(h('li', {}, `<button type="button" data-n="${n}"${n === 32 ? ' class="anchor" title="Sky Garden"' : ''}>${n}</button>`));
}
placeChip(anchorChip, 32);

let hover = 0;
function showChip() {
  const n = hover || floor;
  chip.hidden = !n;
  anchorChip.hidden = n === 32;
  if (!n) return;
  chip.textContent = labelOf(n);
  placeChip(chip, n);
}
const quadOf = e => e.target.closest?.('.floor-quad');
svg.addEventListener('pointerover', e => { const q = quadOf(e); if (q && !drag) { hover = +q.dataset.n; showChip(); } });
svg.addEventListener('pointerout', e => { if (!e.relatedTarget?.closest?.('.floor-quad')) { hover = 0; showChip(); } });
svg.addEventListener('focusin', e => { const q = quadOf(e); if (q) { hover = +q.dataset.n; showChip(); } });
svg.addEventListener('focusout', () => { hover = 0; showChip(); });
svg.addEventListener('keydown', e => {
  const q = quadOf(e);
  if (!q) return;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectFloor(+q.dataset.n); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    selectFloor((floor || +q.dataset.n) + (e.key === 'ArrowUp' ? 1 : -1));
    svg.querySelector(`[data-n="${floor}"]`).focus();
  }
});

let floor = 0;
let tower3d = null, loading3d = null; // the 3D view, created on first switch
function selectFloor(n) {
  floor = Math.min(FLOORS, Math.max(1, n));
  document.querySelectorAll('[data-n]').forEach(el => el.classList.toggle('sel', +el.dataset.n === floor));
  $('#floor-num').value = floor;
  showChip();
  placeThumb();
  tower3d?.setFloor(floor);
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
const pick = e => e.target.dataset?.n && selectFloor(+e.target.dataset.n);
list.addEventListener('click', pick);
$('#floor-down').onclick = () => selectFloor(floor ? floor - 1 : 1);
$('#floor-up').onclick = () => selectFloor(floor + 1);

/* ---------- Scrub: drag / wheel on the tower moves the selected floor ---------- */
// The rail spans floor 37 (top) to floor 1 (bottom) at the floors' own heights on the image.
const rail = $('.scrub-rail'), thumb = $('#scrub-thumb');
const midY = n => { const p = floorPoints(n); return p.reduce((s, [, y]) => s + y, 0) / p.length; };
const railTop = midY(FLOORS), railBot = midY(1);
Object.assign(rail.style, { top: pct(railTop - C.y, C.h), height: pct(railBot - railTop, C.h) });
function placeThumb() {
  thumb.hidden = !floor;
  if (floor) thumb.style.top = pct(midY(floor) - railTop, railBot - railTop);
}
placeThumb();

// one floor per ~60% of a floor's on-screen height, never less than 10px
const PITCH = (railBot - railTop) / (FLOORS - 1);
const stepPx = () => Math.max(10, 0.6 * PITCH * view.getBoundingClientRect().height / C.h);
let drag = null;
view.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const q = quadOf(e);
  drag = { id: e.pointerId, y0: e.clientY, x0: e.clientX, from: floor, tapped: q ? +q.dataset.n : 0, wasSel: floor, moved: false };
});
view.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dy = e.clientY - drag.y0;
  if (!drag.moved) {
    if (Math.abs(dy) < 6) return;
    drag.moved = true; hover = 0;
    view.setPointerCapture(e.pointerId);
    view.classList.add('scrubbing');
    if (!drag.from) drag.from = drag.tapped || Math.round(FLOORS / 2);
  }
  const n = Math.min(FLOORS, Math.max(1, drag.from - Math.round(dy / stepPx())));
  if (n !== floor) selectFloor(n);
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null;
  view.classList.remove('scrubbing');
  if (d.moved || e.type === 'pointercancel' || !d.tapped) return;
  tapFloor(d.tapped, d.wasSel);
}
// a tap (photo or 3D): select the floor, or, on the already-selected floor, bring its details into view
function tapFloor(n, wasSel = floor) {
  if (n === wasSel) $('#floor-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  else selectFloor(n);
}
view.addEventListener('pointerup', endDrag);
view.addEventListener('pointercancel', endDrag);

// wheel scrubs too, but only swallows the event when it actually changes the floor
let wheelAcc = 0;
view.addEventListener('wheel', e => {
  const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
  const dir = dy < 0 ? 1 : -1;  // wheel up = up the tower
  const next = floor ? floor + dir : dir > 0 ? 1 : 0;
  if (!next || next < 1 || next > FLOORS) { wheelAcc = 0; return; }  // at the ends, let the page scroll
  e.preventDefault();
  wheelAcc += Math.abs(dy);
  if (wheelAcc >= 40 || Math.abs(dy) >= 40) { wheelAcc = 0; selectFloor(next); }
}, { passive: false });

/* ---------- Explorer views: Photo | 3D Model. Both views share `floor` and the side panel. ---------- */
const wrap3d = $('#tower3d');
async function setView(v) {
  const is3d = v === '3d';
  $('#view-toggle').querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
  view.hidden = is3d;
  wrap3d.hidden = !is3d;
  $('#cap-photo').hidden = is3d;
  $('#cap-3d').hidden = !is3d;
  if (!is3d) { tower3d?.stop(); return; }
  try {
    loading3d ??= import('./tower3d.js').then(m => m.createTower3D(wrap3d, {
      T: TOWER, label: labelOf, onPick: n => tapFloor(n),
      amenityLabel: 'Amenity centre — 3 levels', skyLabel: 'Level 32 — Sky Garden',
      onAmenity: () => $('#amenities').scrollIntoView({ behavior: 'smooth', block: 'start' }),
    }));
    tower3d = await loading3d;
  } catch (err) {
    loading3d = null;
    $('#t3d-status').textContent = 'The 3D model could not load Three.js from unpkg.com — check your connection.';
    console.warn(err);
    return;
  }
  $('#t3d-status').hidden = true;
  tower3d.setFloor(floor);
  if (!wrap3d.hidden) tower3d.start(); // still on 3D after loading
}
$('#view-toggle').addEventListener('click', e => e.target.dataset.view && setView(e.target.dataset.view));

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
