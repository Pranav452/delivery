'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  area: string;
  created_at: string;
  assignment?: {
    id: number;
    status: 'pending' | 'success' | 'failed';
    partner?: {
      name: string;
    };
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          assignment:assignments(
            id,
            status,
            partner:delivery_partners(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="glass-card p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-white/70">View and track delivery orders</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Area</th>
              <th>Status</th>
              <th>Partner</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="font-medium text-white">#{order.order_number}</span>
                </td>
                <td>
                  <span className="text-white/80">{order.customer_name}</span>
                </td>
                <td>
                  <span className="text-white/80">{order.area}</span>
                </td>
                <td>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      order.assignment?.[0]?.status === 'success'
                        ? 'bg-green-400/10 text-green-400'
                        : order.assignment?.[0]?.status === 'failed'
                        ? 'bg-red-400/10 text-red-400'
                        : 'bg-yellow-400/10 text-yellow-400'
                    )}
                  >
                    {order.assignment?.[0]?.status || 'pending'}
                  </span>
                </td>
                <td>
                  <span className="text-white/80">
                    {order.assignment?.[0]?.partner?.name || 'Unassigned'}
                  </span>
                </td>
                <td>
                  <span className="text-white/50">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-white/50 py-8">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
