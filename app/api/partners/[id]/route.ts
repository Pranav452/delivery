import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(_request: Request) {
  try {
    const { data } = await supabase
      .from('partners')
      .select('*')
      .single();

    return NextResponse.json({ partner: data });
  } catch (err) {
    console.error('Failed to fetch partner:', err);
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const partner = await request.json();
    const { data } = await supabase
      .from('partners')
      .update(partner)
      .select()
      .single();

    return NextResponse.json({ partner: data });
  } catch (err) {
    console.error('Failed to update partner:', err);
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
