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
  area: string;
  delivery_address: string;
  contact_number: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
}

const initialOrderState: Order = {
  order_number: '',
  customer_name: '',
  area: '',
  delivery_address: '',
  contact_number: '',
  status: 'pending',
};

export default function OrderModal({ isOpen, onClose, order, onSuccess }: OrderModalProps) {
  const [formData, setFormData] = useState<Order>(initialOrderState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setFormData(order);
    } else {
      setFormData(initialOrderState);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (order?.id) {
        // Update existing order
        const { error: updateError } = await supabase
          .from('orders')
          .update(formData)
          .eq('id', order.id);

        if (updateError) throw updateError;
      } else {
        // Create new order
        const { error: insertError } = await supabase
          .from('orders')
          .insert([{ ...formData, created_at: new Date().toISOString() }]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
      setFormData(initialOrderState);
    } catch (err: any) {
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
                required
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
                Area
              </label>
              <input
                type="text"
                className="glass-input w-full"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
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
                Contact Number
              </label>
              <input
                type="tel"
                className="glass-input w-full"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                required
              />
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
