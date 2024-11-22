'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  area: string;
  status: 'active' | 'inactive';
  current_shift?: string;
  total_deliveries: number;
  success_rate: number;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setError('Failed to load partners');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingPartnerId) {
        // Update existing partner
        const { error } = await supabase
          .from('delivery_partners')
          .update(formData)
          .eq('id', editingPartnerId);

        if (error) throw error;

        setPartners(partners.map(p => 
          p.id === editingPartnerId ? { ...p, ...formData } : p
        ));
      } else {
        // Add new partner
        const { data, error } = await supabase
          .from('delivery_partners')
          .insert([{
            ...formData,
            total_deliveries: 0,
            success_rate: 0,
          }])
          .select();

        if (error) throw error;
        setPartners([...(data || []), ...partners]);
      }

      // Reset form
      setShowForm(false);
      setEditingPartnerId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        area: '',
        status: 'active',
      });
    } catch (error: any) {
      console.error('Error saving partner:', error);
      setError(error.message || 'Failed to save partner');
    }
  }

  function handleEdit(partner: Partner) {
    setFormData({
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      area: partner.area,
      status: partner.status,
    });
    setEditingPartnerId(partner.id);
    setShowForm(true);
  }

  async function handleStatusToggle(partner: Partner) {
    try {
      const newStatus = partner.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('delivery_partners')
        .update({ status: newStatus })
        .eq('id', partner.id);

      if (error) throw error;

      setPartners(partners.map(p =>
        p.id === partner.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating partner status:', error);
      setError('Failed to update partner status');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Partners</h1>
          <p className="text-white/70">Manage your delivery partners</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingPartnerId(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              area: '',
              status: 'active',
            });
          }}
          className="glass-button px-4 py-2"
        >
          {showForm ? 'Cancel' : 'Add Partner'}
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 bg-red-400/10 text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingPartnerId ? 'Edit Partner' : 'Add New Partner'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="glass-input w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="glass-button px-6 py-2">
                {editingPartnerId ? 'Update Partner' : 'Add Partner'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Contact</th>
              <th>Area</th>
              <th>Status</th>
              <th>Current Shift</th>
              <th>Performance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td>
                  <div>
                    <div className="font-medium text-white">{partner.name}</div>
                    <div className="text-sm text-white/50">ID: {partner.id}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="text-white/80">{partner.email}</div>
                    <div className="text-sm text-white/50">{partner.phone}</div>
                  </div>
                </td>
                <td>
                  <span className="text-white/80">{partner.area}</span>
                </td>
                <td>
                  <button
                    onClick={() => handleStatusToggle(partner)}
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      partner.status === 'active'
                        ? 'bg-green-400/10 text-green-400'
                        : 'bg-red-400/10 text-red-400'
                    )}
                  >
                    {partner.status}
                  </button>
                </td>
                <td>
                  <span className="text-white/80">
                    {partner.current_shift || 'Not on shift'}
                  </span>
                </td>
                <td>
                  <div>
                    <div className="text-white/80">
                      {partner.total_deliveries} deliveries
                    </div>
                    <div className="text-sm text-white/50">
                      {partner.success_rate}% success rate
                    </div>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(partner)}
                    className="text-white/70 hover:text-white underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-white/50">
                  No partners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
