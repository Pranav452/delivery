'use client';

import { useState } from 'react';
import type { DeliveryPartner } from '@/types';

interface PartnerFormProps {
  onSubmit: (partner: Partial<DeliveryPartner>) => Promise<void>;
  initialData?: Partial<DeliveryPartner>;
}

export default function PartnerForm({ onSubmit, initialData }: PartnerFormProps) {
  const [formData, setFormData] = useState<Partial<DeliveryPartner>>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      status: 'active',
      currentLoad: 0,
      areas: [],
      shift: {
        start: '09:00',
        end: '17:00',
      },
      metrics: {
        rating: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      },
    }
  );

  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setError('');
    } catch (err) {
      setError('Failed to save partner');
    }
  };

  const handleAreaAdd = () => {
    if (area && !formData.areas?.includes(area)) {
      setFormData(prev => ({
        ...prev,
        areas: [...(prev.areas || []), area],
      }));
      setArea('');
    }
  };

  const handleAreaRemove = (areaToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas?.filter(a => a !== areaToRemove) || [],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={formData.status}
          onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Areas</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={area}
            onChange={e => setArea(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter area name"
          />
          <button
            type="button"
            onClick={handleAreaAdd}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.areas?.map(area => (
            <span
              key={area}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
            >
              {area}
              <button
                type="button"
                onClick={() => handleAreaRemove(area)}
                className="ml-1 text-blue-500 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift Start</label>
          <input
            type="time"
            required
            value={formData.shift?.start}
            onChange={e => setFormData(prev => ({
              ...prev,
              shift: { ...prev.shift!, start: e.target.value },
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift End</label>
          <input
            type="time"
            required
            value={formData.shift?.end}
            onChange={e => setFormData(prev => ({
              ...prev,
              shift: { ...prev.shift!, end: e.target.value },
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Partner
        </button>
      </div>
    </form>
  );
}
