# QA-rapport kampeermeer.com (fase 6)

Datum: 21 oktober 2026 · Branch: `redesign` · Getest: 16 pagina's (incl. bedankt- en 404-pagina)

## Samenvatting

- **Lighthouse ≥ 95 op alle vier categorieën** voor alle indexeerbare pagina's, mobiel én desktop.
- **Toegankelijkheid 100** na twee kleine correcties (contrast grijs, kopvolgorde afspraakpagina).
- **Geen kapotte links**, intern of extern; geen zijwaartse scroll op 360, 768, 1280 of 1600 px.
- Geen cookies, trackers of externe scripts; strenge Content-Security-Policy is mogelijk.

## Lighthouse

Gemeten met Lighthouse 12.8 (headless Chrome) tegen een lokale server met Brotli-compressie en
cacheheaders, vergelijkbaar met Netlify. Mobiel = Moto G-profiel met gesimuleerde 4G-vertraging.

| Pagina | Mobiel P / A / BP / SEO | Desktop P / A / BP / SEO | LCP mobiel |
|---|---|---|---|
| Home | 98 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 2,6 s |
| Werkplaats | 95 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 2,8 s |
| APK | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,9 s |
| Onderhoud | 100* / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,7 s |
| Aircoservice | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,8 s |
| Bandenservice | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,8 s |
| Storing / diagnose | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 1,6 s |
| Accessoire-opbouw | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,6 s |
| Schadeherstel | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,9 s |
| Tarieven | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,7 s |
| Verhuur | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,7 s |
| Afspraak | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,5 s |
| Contact | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 2,1 s |
| Cookiebeleid | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1,5 s |
| Bedankt | 100 / 100 / 100 / 66 † | 100 / 100 / 100 / 66 † | 1,7 s |
| 404 | 100 / 100 / 100 / 66 † | 100 / 100 / 100 / 66 † | 1,5 s |

P = performance, A = accessibility, BP = best practices. CLS is overal 0.

\* Onderhoud mobiel scoorde in losse metingen 100, 100 en 82; de uitschieter kwam door een
piek in blokkeertijd (710 ms) op de testcomputer, niet door de site (de site gebruikt 4,5 KB JavaScript, 1,5 KB gecomprimeerd).
† Bewust: deze pagina's staan op `noindex`, wat Lighthouse als SEO-fout telt.

**Paginagewicht:** 148–301 KB per pagina in 9–15 requests (fonts 160 KB, éénmalig gecachet).

## Toegankelijkheid

| Controle | Resultaat |
|---|---|
| Automatisch (axe via Lighthouse) | 100 op alle pagina's na correcties |
| Contrast | Alle tekst/achtergrond-combinaties ≥ 4,5:1 (grijs aangepast naar #646B77) |
| Toetsenbord | Skiplink zichtbaar bij Tab; zichtbare focusrand (3 px); dropdown Werkplaats te openen met Enter, Tab gaat de lijst in, Escape sluit en zet focus terug |
| Mobiel menu | Focus blijft binnen het menu, Escape sluit, focus terug op de menuknop |
| Formulieren | Alle velden hebben een zichtbaar label; verplichte velden met `required`; akkoordvakje bij elk formulier |
| Koppen | Eén h1 per pagina, logische volgorde (afspraakpagina gecorrigeerd) |
| Beweging | Scroll-animaties uit bij `prefers-reduced-motion` |
| Leesbaarheid | Geen lopende tekst kleiner dan 13 px; body 17–18 px; knoppen en velden ≥ 44 px hoog |

## Links en inhoud

- **Intern:** alle links, ankers (`#reserveren`, `#kampeermeer`, …), afbeeldingen en srcsets bestaan.
- **Extern:** RDW, klantomgeving, WhatsApp, Autobedrijf Lokerse, Facebook en Google Maps geven 200.
- **Spelling:** alle 860 unieke woorden nagelopen. Fouten van de huidige site zijn verbeterd
  (Campinggaz → Campingaz, Casettetoilet → Cassettetoilet, accesoires → accessoires).
- **Prijzen, openingstijden en specificaties** komen overeen met de huidige site (bron: `content/`).

## Gevonden en opgelost in deze fase

1. Grijze tekst op de lichtgele tint had contrast 4,47:1 → kleur donkerder (≥ 4,9:1).
2. Afspraakpagina sprong van h1 naar h3 → zijkolomkoppen zijn h2.
3. Dropdown Werkplaats: bij snel tabben na openen werden de items overgeslagen
   (zichtbaarheid werd mee-geanimeerd) → menu wordt bij openen direct zichtbaar.

## Bekende punten (geen actie nodig of later)

- **Render-blocking CSS** (één bestand, ~11 KB gecomprimeerd): bewust zo gelaten; scores zijn al ≥ 95.
- **Logo-SVG is 64 KB** (omgezet uit de Illustrator-pdf). Wordt gecachet; kan later met een
  SVG-optimizer of een strakke export uit Illustrator naar ~10 KB.
- Lokale meting: echte cijfers volgen na deploy op Netlify (HTTP/2, CDN). Herhaal Lighthouse op de
  preview-URL in fase 7.

## Open vragen voor Rick

1. Adres Autobedrijf Lokerse: volgens OpenStreetMap ook Zandweg 8E. Zetten we dat op de contactpagina?
2. Cookiebeleid (nieuwe tekst) nalezen; is een aparte privacyverklaring gewenst?
3. Afspraakformulier blijft een aanvraag per e-mail (geen koppeling met de planner). Akkoord?
4. Licentie AdobeStock-foto (hero) controleren voor webgebruik.
5. Echte BOVAG- en Campingaz-logo's aanleveren (nu placeholders in de keurmerkenrij).
6. Netlify-instellingen voor formuliermeldingen: zie `docs/netlify.md`.

## Meting op de echte preview (fase 7)

Lighthouse op https://kampeermeer-preview.netlify.app (alle 16 pagina's, mobiel + desktop):
performance 95–100 (mobiel) en 100 (desktop), accessibility 100, SEO 100 (bedankt/404: 66, noindex).
Best practices 93 door de "Built with Netlify"-badge: Netlify injecteert dat script op gratis sites,
onze CSP blokkeert het (badge verschijnt niet) en dat geeft een consolefout. Oplossing: badge uitzetten
in de Netlify-instellingen. CSS wordt sinds deze fase geminificeerd (52 → 42 KB).

