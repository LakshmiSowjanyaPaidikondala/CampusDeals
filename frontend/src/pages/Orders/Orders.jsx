import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Order History</h1>
        <p>Track your purchases and order status</p>
      </div>
      
      <div className="orders-content">
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>When you make your first purchase, it will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Orders;