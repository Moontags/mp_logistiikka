import { NextRequest, NextResponse } from 'next/server';
import { sendOrderEmail, OrderEmailData } from '@/lib/email';

interface OrderFormRequest {
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

function validateOrderForm(data: unknown): data is OrderFormRequest {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.name === 'string' && d.name.trim().length > 0 &&
    typeof d.email === 'string' && d.email.trim().length > 0 &&
    typeof d.phone === 'string' && d.phone.trim().length > 0 &&
    typeof d.origin === 'string' && d.origin.trim().length > 0 &&
    typeof d.destination === 'string' && d.destination.trim().length > 0 &&
    typeof d.date === 'string' && d.date.trim().length > 0
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateOrderForm(body)) {
      return NextResponse.json(
        { error: 'Pakollisia kenttiä puuttuu' },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Tarkista sähköpostiosoite' },
        { status: 400 }
      );
    }

    const emailData: OrderEmailData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      origin: body.origin,
      destination: body.destination,
      date: body.date,
      bikeType: body.bikeType,
      notes: body.notes,
      estimatedPrice: body.estimatedPrice,
    };

    await sendOrderEmail(emailData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Virheellinen pyyntö' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Sähköpostin lähetys epäonnistui. Yritä uudelleen tai soita suoraan.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
