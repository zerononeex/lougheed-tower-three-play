# Sources

All facts come from `docs/blueprint-city-of-lougheed-tower-three.md` §1; all prices from §7. Plan data
comes from the developer's published Plan A1 diagram and MLS® R3165094 (PH3). Accessed 2026-11-03
unless noted. SHAPE's own site (https://homes.thecityoflougheed.com) lists available homes but publishes
no prices in page text; every price below is third-party.

> Prices from published third-party databases and MLS® listings — see Sources. Subject to change without
> notice. This is not an offering for sale; verify current pricing and availability with the developer's
> authorized sales representatives.

## Starting price — snapshots (blueprint §7)

| Figure | Source | Date on source | URL |
|---|---|---|---|
| From $555,900 | Presale Properties / presaleproperties.com (Best Presale Condos in Burnaby ranking) | Updated November 2026 | https://presaleproperties.com/best-presale-condos-burnaby-2026 |
| From $650,000 | Presale Homes / presalehomes.ca | "As of October 2026"; page updated Oct 24, 2026 | https://presalehomes.ca/presales/the-city-of-lougheed---tower-three |
| Range $600,000–$1,000,000 | Livabl / livabl.com | Page crawled ~Jul 2026 | https://livabl.com/burnaby-bc/the-city-of-lougheed--tower-three |
| 1 Bed from $611,000 (~$1,136/SF); 2 Bed from $767,000 (~$983/SF) | Vancouver New Condos / vancouvernewcondos.com | "As of late 2025" snapshot on page updated Oct 29, 2026 | https://vancouvernewcondos.com/properties/the-city-of-lougheed-burnaby/ |

## Specific homes — published examples

| Home | Details | Price | Source | Date | URL |
|---|---|---|---|---|---|
| #1204 | 2 Bed / 2 Bath (feature home) | $773,000 ($818/SF) | vancouvernewcondos.com (updated Oct 29, 2026) | Oct 2026 | https://vancouvernewcondos.com/properties/the-city-of-lougheed-burnaby/ |
| #2506 | 2 Bed + Den / 2 Bath, 891 SF int. + 311 SF ext. | $829,000 | vancouvernewcondos.com | Oct 2026 | https://vancouvernewcondos.com/properties/the-city-of-lougheed-burnaby/ |
| #2004 | 2 Bed / 2 Bath, 945 SF int. + 237 SF ext., parking | Not published — no price shown | vancouvernewcondos.com / mikestewart.ca | Oct 2026 | https://vancouvernewcondos.com/properties/the-city-of-lougheed-burnaby/ · https://mikestewart.ca (exact page URL not recorded in the blueprint) |
| #3105, 3888 Evergreen Pl | 2 Bed, 780 SF, MLS® R3178789, listed by Shape Marketing | $721,000 | MLS® reciprocity via moreaurealestate.ca | Data updated Nov 2, 2026 | https://moreaurealestate.ca (exact listing URL not recorded in the blueprint) |
| PH3, 3888 Evergreen Pl | Penthouse 3: 3 Bed + Den, 1,561 SF + 583 SF outdoor, MLS® R3165094, listed by Shape Marketing | Not published — details only | MLS® reciprocity via moreaurealestate.ca / bendovidio.com | Data updated Nov 4, 2026 | https://moreaurealestate.ca · https://bendovidio.com (exact listing URLs not recorded in the blueprint) |

## Market context — resale, NOT developer pricing

| Figure | Source | Date | URL |
|---|---|---|---|
| 8 active listings, average asking $804,988 | bccondosandhomes.com building page | Updated ~Oct–Nov 2026 | https://bccondosandhomes.com (exact page URL not recorded in the blueprint) |
| Past year: 8 sold, average $705,125, ~33 days on market | bccondosandhomes.com | Accessed Nov 2026 | as above |

## Deposits & offers

| Item | Figure | Source | Date | URL |
|---|---|---|---|---|
| Deposit structure | 5% total, at contract signing | presaleproperties.com | Nov 2026 | https://presaleproperties.com/best-presale-condos-burnaby-2026 |

The blueprint also records a historical 2024 mortgage offer; by owner instruction it is not shown on the
site or repeated here.

## Floor plans

| Plan | Data | Status | Source |
|---|---|---|---|
| Plan A1 | 1 Bed, 569 SF interior + 105–108 SF balcony, ceiling 8'6" | **Traced** 3D model from `assets/03-plan-a1.png` (1692×1608) | Official site, homes.thecityoflougheed.com (Homes & Design) |
| Penthouse 3 | 3 Bed + Den, 1,561 SF interior + 583 SF outdoor | **Representative** 3D model — no diagram published | MLS® R3165094 (see above) |

Plan sourcing, 2026-11-04: the Tower Three brochure
(https://res.cloudinary.com/dchom65vv/raw/upload/v1737537238/vdxwrqp9r4yohhz6tb6j.pdf) and the Features PDF
(https://homes.thecityoflougheed.com/documents/features.pdf) were read as text. Neither contains floor-plan
pages, plan names or suite sizes, so no plan images were extracted into `assets/plans/`. The raw PDFs could
not be downloaded from the build environment (proxy 403), so an image-only plan page could not be ruled out
by rendering; the text of both documents has no plan content.

## Images

| File | What | Source |
|---|---|---|
| assets/01-masterplan-aerial-night.jpg | Master plan aerial at night | Official SHAPE site |
| assets/02-kitchen.jpg | Signature SHAPE kitchen (Bosch cooktop) | Official SHAPE site |
| assets/03-plan-a1.png | Official Plan A1 diagram | Official SHAPE site |
| assets/04-customer-care.jpg | Customer care | Official SHAPE site |
| assets/05-tower-photo-renx.jpg | Tower THREE photo, 800×728 (kept; no longer the explorer base — see asset 07) | SHAPE courtesy via RENX |

## Published conflicts (recorded, not resolved)

- **Amenity centre size:** 22,000+ SF (SHAPE brochure, RENX, MLS copy) vs 20,000+ SF (SHAPE Features PDF) vs
  18,000 SF (mikestewart.ca). The brochure governs on the page.
- **Guest suites:** 6 (official brochure) vs 2 (presalehomes.ca amenities list). The brochure governs.
- **Total homes:** 262 everywhere (Livabl, SkyscraperPage, bccondosandhomes, RENX, SHAPE's "262-home
  release") vs 563 on presalehomes.ca — flagged as wrong (possibly a neighbourhood total); never used.
- **Completion:** presaleproperties.com's "March 2026 completion" is wrong — the tower completed July 2023.
  Its price and deposit figures are kept; its completion claim is discarded.

## Fact sources

homes.thecityoflougheed.com (home, /homes, /available-homes, brochure PDF, features PDF) · renx.ca launch
article · livabl.com · skyscraperpage.com · presalehomes.ca · presaleproperties.com · vancouvernewcondos.com ·
mikestewart.ca · MLS® reciprocity mirrors (moreaurealestate.ca, bendovidio.com) · bccondosandhomes.com ·
nexthome.ca cover story.

- `assets/06-aerial-day-labelled.jpg` — Daytime master-plan aerial RENDERING with baked-in labels ("TOWER THREE — MOVE IN TODAY" leader line lands on Tower Three). Frame extracted at 1920×1080 from SHAPE's official hero video `tcl3-hero-en.mp4` on homes.thecityoflougheed.com, accessed 2026-11-04. (The main cityoflougheed.com domain was unreachable from our network; the same labelled visual is the homes site's hero video.)
- `assets/07-aerial-day-t3-focus.jpg` — Treated version of asset 06 (owner direction, 2026-11-04): the three neighbouring built towers are desaturated to grey; Tower Three, sky, and greenery stay in full colour. THIS is the Tower Explorer base image; it replaces the RENX photo (asset 05) — Tower Three is fully in frame (all 37 floors), so no extrapolated outline is needed.

## 3D massing model (explorer second view)

`tower3d.js` is a stylized massing model generated from the facet calibration of asset 07 (`TOWER` in data.js). The rendering is a reference for proportions, colours and mood only; no photo is used as a texture. Assumptions not taken from a source: 2.9 m typical floor-to-floor (sets the scale), podium extent beyond the tower, crown cap size, and the positions of the grey neighbouring masses (abstract, not models of real buildings). Amenity interiors are not modelled; no amenity-centre plan is published.
