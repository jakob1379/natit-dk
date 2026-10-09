# Det mangler vi at gøre i Teable

Citaterne i striben under "Hvor endte du?" hentes fra Teable via `functions/api/quotes.js`
(`GET /api/table/{tableId}/record?fieldKeyType=name&take=100`, se
https://help.teable.ai/en/api-reference/record/list-records). Spørgsmålene i striben linker til en Teable-formular.

## 1. Projekt og tabel

- [ ] Opret et projekt (base), fx `natit.dk`, og en tabel, fx `Citater`.
- [ ] Opret felterne med præcis disse navne. Store/små bogstaver og æ/ø/å tæller, for funktionen læser felterne på navn:

  | Felt | Type | Bemærkning |
  | - | - | - |
  | `Citat` | Long Text | påkrævet; vises højst 280 tegn |
  | `Navn` | Single Line Text | påkrævet |
  | `Spor` | Single Select | Fysik, Geografi, Geologi, Kemi, Matematik, Molekylærbiologi og bioteknologi, Økologi og natur |
  | `Årgang` | Number | uden decimaler, fx 2012 |
  | `Nu` | Single Line Text | valgfri: hvor du endte, fx "data scientist hos X" |
  | `Link` | Single Line Text | valgfri: noget du har bygget, forsket i eller lavet. Kun http(s)-links vises |
  | `Godkendt` | Checkbox | sættes kun af os |
  | `Samtykke` | Checkbox | påkrævet i formularen (se GDPR) |
  | `E-mail` | Single Line Text (vis som Email) | valgfri, til at kontakte dem. Vises **aldrig** på siden |

- [ ] Omdøb ikke felterne senere. Hvis et felt omdøbes, også inde i formularen, forsvinder det fra siden.

## 2. Formular

- [ ] Opret en Form view i tabellen (view-sidebaren, `+`, **Form view**).
- [ ] Skjul `Godkendt` i formularen.
- [ ] Gør `Citat`, `Navn` og `Samtykke` påkrævede.
- [ ] Skriv spørgsmålene i feltbeskrivelserne, ikke i feltnavnene, fx:
  - `Nu`: "Hvor endte du?"
  - `Citat`: "Hvad bruger du stadig fra NatIT, hvem ser du stadig, eller hvad har du lavet? Højst 280 tegn."
  - `Link`: "Har du lavet noget, vi skal se? Indsæt et link (valgfrit)."
- [ ] Klik **Share form**, kopiér linket og sæt det ind i `site/index.html` i stedet for `TEABLE_FORM_URL` (sed-linjen øverst i filen).

## 3. GDPR

- [ ] Formularen skal sige tydeligt, at navn, spor, årgang, "Nu", citat og link bliver vist offentligt på natit.dk. Sæt teksten som beskrivelse på `Samtykke`:
  > Jeg giver lov til, at natit.dk viser mit navn, spor, årgang, citat og link offentligt. Min e-mail vises ikke. Skriv til hej@natit.dk, hvis du vil have dit svar fjernet.
- [ ] Sæt kun flueben i `Godkendt`, hvis `Samtykke` er sat.
- [ ] Beslut, hvem der sletter svar på anmodning, og hvor længe ikke-godkendte svar gemmes.

## 4. Adgangstoken

- [ ] Opret et Personal Access Token på https://app.teable.ai/setting/personal-access-token.
- [ ] Scope: kun `record|read`. Adgang: kun dette ene projekt.
- [ ] Vælg en udløbsdato, og sæt en påmindelse. Udløbsdatoen kan ikke ændres bagefter, og når tokenet udløber, viser siden kun de faste citater.
- [ ] Tokenet vises kun én gang. Det må ikke lægges i git, i chat eller i `index.html`.

## 5. Tabel-ID og Cloudflare

- [ ] Find tabel-ID'et: åbn tabellen og kopiér den del af URL'en, der starter med `tbl` (https://help.teable.ai/en/api-doc/get-id).
- [ ] Gem begge værdier som Pages-secrets. Det er samme kommando to gange, uden dashboard og uden `wrangler.toml`:
  ```sh
  nix develop -c wrangler pages secret put TEABLE_TOKEN --project-name natit-dk
  nix develop -c wrangler pages secret put TEABLE_TABLE_ID --project-name natit-dk
  ```
- [ ] Deploy igen (`nix run .#deploy`). Nye variabler gælder først fra næste deploy.

## 6. Moderation

- [ ] Ingenting vises, før `Godkendt` er sat. Fjern fluebenet for at tage et citat ned.
- [ ] Ændringer kan være op til ca. 10 minutter om at slå igennem, fordi svaret caches.
- [ ] Funktionen læser kun de første 100 rækker. Slet eller arkivér gamle afviste svar, før tabellen når derop.

## 7. Første citat

- [ ] Opret Karinas citat som første række: `Citat` = "Ingen er udenfor… Vi begyndte som et lille hold.", `Navn` = "Karina Frederiksen", `Nu` = "studerende, i et interview på natit.ku.dk", `Godkendt` = ✓. Siden viser hende så kun én gang.

## 8. Test lokalt

- [ ] Opret `.dev.vars` i roden af repoet. Den er i `.gitignore`:
  ```
  TEABLE_TOKEN=...
  TEABLE_TABLE_ID=tbl...
  ```
- [ ] `nix develop -c wrangler pages dev ./site`, derefter `curl localhost:8788/api/quotes`. Svaret skal være en liste med kun de godkendte citater. Får du `[]`, står fejlen i wrangler-loggen.
- [ ] Slet `.wrangler/state` for at tømme den lokale cache.
- [ ] Kør testen med `node --test functions/api/quotes.test.mjs`.
