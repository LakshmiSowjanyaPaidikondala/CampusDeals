import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import './Orders.css';

// Mock data based on Buy.jsx products
const MOCK_ORDERS = [
  {
    order_id: 1,
    serial_no: "ORD-001",
    order_type: "buy",
    total_items: 2,
    cart_id: 1,
    total_amount: 1350.00,
    payment_method: "upi",
    status: "delivered",
    created_at: "2024-10-20T10:30:00Z",
    delivered_date: "2024-10-22T14:20:00Z",
    items: [
      {
        product_id: 14,
        product_name: "calculator",
        product_variant: "ES-Plus",
        quantity: 1,
        price_per_item: 1000.00,
        item_total: 1000.00,
        serial_numbers: ["CALC-001"],
        image: "calculator"
      },
      {
        product_id: 1,
        product_name: "drafter",
        product_variant: "premium_drafter",
        quantity: 1,
        price_per_item: 350.00,
        item_total: 350.00,
        serial_numbers: ["DFT-001"],
        image: "drafter"
      }
    ]
  },
  {
    order_id: 2,
    serial_no: "ORD-002",
    order_type: "buy",
    total_items: 3,
    cart_id: 2,
    total_amount: 690.00,
    payment_method: "cash",
    status: "confirmed",
    created_at: "2024-10-19T14:15:00Z",
    expected_date: "2024-10-25T00:00:00Z",
    items: [
      {
        product_id: 4,
        product_name: "white_lab_coat",
        product_variant: "M",
        quantity: 1,
        price_per_item: 230.00,
        item_total: 230.00,
        serial_numbers: ["WLC-001"],
        image: "white_lab_coat"
      },
      {
        product_id: 9,
        product_name: "brown_lab_coat",
        product_variant: "M",
        quantity: 1,
        price_per_item: 230.00,
        item_total: 230.00,
        serial_numbers: ["BLC-001"],
        image: "brown_lab_coat"
      },
      {
        product_id: 17,
        product_name: "chartbox",
        product_variant: "chart holder",
        quantity: 1,
        price_per_item: 230.00,
        item_total: 230.00,
        serial_numbers: ["CHART-001"],
        image: "chartbox"
      }
    ]
  },
  {
    order_id: 3,
    serial_no: "ORD-003",
    order_type: "sell",
    total_items: 1,
    cart_id: 3,
    total_amount: 950.00,
    payment_method: "upi",
    status: "delivered",
    created_at: "2024-10-18T09:45:00Z",
    delivered_date: "2024-10-20T11:30:00Z",
    items: [
      {
        product_id: 15,
        product_name: "calculator",
        product_variant: "ES",
        quantity: 1,
        price_per_item: 950.00,
        item_total: 950.00,
        serial_numbers: ["CALC-002"],
        image: "calculator"
      }
    ]
  },
  {
    order_id: 4,
    serial_no: "ORD-004",
    order_type: "buy",
    total_items: 2,
    cart_id: 4,
    total_amount: 580.00,
    payment_method: "upi",
    status: "shipped",
    created_at: "2024-10-17T16:20:00Z",
    expected_date: "2024-10-24T00:00:00Z",
    items: [
      {
        product_id: 2,
        product_name: "drafter",
        product_variant: "standard_drafter",
        quantity: 1,
        price_per_item: 350.00,
        item_total: 350.00,
        serial_numbers: ["DFT-002"],
        image: "drafter"
      },
      {
        product_id: 17,
        product_name: "chartbox",
        product_variant: "chart holder",
        quantity: 1,
        price_per_item: 230.00,
        item_total: 230.00,
        serial_numbers: ["CHART-002"],
        image: "chartbox"
      }
    ]
  },
  {
    order_id: 5,
    serial_no: "ORD-005",
    order_type: "buy",
    total_items: 1,
    cart_id: 5,
    total_amount: 300.00,
    payment_method: "cash",
    status: "cancelled",
    created_at: "2024-10-16T11:30:00Z",
    items: [
      {
        product_id: 3,
        product_name: "drafter",
        product_variant: "budget_drafter",
        quantity: 1,
        price_per_item: 300.00,
        item_total: 300.00,
        serial_numbers: ["DFT-003"],
        image: "drafter"
      }
    ]
  }
];

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    if (useMockData) {
      setOrders(MOCK_ORDERS);
      setFilteredOrders(MOCK_ORDERS);
    } else {
      fetchOrders();
    }
  }, [useMockData]);

  useEffect(() => {
    filterOrders(activeFilter);
  }, [orders, activeFilter]);

  const fetchOrders = async () => {
    setOrders([]);
    setFilteredOrders([]);
  };

  const filterOrders = (filter) => {
    let filtered = orders;
    
    switch (filter) {
      case 'buy':
        filtered = orders.filter(order => order.order_type === 'buy');
        break;
      case 'sell':
        filtered = orders.filter(order => order.order_type === 'sell');
        break;
      case 'confirmed':
        filtered = orders.filter(order => order.status === 'confirmed');
        break;
      case 'shipped':
        filtered = orders.filter(order => order.status === 'shipped');
        break;
      case 'delivered':
        filtered = orders.filter(order => order.status === 'delivered');
        break;
      case 'cancelled':
        filtered = orders.filter(order => order.status === 'cancelled');
        break;
      default:
        filtered = orders;
    }
    
    setFilteredOrders(filtered);
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updatedOrders = orders.map(order => 
        order.order_id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      );
      setOrders(updatedOrders);
      
      // In real implementation, you would make an API call here
      console.log(`Order ${orderId} cancelled`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return '✅';
      case 'shipped':
        return '🚚';
      case 'confirmed':
        return '📦';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getProductDisplayName = (productName) => {
    const nameMap = {
      'calculator': 'Scientific Calculator',
      'drafter': 'Engineering Drafter',
      'chartbox': 'Chart Holder',
      'white_lab_coat': 'White Lab Coat',
      'brown_lab_coat': 'Brown Lab Coat'
    };
    return nameMap[productName] || productName;
  };

  const getVariantDisplayName = (variant) => {
    const variantMap = {
      'MS': 'MS Model',
      'ES': 'ES Model',
      'ES-Plus': 'ES Plus Model',
      'premium_drafter': 'Premium',
      'standard_drafter': 'Standard',
      'budget_drafter': 'Budget',
      'S': 'Small',
      'M': 'Medium',
      'L': 'Large',
      'XL': 'Extra Large',
      'XXL': 'Double Extra Large',
      'chart holder': 'Standard'
    };
    return variantMap[variant] || variant;
  };

  const getProductImage = (imageName) => {
    const imageMap = {
      'calculator': '🧮',
      'drafter': '📐',
      'chartbox': '📊',
      'white_lab_coat': '🥼',
      'brown_lab_coat': '🔧'
    };
    return imageMap[imageName] || '📦';
  };

  const getProgressSteps = (status) => {
    const steps = [
      { name: 'Ordered', status: 'completed' },
      { name: 'Confirmed', status: status === 'confirmed' || status === 'shipped' || status === 'delivered' ? 'completed' : 'pending' },
      { name: 'Shipped', status: status === 'shipped' || status === 'delivered' ? 'completed' : 'pending' },
      { name: 'Delivered', status: status === 'delivered' ? 'completed' : 'pending' }
    ];
    
    if (status === 'cancelled') {
      steps.forEach(step => step.status = 'cancelled');
    }
    
    return steps;
  };

  return (
    <div className="orders-container">
      {/* Header */}
      <div className="orders-header">
        <div className="header-content">
          <h1>Your Orders</h1>
          <p>Track, return, or buy things again</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="orders-main">
        {/* Sidebar Filters */}
        <div className="orders-sidebar">
          <div className="filter-section">
            <h3>Filter Orders</h3>
            <div className="filter-options">
              <button 
                className={activeFilter === 'all' ? 'active' : ''}
                onClick={() => setActiveFilter('all')}
              >
                All Orders
              </button>
              <button 
                className={activeFilter === 'buy' ? 'active' : ''}
                onClick={() => setActiveFilter('buy')}
              >
                Purchases
              </button>
              <button 
                className={activeFilter === 'sell' ? 'active' : ''}
                onClick={() => setActiveFilter('sell')}
              >
                Sales
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Order Status</h3>
            <div className="filter-options">
              <button 
                className={activeFilter === 'confirmed' ? 'active' : ''}
                onClick={() => setActiveFilter('confirmed')}
              >
                Confirmed
              </button>
              <button 
                className={activeFilter === 'delivered' ? 'active' : ''}
                onClick={() => setActiveFilter('delivered')}
              >
                Delivered
              </button>
              <button 
                className={activeFilter === 'cancelled' ? 'active' : ''}
                onClick={() => setActiveFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>

          <div className="data-toggle-section">
            <h3>Data Source</h3>
            <div className="data-toggle">
              <button 
                className={useMockData ? 'active' : ''}
                onClick={() => setUseMockData(true)}
              >
                Mock Data
              </button>
              <button 
                className={!useMockData ? 'active' : ''}
                onClick={() => setUseMockData(false)}
              >
                Real Data
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-content">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders found</h3>
              <p>We couldn't find any orders matching your criteria.</p>
              <button className="browse-btn" onClick={() => window.location.href = '/buy'}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.order_id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-meta">
                      <div className="order-placed">
                        <span className="label">ORDER PLACED</span>
                        <span className="value">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="order-total">
                        <span className="label">TOTAL</span>
                        <span className="value">₹{order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="order-ship-to">
                        <span className="label">SHIP TO</span>
                        <span className="value">{user?.name || 'Student User'}</span>
                      </div>
                    </div>
                    <div className="order-id-section">
                      <div className="order-actions">
                        <button className="action-btn">View order details</button>
                        {order.status === 'delivered' && (
                          <button className="action-btn">Buy again</button>
                        )}
                        {(order.status === 'confirmed' || order.status === 'shipped') && (
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => handleCancelOrder(order.order_id)}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <div className="product-emoji">
                            {getProductImage(item.image)}
                          </div>
                        </div>
                        <div className="item-details">
                          <h4 className="item-name">{getProductDisplayName(item.product_name)}</h4>
                          <p className="item-variant">{getVariantDisplayName(item.product_variant)}</p>
                          <p className="item-quantity">Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          <div className="price">₹{item.item_total.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;