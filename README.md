# natit.dk

For os, der læste Naturvidenskab og IT på Københavns Universitet. Siden samler holdet igen: skriv dig på maillisten, tilmeld dig et arrangement, og fortæl, hvor du endte.

<p align="center">
  <img src=".github/assets/dataflow.svg" width="100%" alt="Diagram over natit.dk: en tilmelding fra forsiden sendes som POST til worker.js, som tjekker rate limit og skriver en ny række i Teable-tabellen Mailliste. Når forsiden hentes, læser Workeren tabellerne Citater og Arrangementer og sætter dem ind i siden.">
</p>

Siden er ikke en officiel side fra Københavns Universitet.

## Sådan virker den

- `worker.js` er en Cloudflare Worker. Den sender `/api/*` videre til modulerne i `api/` og bygger forsiden med `api/page.js`, som sætter citater, arrangementer og juletemaet ind på serveren.
- Alt andet serveres direkte fra `site/`.
- Data ligger i [Teable](https://app.teable.ai): `Mailliste`, `Tilmeldinger`, `Citater` og `Arrangementer`. Formularerne skriver kun gennem Workeren, som tjekker input og højst tillader 5 POST pr. minut pr. IP.
- Siden virker uden JavaScript. Formularerne er almindelige HTML-formularer, og popupperne er HTML `popover`. JavaScript bruges kun til animationerne og til at åbne tilmeldingen direkte fra `/julefrokost`.

| Sti | Indhold |
| - | - |
| `worker.js` | Routing og rate limit |
| `api/` | Formularer (`subscribe`, `unsubscribe`, `signup`, `quote`), læsning af citater og arrangementer, forsiden, og tests |
| `site/` | Statiske filer: forside, fejlside, privatlivsside, logo og julegrafik |
| `wrangler.toml` | Domæne, rate limit og statiske filer |
| `flake.nix` | Dev-shell med `wrangler` og Teables CLI, plus `nix run .#dev` og `nix run .#deploy` |

## Kom i gang

Du skal bruge Nix med flakes.

```sh
nix develop                     # wrangler og teable
node --test api/*.test.mjs      # tests
nix run .#dev                   # http://localhost:8787
```

`wrangler dev` læser `TEABLE_TOKEN` fra `.dev.vars` i roden af repoet. Filen er i `.gitignore`. Lokalt skriver formularerne til de rigtige tabeller, så slet testrækkerne bagefter.

## Udgivelse

```sh
nix develop -c wrangler secret bulk .dev.vars
nix run .#deploy
```

Tjek bagefter, at `curl -sI https://natit.dk` viser `content-security-policy`, og at `https://natit.dk/findes-ikke` giver 404.

## Mere

- [TEABLE.md](TEABLE.md): tabeller, token, moderation af citater, maillisten, arrangementer og hele tjeklisten til udgivelse.
- [DESIGN.md](DESIGN.md): designplanen for siden og dens kritiklog.
- [research/naturvidenskab-og-it.md](research/naturvidenskab-og-it.md): fakta om uddannelsen med kilder.

Julegrafikken i `site/jul/` er fra [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) under MIT-licensen; se [site/jul/LICENSE.txt](site/jul/LICENSE.txt).
