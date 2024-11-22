import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import type { DeliveryPartner } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('delivery_partners')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ partners: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const partner: DeliveryPartner = await request.json();
    const { data, error } = await supabase
      .from('delivery_partners')
      .insert([partner])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ partner: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
