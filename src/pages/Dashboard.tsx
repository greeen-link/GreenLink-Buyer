import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  BarChart3,
  TrendingUp,
  CheckCircle,
  CreditCard // Replaced DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import ContainerMap, { ContainerWithOrder } from '../components/dashboard/ContainerMap';
import Card from '../components/ui/Card';
import { useDashboardStats } from '../hooks/useDashboardStats';
import Loader from '../components/ui/Loader';

const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <h3 className="text-xl font-medium text-secondary-900">
          Error loading dashboard
        </h3>
        <p className="text-secondary-500 mt-2">{error?.message || 'Failed to load stats'}</p>
      </div>
    );
  }

  const pendingOrders = stats.orders_by_status.pending || 0;

  const containersWithOrders: ContainerWithOrder[] = stats.recent_containers
    .map(container => {
      const order = stats.recent_orders.find(o => o.container_id === container.id);
      return {
        ...container,
        order_id: order?.id
      };
    })
    .filter(container => container.order_id != null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900">My Dashboard</h1>
        <p className="mt-1 text-secondary-500">
          Overview of your container purchases and orders
        </p>
      </div>
      
      {/* Container Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Containers" 
          value={stats.total_containers || 0}
          icon={<Package className="h-5 w-5 text-primary-600" />}
        />
        <StatCard 
          title="Active Containers" 
          value={stats.containers_by_status?.active || 0}
          icon={<Package className="h-5 w-5 text-success-600" />}
        />
        <StatCard 
          title="Inactive Containers" 
          value={stats.containers_by_status?.inactive || 0}
          icon={<Package className="h-5 w-5 text-secondary-600" />}
        />
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="My Orders" 
          value={stats.total_orders}
          icon={<ShoppingCart className="h-5 w-5 text-primary-600" />}
          change={{ value: pendingOrders, isPositive: true }}
        />
        
        {/* <StatCard 
          title="Total Containers" 
          value={stats.total_containers || 0}
          icon={<Package className="h-5 w-5 text-primary-600" />}
        /> */}
        
        <StatCard
          title="Total Spent"
          value={`Rs. ${stats.total_revenue}`}
          icon={<CreditCard className="h-5 w-5 text-primary-600" />}
        />
        
        <StatCard
          title="Delivery Rate" 
          value={`${stats.on_time_deliveries_percent}%`}
          icon={<Clock className="h-5 w-5 text-primary-600" />}
        />
      </div>

      {/* Container Map */}
      {/* The ContainerMap component itself now includes Card, CardHeader, CardTitle, CardContent */}
      <ContainerMap containers={containersWithOrders} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Order History</h3>
              <div className="flex items-center">
                <span className="text-xs text-secondary-500">Last 6 months</span>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthly_orders}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    name="Orders" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column - Recent Activity */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <BarChart3 className="h-5 w-5 text-secondary-400" />
            </div>
            
            <div className="space-y-4">
              {stats.recent_orders.map((order) => (
                <div key={order.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    {order.status === 'delivered' ? (
                      <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
                    ) : order.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-warning-500 mt-0.5" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-primary-500 mt-0.5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-secondary-700">
                      Order #{order.id} - {order.status}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;