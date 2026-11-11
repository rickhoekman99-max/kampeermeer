# Formulieren (Cloudflare Pages Function + Resend)

Alle formulieren op de site (`aanvraag` op werkplaats- en dienstpagina's, `afspraak`, `reservering`,
`contact`) posten naar **`/api/formulier`**. Dat is een Cloudflare Pages Function
(`functions/api/formulier.js`) die:

1. controleert of het een bekend formulier is en of de verplichte velden zijn ingevuld;
2. spam tegenhoudt met een onzichtbaar honeypot-veld (`website`);
3. de inhoud als platte-tekstmail naar Kampeer & Meer stuurt via **Resend**, met *Reply-To* op het
   e-mailadres van de bezoeker (zodat je direct kunt antwoorden);
4. de bezoeker doorstuurt naar `/afspraak/bedankt/`, of bij een fout naar `/formulier-fout/`.

## Eenmalig instellen

### 1. Resend
1. Maak een gratis account op resend.com.
2. **Domains → Add domain**: `mail.kampeermeer.com`, regio **EU (Ireland)**.
   Een apart subdomein zorgt dat de bestaande e-mailinstellingen van kampeermeer.com
   (MX, SPF, DMARC bij Hostnet) **niet** veranderen.
3. Resend toont een paar DNS-records (DKIM en een MX/SPF voor teruggestuurde mail), allemaal op
   `mail.kampeermeer.com` of een subdomein daarvan. Voeg precies die records toe in Hostnet
   DNS-beheer. Bestaande records niet wijzigen.
4. Wacht tot Resend het domein op **Verified** zet.
5. **API Keys → Create**: rechten *Sending access*, alleen voor domein `mail.kampeermeer.com`.

### 2. Cloudflare Pages
Project → **Settings → Variables and Secrets**, omgeving **Production**:

| Naam | Type | Waarde |
|---|---|---|
| `RESEND_API_KEY` | Secret | de API-sleutel uit Resend |
| `MAIL_TO` | Text | `info@kampeermeer.com` |
| `MAIL_FROM` | Text | `Website Kampeer & Meer <website@mail.kampeermeer.com>` |

Voor de **Preview**-omgeving (andere branches) kun je `MAIL_DRY_RUN` = `1` zetten: dan wordt er niets
verstuurd en verschijnt de mail alleen in de logs. Na het wijzigen van variabelen opnieuw deployen.

## Testen
- Lokaal: `npx wrangler pages dev dist --binding MAIL_DRY_RUN=1` (na `node build.js`).
- Live: verstuur één formulier en controleer of de mail binnenkomt op info@kampeermeer.com.
- Logs: Cloudflare-dashboard → project → Functions → Real-time logs.

## Velden aanpassen
Nieuwe velden of formulieren toevoegen: in `functions/api/formulier.js` het object `FORMULIEREN`
(labels en verplichte velden) en zo nodig `NAMEN` (leesbare waarden van keuzelijsten) bijwerken.
