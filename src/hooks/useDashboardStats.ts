import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats, Container } from '../types';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) throw new Error('Not authenticated');

        // Get user's database ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', authUser.email)
          .single();

        if (userError) throw userError;
        if (!userData) throw new Error('User not found');

        // Fetch user's orders and related containers
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            containers (
              id,
              name,
              latitude,
              longitude,
              status,
              temperature,
              humidity,
              battery_level,
              last_updated
            )
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Extract unique containers from orders, preserving latitude and longitude
        const uniqueContainers = orders?.reduce((acc: Container[], order) => {
          const dbContainer = order.containers as any; // Raw container data from Supabase
          if (dbContainer && !acc.some((c: Container) => c.id === dbContainer.id)) {
            // Ensure latitude and longitude are numbers, otherwise they'll be undefined
            const lat = typeof dbContainer.latitude === 'number' && !isNaN(dbContainer.latitude) ? dbContainer.latitude : undefined;
            const lng = typeof dbContainer.longitude === 'number' && !isNaN(dbContainer.longitude) ? dbContainer.longitude : undefined;

            const processedContainer: Container = {
              ...dbContainer, // Spread all existing fields from dbContainer
              latitude: lat,  // Explicitly set (or overwrite with undefined if invalid)
              longitude: lng, // Explicitly set (or overwrite with undefined if invalid)
              // location: (lat !== undefined && lng !== undefined) ? `${lat},${lng}` : undefined, // Optionally keep the location string if needed elsewhere
            };
            
            // If you've fully migrated and don't need the old 'location' string from dbContainer,
            // you might not even need the 'location' field in processedContainer.
            // For now, we prioritize latitude and longitude numbers.

            acc.push(processedContainer);
          }
          return acc;
        }, [] as Container[]) || [];

        // Calculate total orders and other metrics
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) => sum + order.price, 0) || 0;
        
        // Filter active containers
        const activeContainersArray = uniqueContainers.filter(container => container.status === 'active');
        const activeContainers = activeContainersArray.length;

        // Calculate orders by status
        const ordersByStatus = orders?.reduce<Record<string, number>>((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {}) || {};

        // Calculate monthly orders
        const monthlyOrders = orders?.reduce<Array<{ month: string; count: number; revenue: number }>>((acc, order) => {
          const monthDate = new Date(order.created_at);
          const month = monthDate.toLocaleString('default', { month: 'short' });
          const existingMonth = acc.find(m => m.month === month);
          
          if (existingMonth) {
            existingMonth.count += 1;
            existingMonth.revenue += order.price;
          } else {
            acc.push({ month, count: 1, revenue: order.price });
          }
          
          return acc;
        }, []) || [];

        // Calculate on-time deliveries
        const deliveredOrders = orders?.filter(order => order.status === 'delivered') || [];
        const onTimeDeliveries = deliveredOrders.length;
        const onTimeDeliveriesPercent = deliveredOrders.length ? 
          Math.round((onTimeDeliveries / deliveredOrders.length) * 100) : 0;

        setStats({
          total_orders: totalOrders,
          active_containers: activeContainers,
          total_revenue: totalRevenue,
          orders_by_status: ordersByStatus,
          monthly_orders: monthlyOrders,
          on_time_deliveries_percent: onTimeDeliveriesPercent,
          containers_by_status: {},
          recent_orders: orders?.slice(0, 5) || [],
          recent_containers: activeContainersArray, // Only pass active containers
          top_locations: [],
          delivery_metrics: {
            on_time: onTimeDeliveries,
            delayed: 0,
            total: totalOrders
          },
          container_metrics: {
            temperature_avg: 0,
            humidity_avg: 0,
            battery_level_avg: 0
          }
        });
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
