import React, { useState, useEffect } from 'react';
import {
  Filter,
  Plus,
  ArrowDownUp,
  Search,
  CheckCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import OrderCard from '../components/orders/OrderCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

const Orders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchOrders = async () => {
      try {
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

        // Get user's orders with container details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            containers:container_id (
              name,
              location,
              status
            )
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;
        setOrders(orderData || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Check for success message in location state
    const message = (location.state as any)?.message;
    if (message) {
      setSuccessMessage(message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const filteredOrders = orders
    .filter(order => {
      if (
        searchTerm &&
        !order.id.toString().includes(searchTerm) &&
        !order.container_id.toString().includes(searchTerm)
      ) {
        return false;
      }

      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'amount_high') {
        return b.price - a.price;
      } else if (sortBy === 'amount_low') {
        return a.price - b.price;
      }
      return 0;
    });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <h3 className="text-xl font-medium text-secondary-900">
          Error loading orders
        </h3>
        <p className="text-secondary-500 mt-2">{error.message}</p>
      </div>
    );
  }

  const handleOrderDeleted = (deletedOrderId: number) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedOrderId));
    setSuccessMessage(`Order #${deletedOrderId} has been successfully deleted.`);
     // Clear the message after 5 seconds
       const timer = setTimeout(() => {
         setSuccessMessage('');
       }, 5000);
       // return () => clearTimeout(timer); // Not needed here as it's not in useEffect
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {successMessage && (
        <div className={`flex items-center p-4 text-sm rounded-lg ${
          successMessage.startsWith('Container purchase successful')
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          <CheckCircle className={`h-5 w-5 mr-2 ${
            successMessage.startsWith('Container purchase successful')
              ? 'text-green-500'
              : 'text-red-500'
          }`} />
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Orders</h1>
          <div className="mt-1 text-secondary-500 flex flex-wrap gap-4">
            <span>Total Orders: {totalOrders}</span>
            <span>•</span>
            <span>Pending: {pendingOrders}</span>
            <span>•</span>
            <span>Completed: {completedOrders}</span>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/containers')} // Navigate to /containers
          >
            New Order
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                className="pl-10 pr-3 py-2 w-full rounded-md border border-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by Order ID or Container ID..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-700 mr-2">Status:</span>
            <select
              className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center">
            <ArrowDownUp className="mr-2 h-4 w-4 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-700 mr-2">Sort:</span>
            <select
              className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Price (High to Low)</option>
              <option value="amount_low">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => console.log('Order clicked:', order.id)}
              onOrderDeleted={handleOrderDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-secondary-500">
            No orders found. Create your first order to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;
