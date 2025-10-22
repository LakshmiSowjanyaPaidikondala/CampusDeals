// Test Cart Integration Component
import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';

const CartTestComponent = () => {
  const { 
    buyCartItems, 
    sellCartItems, 
    addToBuyCart, 
    addToSellCart,
    isLoadingBuyCart,
    isLoadingSellCart,
    buyCartError,
    sellCartError,
    getBuyCartCount,
    getSellCartCount
  } = useCart();
  
  const { isAuthenticated } = useAuth();

  const testProduct = {
    id: 1,
    name: 'drafter',
    variant: 'premium_drafter',
    price: 400,
    originalPrice: 480,
    stock: 15,
    inStock: 15,
    productCode: 'DFT-P',
    image: '/src/assets/Drafter.jpeg',
    description: 'drafter - premium_drafter',
    seller: 'Campus Deals',
    category: 'drafter',
    type: 'buy'
  };

  const handleTestBuyCart = async () => {
    try {
      await addToBuyCart(testProduct);
      console.log('Successfully added to buy cart');
    } catch (error) {
      console.error('Failed to add to buy cart:', error);
    }
  };

  const handleTestSellCart = async () => {
    try {
      await addToSellCart({ ...testProduct, type: 'sell' });
      console.log('Successfully added to sell cart');
    } catch (error) {
      console.error('Failed to add to sell cart:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Cart Integration Test</h3>
      
      <div>
        <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Logged In' : 'Not Logged In'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Buy Cart Status</h4>
        <p>Items: {getBuyCartCount()}</p>
        <p>Loading: {isLoadingBuyCart ? 'Yes' : 'No'}</p>
        <p>Error: {buyCartError || 'None'}</p>
        <button onClick={handleTestBuyCart} disabled={isLoadingBuyCart}>
          Test Add to Buy Cart
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Sell Cart Status</h4>
        <p>Items: {getSellCartCount()}</p>
        <p>Loading: {isLoadingSellCart ? 'Yes' : 'No'}</p>
        <p>Error: {sellCartError || 'None'}</p>
        <button onClick={handleTestSellCart} disabled={isLoadingSellCart}>
          Test Add to Sell Cart
        </button>
      </div>

      <div>
        <h4>Cart Contents</h4>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <h5>Buy Cart ({buyCartItems.length} items)</h5>
            <pre style={{ fontSize: '12px' }}>
              {JSON.stringify(buyCartItems, null, 2)}
            </pre>
          </div>
          <div>
            <h5>Sell Cart ({sellCartItems.length} items)</h5>
            <pre style={{ fontSize: '12px' }}>
              {JSON.stringify(sellCartItems, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTestComponent;