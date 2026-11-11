# kampeermeer

Website van Kampeer & Meer (onderdeel van Autobedrijf Lokerse, Kruiningen): statische HTML/CSS-site,
gebouwd met een klein buildscript zonder dependencies.

- Broncode in `src/`, gedeelde header/footer/head in `src/partials/`
- `node build.js` bouwt de site naar `dist/` (includes, iconen inline, CSS gebundeld en geminificeerd, sitemap)
- Formulieren: Cloudflare Pages Function `functions/api/formulier.js`, zie [docs/formulieren.md](docs/formulieren.md)
- Foto's omzetten naar AVIF/WebP: `tools/images.py`, bronnen in [docs/fotos.md](docs/fotos.md)

## Hosting & deploy

### Waar de site draait
- **Cloudflare Pages**, project `kampeermeer` (account rickhoekman99@gmail.com).
- Hoofdadres: **https://www.kampeermeer.com**. Cloudflare-adres: https://kampeermeer.pages.dev.
- Buildinstellingen: framework preset *None*, build command `node build.js`, output directory `dist`,
  Node-versie uit `.node-version`.
- Redirects en headers staan in `src/_redirects` en `src/_headers` (Cloudflare Pages-formaat; komen via de
  build in `dist/`).
- Bezoekersstatistieken: Cloudflare Web Analytics (script in `src/partials/footer.html`, zonder cookies).
- Google Search Console: property `https://www.kampeermeer.com/` (account rickhoekman99@gmail.com), geverifieerd
  met de metatag `google-site-verification` in `src/partials/head.html` (laten staan), sitemap ingediend.

### Zo werkt deployen
1. Wijzig de site (lokaal of via Claude Code) en controleer met `node build.js`.
2. Commit en push naar **`main`**.
3. Cloudflare bouwt automatisch; na ongeveer een halve minuut staat de wijziging live op www.kampeermeer.com.
   Status en logs: Cloudflare-dashboard → Workers & Pages → kampeermeer → Deployments.

### Preview-deploys
Elke andere branch dan `main` krijgt bij een push automatisch een eigen preview-URL op pages.dev
(bijv. `https://<branchnaam>.kampeermeer.pages.dev`). Handig om iets te laten zien voordat het live gaat:
maak een branch, push, en merge pas naar `main` als het goed is.

### DNS bij Hostnet
Domeinregistratie, DNS en e-mail blijven bij **Hostnet** (pakket E-mail Start). Records die bij de website horen:

| Naam | Type | Waarde | Waarvoor |
|---|---|---|---|
| `www.kampeermeer.com` | CNAME | `kampeermeer.pages.dev` | website op Cloudflare Pages |
| `kampeermeer.com` | A / AAAA | standaardrecords van Hostnet | Hostnet-domeindoorsturing: 301 naar https://www.kampeermeer.com |

In het blok *standaard DNS-records* staan **A, AAAA en MX voor www.kampeermeer.com uit**; die botsen met de CNAME.

**Let op bij de domeindoorsturing:** het vinkje *"Herstel de DNS-instellingen voor de Doorstuurservice"* zet ook de
standaard www-records weer aan en haalt de www-CNAME weg (gevolg: doorstuurlus op www). Gebruik je dat vinkje,
zet daarna de standaard www A/AAAA/MX weer uit en voeg de CNAME opnieuw toe.

**Niet aanraken** (e-mail en Hostnet-diensten): de MX-records van kampeermeer.com, SPF (`v=spf1 …`), `_dmarc`,
de DKIM-records (`ed1`/`rsa1._domainkey`), `autoconfig`, `webmail`, `www.webmail`, `_autodiscover` (SRV) en het
comodoca-record.
