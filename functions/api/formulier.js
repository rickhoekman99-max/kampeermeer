/*
 * Cloudflare Pages Function: POST /api/formulier
 *
 * Ontvangt de formulieren van de site (aanvraag, afspraak, reservering, contact), controleert ze
 * en stuurt de inhoud als e-mail naar Kampeer & Meer via de maildienst Resend.
 *
 * Omgevingsvariabelen (Cloudflare Pages → Settings → Variables and Secrets):
 *   RESEND_API_KEY  (secret)  API-sleutel van Resend
 *   MAIL_TO                   ontvanger, bijv. info@kampeermeer.com
 *   MAIL_FROM                 afzender op een in Resend geverifieerd domein,
 *                             bijv. "Website Kampeer & Meer <website@mail.kampeermeer.com>"
 *   MAIL_DRY_RUN   (optioneel) "1" = niet versturen, alleen loggen (voor previews en tests)
 *
 * Na succes: 303 naar /afspraak/bedankt/. Bij een fout: 303 naar /formulier-fout/.
 */

const FORMULIEREN = {
  aanvraag: {
    onderwerp: 'Afspraakaanvraag',
    velden: { pagina: 'Pagina', naam: 'Naam', telefoon: 'Telefoon', kenteken: 'Kenteken', dienst: 'Dienst' },
    verplicht: ['naam', 'telefoon'],
  },
  afspraak: {
    onderwerp: 'Afspraakverzoek',
    velden: {
      naam: 'Naam', telefoon: 'Telefoon', email: 'E-mail', voertuig: 'Caravan of camper', kenteken: 'Kenteken',
      'merk-model': 'Merk en model', dienst: 'Dienst', voorkeursdatum: 'Voorkeursdatum', opmerking: 'Opmerking',
    },
    verplicht: ['naam', 'telefoon', 'email', 'voertuig', 'dienst', 'akkoord'],
  },
  reservering: {
    onderwerp: 'Reservering verhuur',
    velden: {
      product: 'Product', ophaaldatum: 'Ophaaldatum', retourdatum: 'Retourdatum', naam: 'Naam',
      telefoon: 'Telefoon', email: 'E-mail', opmerking: 'Opmerking',
    },
    verplicht: ['product', 'ophaaldatum', 'retourdatum', 'naam', 'telefoon', 'email', 'akkoord'],
  },
  contact: {
    onderwerp: 'Contactbericht',
    velden: { naam: 'Naam', email: 'E-mail', telefoon: 'Telefoon', bericht: 'Bericht' },
    verplicht: ['naam', 'email', 'bericht', 'akkoord'],
  },
};

// Leesbare namen voor de waarden uit keuzelijsten.
const NAMEN = {
  dienst: {
    apk: 'APK', onderhoud: 'Onderhoud', aircoservice: 'Aircoservice', bandenservice: 'Bandenservice',
    'storing-diagnose': 'Storing / diagnose', 'accessoire-opbouw': 'Accessoire-opbouw', schadeherstel: 'Schadeherstel',
    anders: 'Anders',
  },
  product: {
    'thule-fietsendrager': 'Thule fietsendrager', 'dakkoffer-medium': 'Dakkoffer Medium',
    'dakkoffer-large': 'Dakkoffer Large', 'dakkoffer-extra-large': 'Dakkoffer Extra Large',
  },
  voertuig: { caravan: 'Caravan', camper: 'Camper', anders: 'Anders' },
};

const MAX_LENGTE = 3000;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function doorsturen(request, pad) {
  return Response.redirect(new URL(pad, request.url).toString(), 303);
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.formData();
  } catch {
    return doorsturen(request, '/formulier-fout/');
  }

  const waarde = (naam) => String(data.get(naam) ?? '').trim().slice(0, MAX_LENGTE);
  const leesbaar = (naam) => NAMEN[naam]?.[waarde(naam)] ?? waarde(naam);
  const soort = waarde('formulier');
  const formulier = FORMULIEREN[soort];
  if (!formulier) return doorsturen(request, '/formulier-fout/');

  // Honeypot: echte bezoekers zien dit veld niet. Doe alsof het gelukt is, zodat bots niets leren.
  if (waarde('website')) return doorsturen(request, '/afspraak/bedankt/');

  const ontbreekt = formulier.verplicht.filter((naam) => !waarde(naam));
  const email = waarde('email');
  if (ontbreekt.length || (email && !EMAIL_RE.test(email))) {
    return doorsturen(request, '/formulier-fout/');
  }

  const regels = Object.entries(formulier.velden)
    .filter(([naam]) => waarde(naam))
    .map(([naam, label]) => `${label}: ${leesbaar(naam)}`);
  const onderwerpExtra = leesbaar('dienst') || leesbaar('product') || waarde('naam');
  const mail = {
    from: env.MAIL_FROM,
    to: [env.MAIL_TO],
    subject: `${formulier.onderwerp} via kampeermeer.com${onderwerpExtra ? ` – ${onderwerpExtra}` : ''}`,
    text: [
      `${formulier.onderwerp} via de website van Kampeer & Meer.`,
      '',
      ...regels,
      '',
      ...(formulier.verplicht.includes('akkoord') ? ['De afzender is akkoord gegaan met de verwerking van de gegevens.'] : []),
      `Verzonden: ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}`,
    ].join('\n'),
  };
  if (email) mail.reply_to = email;

  if (env.MAIL_DRY_RUN === '1') {
    console.log('MAIL_DRY_RUN', JSON.stringify(mail));
    return doorsturen(request, '/afspraak/bedankt/');
  }

  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    console.error('Formulier: RESEND_API_KEY, MAIL_TO of MAIL_FROM ontbreekt');
    return doorsturen(request, '/formulier-fout/');
  }

  const antwoord = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  });
  if (!antwoord.ok) {
    console.error('Formulier: Resend gaf', antwoord.status, await antwoord.text());
    return doorsturen(request, '/formulier-fout/');
  }
  return doorsturen(request, '/afspraak/bedankt/');
}

// Alleen POST; een GET op dit adres stuurt door naar de afspraakpagina.
export function onRequestGet({ request }) {
  return doorsturen(request, '/afspraak/');
}
