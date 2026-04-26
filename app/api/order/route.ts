import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'posti.zoner.fi',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
})

const bikeLabels: Record<string, string> = {
  scooter: 'Skootteri',
  standard: 'Vakio',
  large: 'Iso / Strike',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, origin, destination, date, bikeType, notes, estimatedPrice } = body

    if (!name || !email || !phone || !origin || !destination || !date) {
      return NextResponse.json({ error: 'Pakollisia kenttiä puuttuu' }, { status: 400 })
    }

    const fromAddress = process.env.SMTP_USER!
    const toAddress = process.env.CONTACT_EMAIL!

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
              <td style="padding:10px 12px;border:1px solid #ddd">${bikeLabels[bikeType] ?? bikeType}</td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Arvioitu hinta</td>
              <td style="padding:10px 12px;border:1px solid #ddd;color:#E85D1A;font-size:1.2em"><strong>${estimatedPrice} €</strong></td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border:1px solid #ddd;font-weight:600">Lisätiedot</td>
              <td style="padding:10px 12px;border:1px solid #ddd">${notes || '–'}</td>
            </tr>
          </table>
          <p style="margin-top:1.5rem;padding:12px;background:#fff8f0;border-left:3px solid #E85D1A;font-size:0.9em">
            Vastaa tähän sähköpostiin suoraan – reply-to on asetettu asiakkaan osoitteeseen.
          </p>
          <p style="color:#999;font-size:0.8em;margin-top:1rem">Tilaus saapui mp-logistiikka.fi-sivustolta</p>
        </div>
      `,
    })

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
            <p style="margin:0 0 0.5rem"><strong>Pyörätyyppi:</strong> ${bikeLabels[bikeType] ?? bikeType}</p>
            <p style="margin:0;color:#E85D1A;font-size:1.1em"><strong>Arvioitu hinta: ${estimatedPrice} €</strong></p>
          </div>
          <p>Jos sinulla on kysyttävää, vastaa tähän sähköpostiin tai soita suoraan.</p>
          <p style="margin-top:2rem">Terveisin,<br><strong>MP-Logistiikka</strong></p>
          <hr style="border:none;border-top:1px solid #eee;margin:2rem 0">
          <p style="color:#999;font-size:0.8em">MP-Logistiikka · Riihimäki · mp-logistiikka.fi</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('SMTP error:', error)
    return NextResponse.json(
      { error: 'Sähköpostin lähetys epäonnistui. Yritä uudelleen tai soita suoraan.' },
      { status: 500 }
    )
  }
}
