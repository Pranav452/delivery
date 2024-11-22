'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import supabase from '@/lib/supabase';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  onSuccess: () => void;
}

interface Order {
  id?: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  contact_number: string;
  delivery_address: string;
  area: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

const initialOrderState: Order = {
  order_number: '',
  customer_name: '',
  customer_email: '',
  contact_number: '',
  delivery_address: '',
  area: '',
  status: 'pending',
};

export default function OrderModal({ isOpen, onClose, order, onSuccess }: OrderModalProps) {
  const [formData, setFormData] = useState<Order>(initialOrderState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    if (order) {
      setFormData(order);
    } else {
      setFormData(initialOrderState);
    }
  }, [order]);

  useEffect(() => {
    // Fetch available areas from delivery partners
    const fetchAreas = async () => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('area')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching areas:', error);
        return;
      }

      // Use Array.from to handle Set conversion safely
      const uniqueAreas = Array.from(new Set(data.map(dp => dp.area))).sort();
      setAreas(uniqueAreas);
    };

    fetchAreas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare order data
      const orderData = {
        ...formData,
        order_number: formData.order_number || `ORD${Date.now()}`,
        status: formData.status || 'pending',
        customer_email: formData.customer_email || null
      };

      console.log('Submitting order data:', orderData);

      if (order?.id) {
        // Update existing order
        const { data: updateData, error: updateError } = await supabase
          .from('orders')
          .update({
            ...orderData,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }

        console.log('Order updated successfully:', updateData);
      } else {
        // Create new order
        const { data: insertData, error: insertError } = await supabase
          .from('orders')
          .insert([{
            ...orderData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating order:', insertError);
          throw insertError;
        }

        console.log('Order created successfully:', insertData);
      }

      onSuccess();
      onClose();
      setFormData(initialOrderState);
    } catch (err: any) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div className="w-full max-w-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {order ? 'Edit Order' : 'Add New Order'}
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Order Number
              </label>
              <input
                type="text"
                className="glass-input w-full"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                placeholder="Generated automatically if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                className="glass-input w-full"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                className="glass-input w-full"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                className="glass-input w-full"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                required
                pattern="[+]?[0-9]{10,}"
                title="Please enter a valid phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Delivery Address
              </label>
              <textarea
                className="glass-input w-full"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Area
              </label>
              <select
                className="glass-input w-full"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              >
                <option value="">Select Area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Status
              </label>
              <select
                className="glass-input w-full"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Order['status'] })}
                required
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="glass-button px-4 py-2"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glass-button px-4 py-2 bg-blue-500/20"
                disabled={loading}
              >
                {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
