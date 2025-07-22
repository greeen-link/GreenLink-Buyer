import React, { useState } from 'react';
import { Filter, ArrowDownUp, AlertTriangle } from 'lucide-react';
import ContainerCard from '../components/containers/ContainerCard';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Container } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Containers: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: containers = [], loading, error } = useSupabaseData<Container>({
    table: 'containers',
    orderBy: { column: 'created_at', ascending: false },
  });

  const handlePurchase = async (container: Container) => {
    try {
      if (container.status === 'inactive') {
        setAlertMessage('This container is inactive and cannot be purchased.');
        setTimeout(() => setAlertMessage(null), 3000); // Hide message after 3 seconds
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to purchase a container');

      // Get the buyer's database ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userError) throw new Error('Failed to get user information');
      if (!userData) throw new Error('User not found');

      // Create a new order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.id,
          container_id: container.id,
          status: 'pending',
          price: 1000, // You can set your own pricing logic
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (orderError) throw orderError;

      // Navigate to orders page
      navigate('/orders', {
        state: { message: 'Container purchase successful! Check your orders for details.' }
      });
    } catch (err: any) {
      console.error('Purchase error:', err.message);
      alert('Failed to purchase container: ' + err.message);
    }
  };

  const filteredContainers = containers.filter(container => {
    if (statusFilter !== 'all' && container.status !== statusFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime();
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

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
          Error loading containers
        </h3>
        <p className="text-secondary-500 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {alertMessage && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-700">{alertMessage}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Container Marketplace</h1>
          <p className="mt-1 text-secondary-500">
            Monitor and manage your container fleet
          </p>
        </div>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-700 mr-2">Status:</span>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <ArrowDownUp className="mr-2 h-4 w-4 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-700 mr-2">Sort:</span>
            <select
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Last Updated</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContainers.map((container) => (
          <ContainerCard 
            key={container.id} 
            container={container} 
            onClick={() => console.log('Container clicked:', container.id)}
            onPurchase={() => handlePurchase(container)}
          />
        ))}
      </div>
      
      {filteredContainers.length === 0 && !loading && (
        <div className="text-center py-10">
          <p className="text-secondary-500">
            {error ? String(error) : 'No containers found.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Containers;
