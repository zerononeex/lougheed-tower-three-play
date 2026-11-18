// All site data. Facts: docs/blueprint-city-of-lougheed-tower-three.md §1. Prices: §7 (see SOURCES.md).

// Tower explorer calibration, in source pixels of assets/07-aerial-day-t3-focus.jpg (1920×1080).
// Tower Three is the front-centre tower under the "TOWER THREE — MOVE IN TODAY" label, fully in frame.
// The page shows the `crop` window; the SVG overlay uses the same window as its viewBox, so every
// number below is an image pixel and the polygons scale with the photo.
//
// Each visible plane of the tower (a "facet") lists its slab lines, measured separately at the
// facet's left and right edge: lines[i] = [y at x[0], y at x[1]] for slab line (from + i).
// Slab line j is the floor line under floor j+1, so floor n spans line n-1 (bottom) to line n (top).
//   line 0  = podium parapet / lobby head (bottom of floor 1)
//   line 1  = podium roof slab (floor 1's top, floor 2's floor)
//   line 31 = Level 32 Sky Garden terrace slab (parapet foot on the east block)
//   line 37 = crown top slab (under the roof canopy)
// West, spine and the east-face lines were read from window-row / slab-shadow profiles sheared
// along each facet's own slope, then checked by eye at 6-8× zoom. The featureless strips between
// facets (x 1120.5-1128 and 1137-1148) are spanned straight.
// Floors above 31 use crownEast (the stepped-back crown block, east edge x≈1200.5) instead of east.
export const TOWER = {
  img: { w: 1920, h: 1080 },
  crop: { x: 990, y: 360, w: 420, h: 630 },
  stepBelow: 31,
  facets: {
    west: { x: [1081.5, 1120.5], from: 0, lines: [
      [909.5, 929.2], [899.9, 919.5], [890.4, 909.9], [879.6, 899.1], [869.9, 889.4], [860.5, 880.2],
      [851.0, 870.9], [841.7, 861.8], [832.6, 852.0], [823.1, 841.9], [813.6, 832.2], [804.4, 823.0],
      [795.0, 813.2], [785.5, 803.7], [776.0, 794.9], [766.8, 784.7], [757.7, 774.2], [748.2, 764.6],
      [738.5, 755.0], [729.2, 745.3], [720.5, 736.2], [710.9, 726.1], [700.9, 716.2], [691.6, 706.7],
      [682.1, 697.1], [672.7, 686.9], [663.1, 676.8], [654.1, 667.2], [644.7, 657.7], [635.1, 648.0],
      [625.6, 637.5], [615.7, 626.6], [605.7, 616.4], [595.5, 606.3], [585.5, 596.6], [576.1, 586.6],
      [567.1, 576.1], [556.8, 566.6],
    ] },
    spine: { x: [1128, 1137], from: 0, lines: [
      [930.5, 935.1], [920.8, 925.3], [911.0, 915.6], [901.2, 905.8], [891.6, 896.0], [880.6, 886.2],
      [870.9, 876.6], [862.5, 866.9], [852.9, 855.9], [843.2, 846.1], [833.6, 837.5], [823.8, 827.8],
      [813.9, 818.1], [804.2, 808.4], [794.8, 797.4], [785.1, 786.4], [775.1, 776.6], [765.6, 766.8],
      [755.9, 758.1], [746.2, 749.5], [736.5, 739.8], [726.6, 730.0], [717.0, 718.9], [707.2, 709.0],
      [697.5, 700.4], [687.9, 690.6], [678.0, 680.8], [668.2, 669.5], [658.6, 661.3], [648.8, 649.9],
      [638.8, 641.2], [628.9, 630.0], [616.8, 618.5], [604.8, 606.5], [594.9, 596.7], [585.1, 586.9],
      [575.2, 577.0], [565.9, 567.7],
    ] },
    bay: { x: [1148, 1164], from: 0, lines: [
      [930.5, 938.0], [921.0, 928.5], [913.0, 920.2], [904.8, 910.5], [894.8, 900.5], [884.8, 890.5],
      [875.0, 880.5], [865.0, 870.8], [855.0, 860.5], [845.0, 850.5], [835.0, 840.8], [825.2, 830.5],
      [815.2, 820.8], [805.5, 810.8], [795.2, 801.2], [785.5, 791.2], [775.5, 781.2], [765.5, 771.0],
      [755.8, 761.0], [745.5, 751.0], [735.5, 740.8], [725.8, 730.8], [715.8, 720.5], [705.8, 710.5],
      [695.8, 700.2], [685.8, 690.2], [675.5, 680.0], [665.8, 670.0], [655.8, 659.8], [645.5, 649.8],
      [635.8, 639.5], [628.0, 632.7], [618.2, 622.7], [608.4, 612.7], [598.6, 602.9], [588.8, 593.0],
      [579.0, 583.1], [569.0, 573.1],
    ] },
    east: { x: [1166, 1222], from: 0, lines: [
      [937.0, 901.3], [926.1, 892.1], [916.0, 884.9], [906.8, 875.2], [896.5, 865.8], [886.8, 856.3],
      [877.2, 847.0], [867.0, 836.8], [857.0, 828.2], [847.0, 819.0], [837.2, 809.9], [827.5, 800.3],
      [817.5, 790.3], [807.5, 781.1], [797.5, 771.7], [787.5, 762.5], [777.8, 753.0], [768.6, 744.5],
      [757.8, 733.3], [750.0, 724.2], [739.5, 714.8], [729.8, 705.0], [719.5, 695.9], [709.5, 686.2],
      [699.8, 677.0], [689.8, 667.5], [680.0, 657.5], [670.2, 648.6], [660.2, 638.3], [650.5, 629.1],
      [641.3, 619.8], [631.5, 609.5],
    ] },
    crownEast: { x: [1166, 1200.5], from: 31, lines: [
      [631.5, 618.0], [621.0, 607.1], [611.5, 597.6], [600.5, 584.6], [590.0, 575.5], [580.5, 565.7],
      [571.2, 555.2],
    ] },
  },
};

export const ZONES = [
  { from: 1, to: 2, name: 'Podium', line: 'PriceSmart Foods and retail at the base of the tower.' },
  { from: 32, to: 32, name: 'Level 32 — Sky Garden / Sky Lounge', line: 'Lounge seating, picnic tables, an overhead trellis and a live green wall.' },
  { from: 37, to: 37, name: 'Top floors — Penthouse level', line: 'Penthouse 3: 1,561 SF interior + 583 SF outdoor.', penthouse: true },
  { from: 3, to: 37, name: 'Homes', line: 'Residential floors — views to the mountains and the Fraser River, per published listings.', plans: true },
];

// Plan cards. `plan` = id in PLANS (3D model available).
export const FAMILIES = [
  { name: 'Plan A1', spec: '1 Bed · 569 SF interior + 105–108 SF balcony · ceiling 8\'6"', note: 'Traced 3D model available', plan: 'a1' },
  { name: 'Tower Three plan family', spec: 'Homes from ~547 to 1,249 SF · 1, 2 and 3 bedroom + den', note: 'Other plan diagrams are not yet sourced — no 3D model' },
  { name: 'Penthouse 3', spec: '3 Bed + Den · 1,561 SF interior + 583 SF outdoor', note: 'Representative 3D model', plan: 'ph3', ph: true },
];

// Available Homes — published examples only. Each price keeps its source + date.
export const HOMES = [
  { unit: '#1204', spec: '2 Bed / 2 Bath', price: '$773,000 ($818/SF)', src: 'vancouvernewcondos.com, Oct 2026' },
  { unit: '#2506', spec: '2 Bed + Den / 2 Bath · 891 SF + 311 SF exterior', price: '$829,000', src: 'vancouvernewcondos.com, Oct 2026' },
  { unit: '#3105', spec: '2 Bed · 780 SF · MLS® R3178789 · listed by Shape Marketing', price: '$721,000', src: 'MLS® reciprocity, data updated Nov 2, 2026' },
  { unit: '#2004', spec: '2 Bed / 2 Bath · 945 SF + 237 SF exterior', src: 'vancouvernewcondos.com / mikestewart.ca, Oct 2026 — no price published' },
  { unit: 'PH3', spec: '3 Bed + Den · 1,561 SF + 583 SF outdoor · MLS® R3165094 · listed by Shape Marketing', src: 'MLS® reciprocity, data updated Nov 4, 2026 — no price published', plan: 'ph3' },
];

// Room images dropped into assets/rooms/ as <planId>-<roomId>.jpg — list them here so the
// viewer only requests files that exist.
export const ROOM_DROPINS = [];

// 3D unit plans. Format mirrors furnishup/blueprint3d's serialized plan
// (corners / walls / rooms / items); units are feet, x → east, y → south.
// xpos/ypos = item footprint centre; width along x, depth along y; rotation = side the item's
// back faces (0 north, 90 east, 180 south, 270 west). Adding a plan = adding one object here.
const SCHEME_NOTE = 'marketing image — scheme shown, not this plan’s room';
// finishes sampled from assets/02-kitchen.jpg: white flat-panel cabinetry, white quartz, stainless
const FINISHES = { cabinet: '#f2f2f0', counter: '#eceff1', island: '#eceff1', tall: '#c1c2c2', stone: '#d9dde0', vanity: '#f2f2f0' };
export const PLANS = {
  // Traced from assets/03-plan-a1.png (1692×1608). Origin = outer face of the NW exterior wall
  // (px 220, 0); scale 50.29 px/ft so the exterior-face outline (1201×1198 px) = 569 SF and
  // the rooms tile it. Balcony = wall face to railing centreline (px 244–1167 × 1198–1487).
  // Simplified: the small recess off the bedroom's SE corner is not modelled.
  a1: {
    id: 'a1', name: 'Plan A1 — 1 Bedroom', sf: 569, outdoorSf: '105–108', outdoorLabel: 'balcony', ceiling: 8.5, ceilingLabel: '8\'6"',
    label: 'Traced from the developer’s published plan — source in Sources', windowSide: 1, // windows + balcony on the south (+y) side
    finishes: FINISHES,
    corners: {"c0":{x:0,y:0},"c1":{x:9.21,y:0},"c2":{x:12.19,y:0},"c3":{x:23.88,y:0},"c4":{x:23.88,y:23.83},"c5":{x:0,y:23.83},"c6":{x:1.85,y:23.83},"c7":{x:17.6,y:23.83},"c8":{x:15.43,y:0},"c9":{x:15.43,y:0.7},"c10":{x:15.43,y:3.28},"c11":{x:15.43,y:13.24},"c12":{x:12.53,y:8.21},"c13":{x:15.43,y:8.21},"c14":{x:12.53,y:13.24},"c15":{x:15.73,y:13.24},"c16":{x:21.04,y:13.24},"c17":{x:23.88,y:13.24},"c18":{x:21.04,y:9.19},"c19":{x:23.88,y:9.19},"c20":{x:15.43,y:9.19},"c21":{x:15.73,y:9.19},"c22":{x:12.81,y:16.39},"c23":{x:12.81,y:23.83},"c24":{x:0.48,y:23.83},"c25":{x:0.48,y:29.57},"c26":{x:18.83,y:29.57},"c27":{x:18.83,y:23.83}},
    walls: [{corner1:"c0",corner2:"c1"},{corner1:"c2",corner2:"c3"},{corner1:"c3",corner2:"c4"},{corner1:"c0",corner2:"c5"},{corner1:"c5",corner2:"c6"},{corner1:"c6",corner2:"c7",type:"glass"},{corner1:"c7",corner2:"c4"},{corner1:"c8",corner2:"c9"},{corner1:"c10",corner2:"c11"},{corner1:"c12",corner2:"c13"},{corner1:"c14",corner2:"c15"},{corner1:"c16",corner2:"c17"},{corner1:"c18",corner2:"c19"},{corner1:"c20",corner2:"c21"},{corner1:"c22",corner2:"c23"},{corner1:"c24",corner2:"c25",type:"glass",height:3.5},{corner1:"c25",corner2:"c26",type:"glass",height:3.5},{corner1:"c27",corner2:"c26"}],
    rooms: [
      { id: 'kitchen', name: 'Kitchen', points: [[0, 0], [9.21, 0], [9.21, 11.14], [0, 11.14]], image: 'assets/02-kitchen.jpg', imageNote: SCHEME_NOTE },
      { id: 'entry', name: 'Entry', points: [[9.21, 0], [15.43, 0], [15.43, 8.21], [12.53, 8.21], [12.53, 11.14], [9.21, 11.14]] },
      { id: 'bath', name: 'Bath', points: [[15.43, 0], [23.88, 0], [23.88, 9.19], [15.43, 9.19]] },
      { id: 'laundry', name: 'Laundry', points: [[12.53, 8.21], [15.43, 8.21], [15.43, 13.24], [12.53, 13.24]] },
      { id: 'closet', name: 'Walk-in Closet', points: [[15.43, 9.19], [23.88, 9.19], [23.88, 13.24], [15.43, 13.24]] },
      { id: 'dining', name: 'Dining', points: [[0, 11.14], [12.53, 11.14], [12.53, 13.24], [12.81, 13.24], [12.81, 15.51], [0, 15.51]] },
      { id: 'living', name: 'Living', points: [[0, 15.51], [12.81, 15.51], [12.81, 23.83], [0, 23.83]] },
      { id: 'bedroom', name: 'Bedroom', points: [[12.81, 13.24], [23.88, 13.24], [23.88, 23.83], [12.81, 23.83]] },
      { id: 'balcony', name: 'Balcony', outdoor: true, points: [[0.48, 23.83], [18.83, 23.83], [18.83, 29.57], [0.48, 29.57]] },
    ],
    items: [
      { item_type: 'tall', xpos: 4.93, ypos: 1.67, width: 7.95, depth: 1.99 },
      { item_type: 'counter', xpos: 1.99, ypos: 7.56, width: 2.07, depth: 9.55, rotation: 270 },
      { item_type: 'island', xpos: 7.52, ypos: 8.05, width: 2.84, depth: 4.57 },
      { item_type: 'stool', xpos: 9.39, ypos: 6.96 }, { item_type: 'stool', xpos: 9.39, ypos: 9.15 },
      { item_type: 'table', xpos: 7.52, ypos: 13.28, width: 2.98, depth: 2.98 },
      { item_type: 'chair', xpos: 6.36, ypos: 12.13 }, { item_type: 'chair', xpos: 8.67, ypos: 12.13 },
      { item_type: 'chair', xpos: 6.36, ypos: 14.44, rotation: 180 }, { item_type: 'chair', xpos: 8.67, ypos: 14.44, rotation: 180 },
      { item_type: 'sofa', xpos: 2.88, ypos: 19.13, width: 2.59, depth: 7.06, rotation: 270 },
      { item_type: 'sofa', xpos: 5.41, ypos: 21.38, width: 2.49, depth: 2.59, rotation: 270 },
      { item_type: 'coffee', xpos: 6.58, ypos: 17.52, width: 2.15, depth: 2.51 },
      { item_type: 'console', xpos: 12.09, ypos: 19.69, width: 0.89, depth: 3.98, rotation: 90 },
      { item_type: 'bed', xpos: 18.83, ypos: 18, width: 6.66, depth: 4.97, rotation: 90 },
      { item_type: 'nightstand', xpos: 21.58, ypos: 14.68 }, { item_type: 'nightstand', xpos: 21.58, ypos: 21.24 },
      { item_type: 'tub', xpos: 20.42, ypos: 2.03, width: 4.87, depth: 2.49 },
      { item_type: 'wc', xpos: 21.58, ypos: 4.57, rotation: 90 },
      { item_type: 'vanity', xpos: 21.97, ypos: 7.46, width: 1.79, depth: 2.98, rotation: 90 },
      { item_type: 'washer', xpos: 13.96, ypos: 9.7, rotation: 90 }, { item_type: 'washer', xpos: 13.96, ypos: 11.77, rotation: 90 },
      { item_type: 'shelf', xpos: 16.31, ypos: 11.22, width: 1.19, depth: 3.78, rotation: 270 },
      { item_type: 'shelf', xpos: 22.27, ypos: 11.22, width: 1.19, depth: 3.78, rotation: 90 },
    ],
  },
  // Representative: no PH3 diagram is published. Built from MLS® R3165094's figures only —
  // 3 Bed + Den, 1,561 SF interior (52 × 30.02 ft) + 583 SF outdoor (52 × 11.212 ft terrace).
  ph3: {
    id: 'ph3', name: 'Penthouse 3 — 3 Bed + Den', sf: 1561, outdoorSf: 583, outdoorLabel: 'outdoor', ceiling: 8.5, ceilingLabel: 'up to 8\'6"',
    label: 'Representative layout — built from published data; diagram not published',
    finishes: FINISHES,
    corners: {"c0":{x:0,y:0},"c1":{x:52,y:0},"c2":{x:52,y:30.02},"c3":{x:0,y:30.02},"c4":{x:11,y:0},"c5":{x:11,y:12},"c6":{x:14,y:16},"c7":{x:40,y:0},"c8":{x:40,y:16},"c9":{x:0,y:16},"c10":{x:11,y:16},"c11":{x:11,y:30.02},"c12":{x:17,y:16},"c13":{x:17,y:30.02},"c14":{x:25,y:20},"c15":{x:25,y:30.02},"c16":{x:34,y:16},"c17":{x:34,y:30.02},"c18":{x:40,y:30.02},"c19":{x:44,y:16},"c20":{x:52,y:16},"c21":{x:40,y:20},"c22":{x:0,y:-11.212},"c23":{x:52,y:-11.212},"c24":{x:40,y:12}},
    walls: [{corner1:"c0",corner2:"c4",type:"glass"},{corner1:"c4",corner2:"c7",type:"glass"},{corner1:"c7",corner2:"c1",type:"glass"},{corner1:"c1",corner2:"c2"},{corner1:"c2",corner2:"c3"},{corner1:"c3",corner2:"c0"},
      {corner1:"c4",corner2:"c5"},{corner1:"c9",corner2:"c10"},{corner1:"c10",corner2:"c11"},{corner1:"c10",corner2:"c6"},{corner1:"c12",corner2:"c13"},{corner1:"c14",corner2:"c15"},{corner1:"c16",corner2:"c17"},{corner1:"c7",corner2:"c24"},{corner1:"c16",corner2:"c8"},{corner1:"c21",corner2:"c18"},{corner1:"c19",corner2:"c20"},
      {corner1:"c0",corner2:"c22",type:"glass",height:3.5},{corner1:"c22",corner2:"c23",type:"glass",height:3.5},{corner1:"c23",corner2:"c1",type:"glass",height:3.5}],
    rooms: [
      { id: 'bedroom3', name: 'Bedroom 3', points: [[0, 0], [11, 0], [11, 16], [0, 16]] },
      { id: 'living', name: 'Living', points: [[11, 0], [29, 0], [29, 16], [11, 16]] },
      { id: 'kitchen', name: 'Kitchen / Dining', points: [[29, 0], [40, 0], [40, 16], [29, 16]], image: 'assets/02-kitchen.jpg', imageNote: SCHEME_NOTE },
      { id: 'primary', name: 'Primary Bedroom', points: [[40, 0], [52, 0], [52, 16], [40, 16]] },
      { id: 'bedroom2', name: 'Bedroom 2', points: [[0, 16], [11, 16], [11, 30.02], [0, 30.02]] },
      { id: 'bath', name: 'Bath', points: [[11, 16], [17, 16], [17, 30.02], [11, 30.02]] },
      { id: 'den', name: 'Den', points: [[17, 16], [25, 16], [25, 30.02], [17, 30.02]] },
      { id: 'entry', name: 'Entry & Laundry', points: [[25, 16], [34, 16], [34, 30.02], [25, 30.02]] },
      { id: 'closet', name: 'Walk-in Closet', points: [[34, 16], [40, 16], [40, 30.02], [34, 30.02]] },
      { id: 'ensuite', name: 'Ensuite', points: [[40, 16], [52, 16], [52, 30.02], [40, 30.02]] },
      { id: 'terrace', name: 'Terrace', outdoor: true, points: [[0, -11.212], [52, -11.212], [52, 0], [0, 0]] },
    ],
    items: [
      { item_type: 'bed', xpos: 5.5, ypos: 12.6, width: 5, depth: 6.6, rotation: 180 },
      { item_type: 'nightstand', xpos: 2.2, ypos: 15 }, { item_type: 'nightstand', xpos: 8.8, ypos: 15 },
      { item_type: 'sofa', xpos: 20, ypos: 12.5, width: 8, depth: 3, rotation: 180 },
      { item_type: 'coffee', xpos: 20, ypos: 8.5, width: 4, depth: 2.5 },
      { item_type: 'console', xpos: 20, ypos: 0.9, width: 6, depth: 1.5 },
      { item_type: 'counter', xpos: 39, ypos: 7, width: 2, depth: 10, rotation: 90 },
      { item_type: 'tall', xpos: 39, ypos: 14, width: 2, depth: 3.5, rotation: 90 },
      { item_type: 'island', xpos: 34.5, ypos: 7, width: 3.5, depth: 7 },
      { item_type: 'stool', xpos: 32.2, ypos: 5 }, { item_type: 'stool', xpos: 32.2, ypos: 7 }, { item_type: 'stool', xpos: 32.2, ypos: 9 },
      { item_type: 'table', xpos: 33.5, ypos: 13.3, width: 5, depth: 3 },
      { item_type: 'chair', xpos: 32.3, ypos: 11.2 }, { item_type: 'chair', xpos: 34.7, ypos: 11.2 },
      { item_type: 'bed', xpos: 48.6, ypos: 8, width: 6.6, depth: 5, rotation: 90 },
      { item_type: 'nightstand', xpos: 51.2, ypos: 4.6 }, { item_type: 'nightstand', xpos: 51.2, ypos: 11.4 },
      { item_type: 'bed', xpos: 5.5, ypos: 26.6, width: 5, depth: 6.6, rotation: 180 },
      { item_type: 'nightstand', xpos: 2.2, ypos: 29.2 }, { item_type: 'nightstand', xpos: 8.8, ypos: 29.2 },
      { item_type: 'tub', xpos: 14, ypos: 28.7, width: 5, depth: 2.5 },
      { item_type: 'wc', xpos: 15.8, ypos: 17.3, rotation: 90 },
      { item_type: 'vanity', xpos: 12, ypos: 21.5, width: 1.8, depth: 4, rotation: 270 },
      { item_type: 'desk', xpos: 21, ypos: 28.8, width: 5, depth: 2.2, rotation: 180 },
      { item_type: 'chair', xpos: 21, ypos: 26.8, rotation: 180 },
      { item_type: 'washer', xpos: 26.3, ypos: 28.8, rotation: 180 }, { item_type: 'washer', xpos: 28.6, ypos: 28.8, rotation: 180 },
      { item_type: 'console', xpos: 31.5, ypos: 29.3, width: 3.5, depth: 1.2, rotation: 180 },
      { item_type: 'shelf', xpos: 34.9, ypos: 23, width: 1.8, depth: 8, rotation: 270 },
      { item_type: 'shelf', xpos: 39.1, ypos: 23, width: 1.8, depth: 8, rotation: 90 },
      { item_type: 'tub', xpos: 49, ypos: 28.7, width: 5, depth: 2.5 },
      { item_type: 'vanity', xpos: 44, ypos: 29.1, width: 6, depth: 1.8, rotation: 180 },
      { item_type: 'shower', xpos: 49.5, ypos: 19, width: 4, depth: 4 },
      { item_type: 'wc', xpos: 41.3, ypos: 19, rotation: 270 },
      { item_type: 'table', xpos: 14, ypos: -5.5, width: 6, depth: 3 },
      { item_type: 'chair', xpos: 12.5, ypos: -7.7 }, { item_type: 'chair', xpos: 15.5, ypos: -7.7 },
      { item_type: 'chair', xpos: 12.5, ypos: -3.3, rotation: 180 }, { item_type: 'chair', xpos: 15.5, ypos: -3.3, rotation: 180 },
      { item_type: 'lounger', xpos: 42, ypos: -6 }, { item_type: 'lounger', xpos: 45, ypos: -6 },
      { item_type: 'sofa', xpos: 28, ypos: -9, width: 8, depth: 3 },
      { item_type: 'planter', xpos: 2, ypos: -9.5 }, { item_type: 'planter', xpos: 50, ypos: -9.5 },
    ],
  },
};
