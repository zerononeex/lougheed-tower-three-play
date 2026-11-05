# Lougheed Tower Three — interactive sales site

Unofficial concept prototype for Tower THREE at The City of Lougheed: floor explorer over a real tower
photo, a 3D dollhouse of Plan A1 (traced from the developer's published diagram) and a representative
Penthouse 3, published available-home examples, sourced pricing, amenities and master plan.

Static site — no build step. Serve the repo root (`python3 -m http.server`) or use GitHub Pages.
Three.js 0.160.0 loads from unpkg for the 3D viewer only.

- Spec: `docs/blueprint-city-of-lougheed-tower-three.md`
- Sources and conflicts: `SOURCES.md`
- Add a plan: one object in `PLANS` (data.js). Add a room image: drop `assets/rooms/<planId>-<roomId>.jpg`
  and list its filename in `ROOM_DROPINS`.
