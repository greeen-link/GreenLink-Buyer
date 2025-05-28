import React from 'react';
import { ShoppingBag, DollarSign, Calendar, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { Order } from '../../types';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">Order #{order.id}</h3>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center text-sm">
          <ShoppingBag className="mr-2 h-4 w-4 text-secondary-500" />
          <span className="text-secondary-700">
            {order.containers?.name || `Container ID: ${order.container_id}`}
          </span>
        </div>

        {order.containers?.location && (
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-secondary-500" />
            <span className="text-secondary-700">{order.containers.location}</span>
          </div>
        )}

        <div className="flex items-center text-sm">
          <DollarSign className="mr-2 h-4 w-4 text-secondary-500" />
          <span className="text-secondary-700">${order.price}</span>
        </div>

        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-secondary-500" />
          <span className="text-secondary-700">{formatDate(order.created_at)}</span>
        </div>

        <div className="flex items-center text-sm">
          <span className="ml-6 text-secondary-500">Payment: {order.payment_status}</span>
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;
