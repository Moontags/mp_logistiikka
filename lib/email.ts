import nodemailer from 'nodemailer';

export interface OrderEmailData {
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  date: string;
  bikeType: string;
  notes?: string;
  estimatedPrice?: number | string;
}

const bikeLabels: Record<string, string> = {
  scooter: 'Skootteri',
  standard: 'Vakio',
  large: 'Iso / Strike',
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'posti.zoner.fi',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendOrderEmail(data: OrderEmailData) {
  const transporter = createTransporter();

  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP connection error:', error);
    throw new Error('Email service configuration error');
  }

  const { name, email, phone, origin, destination, date, bikeType, notes, estimatedPrice } = data;
  const bikeLabel = bikeLabels[bikeType] ?? bikeType;
  const fromAddress = process.env.SMTP_USER!;
  const toAddress = process.env.CONTACT_EMAIL!;
  const timestamp = new Date().toLocaleString('fi-FI', { timeZone: 'Europe/Helsinki' });

  // Internal notification to business
  try {
    await transporter.sendMail({
    from: `"MP-Logistiikka tilaukset" <${fromAddress}>`,
    to: toAddress,
    replyTo: email,
    subject: `🏍️ Uusi tilaus: ${origin} → ${destination} (${date})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E85D1A">Uusi kuljetustilaus – MP-Logistiikka</h2>
        <table style="border-collapse:collapse;width:100%;margin-top:1rem">
          <tr style="background:#f9f9f9">
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600;width:40%">Asiakas</td>
            <td style="padding:10px 12px;border:1px solid #ddd">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Sähköposti</td>
            <td style="padding:10px 12px;border:1px solid #ddd"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr style="background:#f9f9f9">
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Puhelin</td>
            <td style="padding:10px 12px;border:1px solid #ddd"><a href="tel:${phone}">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Reitti</td>
            <td style="padding:10px 12px;border:1px solid #ddd">${origin} → ${destination}</td>
          </tr>
          <tr style="background:#f9f9f9">
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Kuljetuspäivä</td>
            <td style="padding:10px 12px;border:1px solid #ddd">${date}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Pyörätyyppi</td>
            <td style="padding:10px 12px;border:1px solid #ddd">${bikeLabel}</td>
          </tr>
          <tr style="background:#f9f9f9">
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Arvioitu hinta</td>
            <td style="padding:10px 12px;border:1px solid #ddd;color:#E85D1A;font-size:1.2em"><strong>${estimatedPrice ? `${estimatedPrice} €` : '–'}</strong></td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Lisätiedot</td>
            <td style="padding:10px 12px;border:1px solid #ddd">${notes || '–'}</td>
          </tr>
        </table>
        <p style="margin-top:1.5rem;padding:12px;background:#fff8f0;border-left:3px solid #E85D1A;font-size:0.9em">
          Vastaa tähän sähköpostiin suoraan – reply-to on asetettu asiakkaan osoitteeseen.
        </p>
        <p style="color:#999;font-size:0.8em;margin-top:1rem">Tilaus saapui mp-logistiikka.fi-sivustolta ${timestamp}<br>MP-Logistiikka · Y-tunnus: 3163260-9</p>
      </div>
    `,
    });
    console.log('[email] Internal notification sent to', toAddress);
  } catch (error) {
    console.error('[email] Internal notification FAILED to', toAddress, error);
    throw error;
  }

  // Confirmation email to customer
  try {
    await transporter.sendMail({
    from: `"MP-Logistiikka" <${fromAddress}>`,
    to: email,
    subject: 'Tilausvahvistus – MP-Logistiikka 🏍️',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E85D1A">Kiitos tilauksestasi!</h2>
        <p>Hei ${name},</p>
        <p>Olemme vastaanottaneet kuljetustilauksesi. Otamme sinuun yhteyttä pian vahvistaaksemme kuljetuksen.</p>
        <div style="background:#f9f9f9;border-radius:6px;padding:1.25rem;margin:1.5rem 0">
          <p style="margin:0 0 0.5rem"><strong>Reitti:</strong> ${origin} → ${destination}</p>
          <p style="margin:0 0 0.5rem"><strong>Toivottu päivä:</strong> ${date}</p>
          <p style="margin:0 0 0.5rem"><strong>Pyörätyyppi:</strong> ${bikeLabel}</p>
          ${estimatedPrice ? `<p style="margin:0;color:#E85D1A;font-size:1.1em"><strong>Arvioitu hinta: ${estimatedPrice} €</strong></p>` : ''}
        </div>
        <p>Jos sinulla on kysyttävää, vastaa tähän sähköpostiin tai ota yhteyttä:</p>
        <p>Voit myös soittaa suoraan: <a href="tel:+358503547763">+358 50 354 7763</a></p>
        <p style="margin-top:2rem">Terveisin,<br><strong>MP-Logistiikka</strong></p>
        <hr style="border:none;border-top:1px solid #eee;margin:2rem 0">
        <p style="color:#999;font-size:0.8em">MP-Logistiikka · Riihimäki · mp-logistiikka.fi · Y-tunnus: 3163260-9</p>
      </div>
    `,
    });
    console.log('[email] Customer confirmation sent to', email);
  } catch (error) {
    console.error('[email] Customer confirmation FAILED to', email, error);
    throw error;
  }

  console.log('Order emails sent successfully for:', name, email);
}
