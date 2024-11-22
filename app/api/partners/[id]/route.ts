import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import type { DeliveryPartner } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<DeliveryPartner> = await request.json();
    const { data, error } = await supabase
      .from('delivery_partners')
      .update(updates)
      .eq('_id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ partner: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('delivery_partners')
      .delete()
      .eq('_id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
