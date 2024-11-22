import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import type { DeliveryPartner, Order } from '@/types';

function isWithinShift(partner: DeliveryPartner, orderTime: string): boolean {
  const [orderHour, orderMinute] = orderTime.split(':').map(Number);
  const [startHour, startMinute] = partner.shift.start.split(':').map(Number);
  const [endHour, endMinute] = partner.shift.end.split(':').map(Number);

  const orderMinutes = orderHour * 60 + orderMinute;
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return orderMinutes >= startMinutes && orderMinutes <= endMinutes;
}

async function findBestPartner(order: Order): Promise<DeliveryPartner | null> {
  const { data: partners, error } = await supabase
    .from('delivery_partners')
    .select('*')
    .eq('status', 'active')
    .lte('currentLoad', 2) // Max load is 3
    .contains('areas', [order.area]);

  if (error || !partners) return null;

  // Filter partners by shift time
  const availablePartners = partners.filter(partner => 
    isWithinShift(partner, order.scheduledFor)
  );

  if (availablePartners.length === 0) return null;

  // Sort by current load and metrics
  return availablePartners.sort((a, b) => {
    // Prioritize partners with lower current load
    if (a.currentLoad !== b.currentLoad) {
      return a.currentLoad - b.currentLoad;
    }
    
    // If same load, prioritize by rating and completed orders
    const aScore = (a.metrics.rating * 0.7) + (a.metrics.completedOrders * 0.3);
    const bScore = (b.metrics.rating * 0.7) + (b.metrics.completedOrders * 0.3);
    return bScore - aScore;
  })[0];
}

export async function POST(request: Request) {
  try {
    // Get order ID from request
    const { orderId } = await request.json();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('_id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Find best partner
    const partner = await findBestPartner(order);

    if (!partner) {
      // Create failed assignment record
      await supabase.from('assignments').insert([{
        orderId,
        partnerId: null,
        timestamp: new Date(),
        status: 'failed',
        reason: 'No available partners',
      }]);

      return NextResponse.json({
        success: false,
        error: 'No available partners',
      });
    }

    // Start a transaction
    const { error: updateError } = await supabase
      .rpc('assign_order', {
        p_order_id: orderId,
        p_partner_id: partner._id,
      });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      partnerId: partner._id,
    });
  } catch (error) {
    console.error('Assignment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to assign order',
    }, { status: 500 });
  }
}
