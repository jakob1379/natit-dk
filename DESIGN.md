# natit.dk: design plan

Subject: alumni of Naturvidenskab og IT (KU, DIKU, 2010–2015). Audience: the few hundred people who studied it. Job: get them on the mailing list; second, get one of them to arrange a reunion; third, remember what the education was.

## Pass 1

**Concept.** The page is a lab notebook / scientific paper. Graph paper, fountain-pen ink, one red correction pencil. Every illustration is a live numerical model, because that is what the programme taught (Modellering i naturvidenskab, Numerisk løsning af differentialligninger).

**Colour**

| name    | hex       | role                                              |
|---------|-----------|---------------------------------------------------|
| papir   | `#EDF1EC` | page background (cool graph-paper, not cream)     |
| gitter  | `#D3DED6` | 5 mm grid, axis hairlines (decorative only)       |
| blæk    | `#172A46` | text, plotted lines (12.6:1 on papir)             |
| blæk-2  | `#475A74` | secondary text, captions (6.2:1)                  |
| blyant  | `#8A9AA6` | direction-field ticks, inactive strokes (non-text)|
| rødblyant | `#9B1B21` | the one accent: CTA, live head of a trajectory, active branch (7.2:1) |

**Type.** STIX Two Text (the typeface of scientific journals; its italic is the math-variable italic) for headings and body. Familjen Grotesk (Nordic grotesk) for interface: labels, buttons, captions. Scale from Bringhurst's classic sequence: 14 / 18 / 21 / 24 / 36 / 60 / 72 px. Body 18 px, line-height 1.6, measure ≤ 68ch. Left-aligned everywhere; nothing centred except inside the radial figure.

**Layout (pass 1)**

```
[ natit.dk ]
[ h1 + lead + form ]   [ phase plot ]
[ essence: motto, 180 ECTS bar ]
[ radial tree figure ][ panel ]
[ uses: 3 cards ]
[ timeline ]
[ hvor endte vi ]
[ fest ]
```

**Principles.** (1) One live system: every moving thing is an ODE being integrated, not a decorative tween. (2) Everything else is still. (3) Facts only from the research file; anything inferred is phrased as "du kan bruge den til".

## Review against the brief: what was generic, and what changed

- *Hero split, text left / picture right* is the stock landing page. **Revised:** the hero *is* Fig. 1. The phase plot fills the whole hero with axes and a direction field; the headline and form sit inside the plot frame like a legend box. On mobile the plot drops under the form.
- *Motto as a big centred pull-quote* is a default. **Revised:** the motto is set as a correction in the notebook: "it for it's skyld" struck through in red pencil, the real motto written after it.
- *"Uses" as three rounded cards* is the SaaS kit. **Revised:** a typeset index with hanging headings and plain lists, ruled by the graph-paper grid only.
- *Timeline as a vertical list with dots.* **Revised:** a real plot x-axis (years as ticks, events placed proportionally to their dates, labels alternate above/below). Vertical axis on mobile.
- *Hero motion as random particles* would be decoration. **Revised:** it is a Van der Pol oscillator: wherever a trajectory starts, it ends on the same limit cycle. That is the reunion pitch, told as maths, and captioned honestly.
- Considered viridis colours for the seven tracks; dropped. Seven hues is cognitive load. Tracks are told apart by their glyph, not by colour; red marks only what is active.
- No eyebrows, no caps labels, no mono, no arrows on buttons. Figure numbers ("Fig. 1–4") are kept because the figures really are a numbered sequence in the paper idiom.

## Final layout

```
natit.dk                                      Ikke en officiel KU-side
┌ Fig. 1 ───────────────────────────────────────────────────────────┐
│ h1 Vi læste Naturvidenskab og it.     · · ↗ direction field ↗ · · │
│ lead (scarcity)                          ╭──── limit cycle ────╮  │
│ [ e-mail      ] [ navn ]                 │  trajectories spiral │  │
│ [ Skriv mig på listen ]                  ╰──────────────────────╯  │
│ next-step copy                     caption: Van der Pol, RK4, live│
└───────────────────────────────────────────────────────────────────┘
Essence: ~~it for it's skyld~~ it for naturens og menneskets skyld
         prose (max 62ch)   |  Fig. 2: 180 ECTS = 105 | 45 | 30 bar
Fig. 3:  ┌── radial tree ──────────┐  panel (aria-live)
         │ core (6 topics, 105 ECTS)│  default: the shared core
         │  7 curved branches → glyph│  on select: track, courses,
         │  outer ring: Bioinformatik│  "du kan bruge den til fx…"
         │  Datalogi eScience        │
         └──────────────────────────┘
Uses: hanging-index: roller · anvendelser · kandidat (all / by track)
Fig. 4: 2010 ──┬──────────┬───┬──┬── 2016   (proportional axis)
Hvor endte vi?  honest: no data exists. Invite.
Fest: empty state = invitation. mailto fest@natit.dk
Footer: sources, not affiliated, back to form.
```

## Glyphs (each a small live model, ~44 px radius)

- Fysik: nonlinear pendulum, symplectic Euler.
- Geografi: contour lines of a slowly deforming hill.
- Geologi: strata folding, with a fault offset.
- Kemi: benzene ring, bonds vibrating, Kekulé double bonds resonating.
- Matematik: Riemann sum refining 3 → 6 → 12 → 24 bars under a curve.
- Molekylærbiologi og bioteknologi: rotating double helix, depth by opacity.
- Økologi og natur: Lotka–Volterra phase orbit, RK4.

Pulses travel from the core along each branch to the outer ring. All animation pauses offscreen and in hidden tabs; `prefers-reduced-motion` renders one static, complete frame (full trajectories, full orbit).

## Critique log (from screenshots)

1. Tree labels with a paper-coloured halo (`paint-order: stroke`) garbled text on `textPath`; halos removed, ring labels moved just outside the orbit instead.
2. Tree was too small next to the panel; glyphs enlarged (r 44 → 52, drawings scaled 1.16), figure column widened to 1.7fr, panel made sticky on desktop.
3. Pulses as dots were invisible; replaced with short red dash-streaks travelling core → glyph → ring.
4. Mobile hero rendered the plot above the form, pushing the CTA below the fold; figure now ordered after the form.
5. Timeline year labels collided with downward leaders; years moved above the axis.
6. Hero trajectories crossed the headline; particle layer now shares the direction field's fade mask.
7. Dimmed (non-selected) tracks were 0.42 opacity, too low for text contrast; raised to 0.66 and the core is never dimmed.
8. No-JS: figures are hidden, all seven track descriptions render as a list, form posts directly with native validation.

## Pass 2

**Client feedback.** "IT, ikke it." Less obituary, more celebration of the interdisciplinarity and the community. Use the old Superman-style NatIT shield.

**Concept shift.** From mourning notebook to a proud lab notebook with a superhero badge. The shield sits at the origin of the Van der Pol phase plot, ringed by the limit cycle: every trajectory finds the same orbit, which is the belonging pitch. Cross-disciplinarity is the superpower, named once in the hero lead and nowhere else.

**Palette (sampled from the logo JPEG, then calmed)**

| name  | hex       | role |
|-------|-----------|------|
| blå   | `#074A9B` | logo blue. Hero band and footer only (white 8.5:1, yellow 6.8:1) |
| blæk  | `#0B2350` | text on paper (13.6:1), tree ink |
| blæk-2| `#43587A` | secondary text (6.4:1) |
| rød   | `#C8121B` | logo red deepened for AA: CTA (white 5.9:1), active branch, quote rule (5.3:1 on paper) |
| gul   | `#F1EC3C` | circuit yellow. Only on blue, or as fills with navy outline: limit cycle, tree pulses, ECTS specialisation, selected glyph tint, footer button (navy text 12.3:1). Never text on light |
| papir | `#EEF2F7` | cooler, bluer graph paper |

**Type.** Headlines move to Familjen Grotesk 700, tight tracking, to replace the memo voice. STIX Two Text stays for body, the KU motto and the community quote.

**Copy.** Hero: "Vi kan begge dele." plus a lead about one foot in the lab or field, one in the code, learnt together on small teams at DIKU. New section "Holdet": student quote (Karina Frederiksen, S18), twice-weekly hand-ins, læsegrupper, the DIKU canteen, rusvejledere, the 4 NatIT mentors in 2013/14, the revue group, RKG, fagråd, cafémøder. Closure is one plain timeline row. Removed the promise of a survey mail; people are invited to reply instead.

**Logo moment.** One sequence on load: the shield rises in, flares with a yellow drop-shadow glow that settles, and the limit cycle traces itself around it (`pathLength=1` dash animation). No replay on resize. Reduced motion shows the end state. Logo is `natit-logo.svg` (built separately), so the glow uses `filter: drop-shadow` on the image rather than reaching into its paths.

**Critique log**
1. The caption collided with the axis and ticks: given a solid blue backing.
2. The shield was too small inside the cycle: 2.5 → 2.8 model units.
3. On mobile the CTA fell below the 844 px fold once the shield moved above the headline. Fixed by shrinking the figure to 214 px and tightening the model scale.
4. A red end-dot on the timeline made the closure the emotional climax, so it was removed.
5. The motto had inherited the new sans h2 and was set back to serif, since it is a quote.
6. The footer became a blue bookend with the shield and a yellow CTA.
