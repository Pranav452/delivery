'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import OrderModal from '@/components/OrderModal';

interface DashboardMetrics {
  totalOrders: number;
  activePartners: number;
  successRate: number;
  pendingAssignments: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  area: string;
  delivery_address: string;
  contact_number: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  assignments?: {
    id: number;
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'failed';
    partner?: {
      id: number;
      name: string;
      email: string;
      phone: string;
      success_rate: number;
      area: string;
    };
  }[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrders: 0,
    activePartners: 0,
    successRate: 0,
    pendingAssignments: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | undefined>();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with assignments and partners in a single query
      const { data: ordersWithAssignments, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          assignments (
            id,
            status,
            partner:delivery_partners (
              id,
              name,
              email,
              phone,
              success_rate,
              area
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      // Fetch active delivery partners
      const { data: activePartners, error: partnersError } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('status', 'active');

      if (partnersError) {
        console.error('Error fetching partners:', partnersError);
        throw partnersError;
      }

      // Calculate metrics
      const totalOrders = ordersWithAssignments?.length || 0;
      const pendingAssignments = ordersWithAssignments?.filter(o => o.status === 'pending').length || 0;
      
      // Calculate average success rate from active partners
      const totalSuccessRate = activePartners?.reduce((acc, partner) => acc + (partner.success_rate || 0), 0) || 0;
      const avgSuccessRate = activePartners?.length ? totalSuccessRate / activePartners.length : 0;

      setMetrics({
        totalOrders,
        activePartners: activePartners?.length || 0,
        successRate: avgSuccessRate,
        pendingAssignments,
      });

      // Set recent orders (last 5)
      setRecentOrders(ordersWithAssignments?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddOrder = () => {
    setSelectedOrder(undefined);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: RecentOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/70">Overview of your delivery operations</p>
        </div>
        <button
          onClick={handleAddOrder}
          className="glass-button px-4 py-2 bg-blue-500/20"
        >
          Add New Order
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Total Orders</h2>
          <p className="text-3xl font-bold text-white mt-2">{metrics.totalOrders}</p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Active Partners</h2>
          <p className="text-3xl font-bold text-green-400 mt-2">{metrics.activePartners}</p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Success Rate</h2>
          <p className="text-3xl font-bold text-white mt-2">{metrics.successRate.toFixed(1)}%</p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white/70">Pending Assignments</h2>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{metrics.pendingAssignments}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
        </div>
        <table className="glass-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Area</th>
              <th>Status</th>
              <th>Partner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5">
                <td>
                  <span className="text-white/80">{order.order_number}</span>
                </td>
                <td>
                  <span className="text-white/80">{order.customer_name}</span>
                </td>
                <td>
                  <span className="text-white/80">{order.area}</span>
                </td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed'
                      ? 'bg-green-400/10 text-green-400'
                      : order.status === 'cancelled'
                      ? 'bg-red-400/10 text-red-400'
                      : order.status === 'in_progress'
                      ? 'bg-blue-400/10 text-blue-400'
                      : order.status === 'assigned'
                      ? 'bg-purple-400/10 text-purple-400'
                      : 'bg-yellow-400/10 text-yellow-400'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.assignments?.[0]?.status === 'delivered'
                      ? 'bg-green-400/10 text-green-400'
                      : order.assignments?.[0]?.status === 'failed'
                      ? 'bg-red-400/10 text-red-400'
                      : order.assignments?.[0]?.status === 'picked_up'
                      ? 'bg-blue-400/10 text-blue-400'
                      : order.assignments?.[0]?.status === 'accepted'
                      ? 'bg-purple-400/10 text-purple-400'
                      : 'bg-yellow-400/10 text-yellow-400'
                  }`}>
                    {order.assignments?.[0]?.status
                      ? order.assignments[0].status.charAt(0).toUpperCase() + 
                        order.assignments[0].status.slice(1)
                      : 'Pending'}
                  </span>
                </td>
                <td>
                  <span className="text-white/80">
                    {order.assignments?.[0]?.partner?.name || 'Unassigned'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-white/50">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
