'use client';

import { useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Assignment {
  id: number;
  order_id: number;
  partner_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    area: string;
  };
  partner?: {
    name: string;
  };
}

interface AssignmentMetrics {
  total: number;
  pending: number;
  completed: number;
  success_rate: number;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [metrics, setMetrics] = useState<AssignmentMetrics>({
    total: 0,
    pending: 0,
    completed: 0,
    success_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching assignments...');

      const { data: ordersExist } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      if (!ordersExist || ordersExist.length === 0) {
        console.log('No orders found in database');
        setError('No orders found in database. Please create some orders first.');
        return;
      }

      const { data: partnersExist } = await supabase
        .from('delivery_partners')
        .select('id')
        .limit(1);

      if (!partnersExist || partnersExist.length === 0) {
        console.log('No delivery partners found in database');
        setError('No delivery partners found in database. Please add some delivery partners first.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('assignments')
        .select(`
          *,
          order:orders(order_number, area),
          partner:delivery_partners(name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching assignments:', fetchError);
        throw fetchError;
      }

      console.log('Fetched assignments:', data);

      if (!data || data.length === 0) {
        // Create a sample assignment if none exist
        const { data: firstOrder } = await supabase
          .from('orders')
          .select('id')
          .limit(1)
          .single();

        const { data: firstPartner } = await supabase
          .from('delivery_partners')
          .select('id')
          .limit(1)
          .single();

        if (firstOrder && firstPartner) {
          const { error: insertError } = await supabase
            .from('assignments')
            .insert({
              order_id: firstOrder.id,
              partner_id: firstPartner.id,
              status: 'pending'
            });

          if (insertError) {
            console.error('Error creating sample assignment:', insertError);
            toast.error('Failed to create sample assignment');
          } else {
            toast.success('Created a sample assignment');
            // Fetch assignments again
            const { data: newData } = await supabase
              .from('assignments')
              .select(`
                *,
                order:orders(order_number, area),
                partner:delivery_partners(name)
              `)
              .order('created_at', { ascending: false });
            
            if (newData) {
              setAssignments(newData);
              calculateMetrics(newData);
            }
          }
        }
      } else {
        setAssignments(data);
        calculateMetrics(data);
      }
    } catch (error) {
      console.error('Error in fetchAssignments:', error);
      setError('Failed to load assignments. Please check console for details.');
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  function calculateMetrics(data: Assignment[]) {
    const total = data.length;
    const pending = data.filter(a => a.status === 'pending').length;
    const completed = data.filter(a => a.status === 'completed').length;
    const success_rate = total > 0 ? (completed / total) * 100 : 0;

    setMetrics({
      total,
      pending,
      completed,
      success_rate,
    });
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
      <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4">
        <div className="glass-card p-4 text-red-400">
          {error}
        </div>
        <button
          onClick={() => fetchAssignments()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-white/70">Track delivery assignments and performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Total Assignments</h2>
          <p className="text-3xl font-bold text-white mt-2">{metrics.total}</p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Pending</h2>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{metrics.pending}</p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Completed</h2>
          <p className="text-3xl font-bold text-green-400 mt-2">{metrics.completed}</p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Success Rate</h2>
          <p className="text-3xl font-bold text-white mt-2">{metrics.success_rate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Partner</th>
              <th>Area</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td>
                  <span className="font-medium text-white">
                    #{assignment.order?.order_number || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className="text-white/80">
                    {assignment.partner?.name || 'Unassigned'}
                  </span>
                </td>
                <td>
                  <span className="text-white/80">
                    {assignment.order?.area || 'N/A'}
                  </span>
                </td>
                <td>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      assignment.status === 'completed'
                        ? 'bg-green-400/10 text-green-400'
                        : assignment.status === 'pending'
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : 'bg-red-400/10 text-red-400'
                    )}
                  >
                    {assignment.status}
                  </span>
                </td>
                <td>
                  <span className="text-white/60">
                    {new Date(assignment.created_at).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-white/50 py-8">
                  No assignments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
