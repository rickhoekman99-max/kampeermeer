# Netlify: instellingen na de eerste deploy

## Huidige preview (fase 7)
- Site: **kampeermeer-preview** · https://kampeermeer-preview.netlify.app
- Beheer: https://app.netlify.com/projects/kampeermeer-preview
- Handmatig publiceren vanuit deze map: `netlify deploy --build --prod`
- Openbaar (Netlify-login uitgezet) en formulierdetectie aan; alle 4 formulieren herkend.
- Nog niet gekoppeld aan GitHub: automatisch publiceren bij elke push kan via
  Project configuration → Build & deploy → Link repository (branch `redesign` of later `main`).

De code is klaar voor Netlify (`netlify.toml`: build `node build.js`, publish `dist`).
Deze stappen gebeuren in het Netlify-dashboard en moeten door de eigenaar worden gedaan.

## Formulieren
Netlify herkent de formulieren automatisch bij de deploy:

| Formulier | Pagina's | Velden |
|---|---|---|
| `aanvraag` | werkplaats + alle dienstpagina's | naam, telefoon, kenteken, dienst, pagina |
| `afspraak` | /afspraak/ | gegevens, voertuig, dienst, voorkeursdatum, opmerking |
| `reservering` | /verhuur/ | product, ophaal- en retourdatum, contactgegevens, opmerking |
| `contact` | /contact/ | naam, e-mail, telefoon, bericht |

1. Site settings → Forms → **Enable form detection** (staat soms uit bij nieuwe sites).
2. Forms → Form notifications → **Add notification → Email** naar `info@kampeermeer.com`
   (per formulier of voor alle formulieren).
3. Spam: elk formulier heeft een honeypot-veld (`website`); Netlify filtert daarnaast zelf.
Na verzenden komt de bezoeker op `/afspraak/bedankt/`.

## Domein (pas bij livegang, fase 7)
- Eerst de huidige DNS-records noteren, vooral **MX-records** voor info@kampeermeer.com.
- Daarna domein koppelen in Netlify; HTTPS wordt automatisch geregeld.
- Redirects van oude URL's staan al in `netlify.toml`.
