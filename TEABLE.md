# Teable og drift

Alt ligger i projektet `natit` (`bseLsvahSoCF1OWvlOM`) på https://app.teable.ai. Ingen tabeller har offentlige formularer: alle formularer ligger på natit.dk og går gennem Workeren, som tjekker input og rate limit, før den skriver til Teable. Mod robotter læner vi os op ad Cloudflares gratis beskyttelse.

| Tabel | ID | Bruges til | Skrives via |
| - | - | - | - |
| `Citater` | `tblFW1AiHL2M6sQvuZd` | Citaterne under "Hvor endte du?" | popup, `POST /api/quote` |
| `Mailliste` | `tblc0NbT3ShlCxvUuPN` | Tilmelding til maillisten | `POST /api/subscribe` |
| `Afmeldinger` | `tblQF46ewA23Jf3XTDC` | Afmelding fra maillisten | `POST /api/unsubscribe` |
| `Arrangementer` | `tbldAIQvH0lucSpwhjo` | Julefrokost og andre arrangementer | kun os, i Teable |
| `Tilmeldinger` | `tblDziiPvSXuOwfHtmM` | Tilmeldinger til alle arrangementer | popup, `POST /api/signup` |

- Koden: `worker.js` sender `/api/*` videre til modulerne i `api/`. Alt andet serveres fra `site/`.
- Workeren skriver på felt-ID'er. Felter må gerne omdøbes, men ikke slettes. `api/quotes.js` læser dog `Citater` på feltnavn, så de felter må ikke omdøbes.
- Teable fra terminalen: `nix develop -c teable table get --base-id bseLsvahSoCF1OWvlOM` (Teables officielle CLI). Dev-shellen læser `TEABLE_PAT` fra `.env`, som er i `.gitignore`. Den nøgle må ikke genbruges som sidens `TEABLE_TOKEN`. Agent-skill: `teableio/agent-skills` (`teable-assistant-ops`).
- Privatlivssiden er `site/privatliv.html` (`natit.dk/privatliv`). Opdatér den, hvis vi gemmer noget nyt eller skifter leverandør.

# Udgivelse på natit.dk

Siden er en Cloudflare Worker med statiske filer, sat op i `wrangler.toml`: domænet `natit.dk`, rate limit på 5 POST pr. minut pr. IP, ingen `workers.dev`-adresse og logs slået til.

- [ ] `natit.dk` skal være en zone på den Cloudflare-konto, der deployer. Ved første deploy opretter Cloudflare selv DNS-record og certifikat. Der må ikke ligge en CNAME på `natit.dk` i forvejen.
- [ ] Slå Cloudflares gratis beskyttelse til på zonen: **Security**, **Bots**, **Bot Fight Mode**.
- [ ] Opret Teable-tokenet (se nedenfor), og gem det som secret:
  ```sh
  nix develop -c wrangler secret put TEABLE_TOKEN
  ```
  `TEABLE_TABLE_ID` står i `wrangler.toml`, for det er ikke en hemmelighed.
- [ ] Deploy: `nix run .#deploy`.
- [ ] Tjek bagefter: `curl -sI https://natit.dk` viser `content-security-policy`, `https://natit.dk/findes-ikke` giver 404, og en tilmelding på siden lander i `Mailliste`.
- [ ] Har du allerede oprettet et Pages-projekt `natit-dk`, så slet det. Det bruges ikke længere.
- `www.natit.dk` er ikke sat op. Vil du have den, så lav en Redirect Rule i Cloudflare fra `www.natit.dk/*` til `https://natit.dk/${1}`.

## Teable-token

- [ ] Opret et Personal Access Token på https://app.teable.ai/setting/personal-access-token.
- [ ] Scope: `record|read` og `record|create`. Adgang: kun projektet `natit`. Læse-scopet bruges af citaterne og til at tjekke, om et arrangement er åbent. Opret-scopet bruges af formularerne.
- [ ] Vælg en udløbsdato, og sæt en påmindelse. Udløbsdatoen kan ikke ændres bagefter. Når tokenet udløber, viser siden kun de faste citater, og formularerne fejler.
- Tokenet vises kun én gang. Det må ikke lægges i git, i chat eller i `index.html`.

## Test lokalt

- [ ] Opret `.dev.vars` i roden af repoet. Den er i `.gitignore`:
  ```
  TEABLE_TOKEN=...
  ```
- [ ] `nix run .#dev`, åbn http://localhost:8787. Formularerne skriver til de rigtige tabeller, så slet testrækkerne bagefter.
- [x] Kør testene med `node --test api/*.test.mjs`.
- Rate limit og cache gemmes i `.wrangler/state`. Slet mappen for at nulstille dem.

# Citater

Citaterne i striben under "Hvor endte du?" hentes af `api/quotes.js`. Spørgsmålene i striben åbner popuppen "Hvor endte du?", som sender til `api/quote.js`.

| Felt | Type | Bemærkning |
| - | - | - |
| `Citat` | Long Text | påkrævet; højst 280 tegn |
| `Navn` | Single Line Text | påkrævet |
| `Spor` | Single Select | Fysik, Geografi, Geologi, Kemi, Matematik, Molekylærbiologi og bioteknologi, Økologi og natur |
| `Årgang` | Number | uden decimaler, fx 2012 |
| `Nu` | Single Line Text | valgfri: hvor du endte |
| `Link` | Single Line Text (vis som URL) | valgfri; kun http(s) |
| `Godkendt` | Checkbox | sættes kun af os. Formularen kan ikke sætte det |
| `Samtykke` | Checkbox | påkrævet i formularen |
| `E-mail` | Single Line Text (vis som Email) | valgfri. Vises **aldrig** på siden |

- Et nyt spor skal tilføjes både i Teable, i `api/quote.js` og i popuppen i `site/index.html`.

## Moderation

- Ingenting vises, før `Godkendt` og `Samtykke` er sat. Fjern `Godkendt` for at tage et citat ned.
- Ændringer kan være op til ca. 10 minutter om at slå igennem, fordi svaret caches.
- `api/quotes.js` læser kun de første 100 rækker. Slet gamle afviste svar, før tabellen når derop.
- Karinas citat står fast i `site/index.html` og vises altid. Hun har ikke givet `Samtykke`, så hun skal ikke oprettes i Teable. Udfylder hun selv formularen, viser siden hende kun én gang.

## GDPR

- [x] Samtykketeksten står ved afkrydsningsfeltet i popuppen.
- [x] Privatlivsside: `natit.dk/privatliv`, linket fra formularerne og bunden af siden.
- [ ] Beslut, hvem der sletter svar på anmodning, og hvor længe ikke-godkendte svar gemmes.
- [ ] Teable Cloud ligger i USA (AWS Oregon) og har endnu ingen GDPR-databehandleraftale. Spørg support@teable.ai om en DPA, eller flyt data til en EU-løsning, fx selvhostet Teable. Indtil da står overførslen til USA på privatlivssiden.
- Sæt kun flueben i `Godkendt`, hvis `Samtykke` er sat. Siden viser kun rækker, hvor begge er sat.

# Maillisten

Tilmelding står øverst på siden, afmelding nederst (`natit.dk/#afmeld`).

- `Mailliste`: `E-mail` (unik), `Navn`, `Tilmeldt`. `Afmeldinger`: `E-mail`, `Modtaget`.
- E-mails gemmes med små bogstaver. En tilmelding med en adresse, der allerede står på listen, svarer "Tak" uden at oprette en ny række, så siden ikke afslører, hvem der er tilmeldt.
- Uden JavaScript kan man ikke bruge formularerne. Siden beder dem skrive til hej@natit.dk.

## Før hver udsendelse

1. Gå `Afmeldinger` igennem: slet den matchende række i `Mailliste`, og slet afmeldingen. Privatlivssiden lover, at e-mailen slettes.
2. Kig `Mailliste` igennem for spam, og kopiér `E-mail` ind i **Bcc**. Aldrig Til eller Cc.
3. Send fra Gmail med `Reply-To: hej@natit.dk`. Gmail tillader ca. 500 modtagere om dagen.
4. Slut hver mail med: *Vil du ikke have flere mails? Afmeld dig på https://natit.dk/#afmeld*.

# Arrangementer

Én tabel med arrangementer og én med tilmeldinger til dem alle. Et nyt arrangement er en ny række, ikke en ny tabel.

| Tabel | Felter |
| - | - |
| `Arrangementer` | `Navn`, `Dato`, `Sted`, `Beskrivelse`, `Tilmelding åben`, `Tilmeldinger` (link), `Kommer` og `Måske` (antal) |
| `Tilmeldinger` | `Navn`, `Arrangement` (link), `Kommer` (Ja/Måske/Nej), `E-mail`, `Kost og allergier`, `Bemærkning`, `Tilmeldt` |

- [x] NatIT Julefrokost 2026 (`recMnXWr0zAMUocMaW2`): lørdag 5. december 2026 kl. 13, sted tba, tilmelding åben. Kortet på siden og popuppen `#julefrokost` er sat op.
- [ ] Sæt linket ind i Facebook-begivenheden: https://natit.dk/#julefrokost åbner tilmeldingen direkte.
- [ ] Opdatér `Sted` i Teable og på kortet og i popuppen i `site/index.html`, når det er på plads.
- [ ] Efter 5. december: fjern `Tilmelding åben`, slet `Kost og allergier` og `Bemærkning` på tilmeldingerne (helbredsoplysninger, lovet slettet i formularen), og fjern kortet og popuppen fra `site/index.html`.

## Sådan bruges det

- Nyt arrangement: opret en række i `Arrangementer`, sæt `Tilmelding åben`, og kopiér julefrokostens kort og popup i `site/index.html` med det nye record-ID i `name="event"`.
- Workeren afviser tilmeldinger til arrangementer, hvor `Tilmelding åben` ikke er sat. Luk tilmeldingen ved at fjerne fluebenet. Tilmeldingerne bliver stående.
- Gæsteliste og allergier: lav en view af `Tilmeldinger` filtreret på `Arrangement` og `Kommer` = Ja.
- Via API: filtrér på arrangementets record-ID, fx `{"conjunction":"and","filterSet":[{"fieldId":"Arrangement","operator":"is","value":"recMnXWr0zAMUocMaW2"}]}` med `fieldKeyType=name`.
- Den samme person kan tilmelde sig flere gange, fx for at ændre sit svar. Den nyeste række efter `Tilmeldt` gælder. Kig gæstelisten igennem for spam før arrangementet.

# Backlog

- [ ] Kalenderfil (`.ics`) og "Tilføj til Google Kalender"-link til julefrokosten, som på magnesbarnedaab.party.
- [ ] Spam: kommer der spam gennem formularerne, så sæt Cloudflare Turnstile foran `/api/*` igen.
