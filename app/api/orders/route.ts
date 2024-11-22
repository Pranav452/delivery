import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import type { Order } from '@/types';

export async function GET() {
  try {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    return NextResponse.json({ orders: data });
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const order: Order = await request.json();
    const { data, error: insertError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ order: data });
  } catch (error: unknown) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
