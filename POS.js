import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === parseInt(selectedCategory));

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      setError('Product is out of stock');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        setError('Cannot add more of this item');
        setTimeout(() => setError(''), 3000);
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: parseFloat(product.price),
        quantity: 1,
        subtotal: parseFloat(product.price),
        stockQuantity: product.stock_quantity
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const item = cart.find(i => i.productId === productId);
    if (item && newQuantity > item.stockQuantity) {
      setError('Not enough stock');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const processSale = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        discountAmount: 0,
        totalAmount: calculateTotal(),
        paymentMethod
      };

      const response = await axios.post(`${API_URL}/sales`, saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Sale completed successfully! Sale ID: ${response.data.saleId}`);
      setCart([]);
      fetchData(); // Refresh products to update stock
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process sale');
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading POS...</div>;
  }

  return (
    <div className="pos-container">
      <div className="products-section">
        <h2>Point of Sale</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="category-tabs">
          <button 
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id.toString())}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={`product-card ${product.stock_quantity <= 0 ? 'out-of-stock' : ''}`}
              onClick={() => addToCart(product)}
            >
              <h4>{product.name}</h4>
              <p>SKU: {product.sku}</p>
              <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
              <p className="product-stock">Stock: {product.stock_quantity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cart-section">
        <h3>Shopping Cart</h3>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <br />
                  <small>SKU: {item.sku}</small>
                  <br />
                  ${item.price.toFixed(2)} each
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  <button onClick={() => removeFromCart(item.productId)}>×</button>
                </div>
                <div>
                  <strong>${item.subtotal.toFixed(2)}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Tax (8%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method</label>
          <select 
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile_payment">Mobile Payment</option>
          </select>
        </div>

        <div className="cart-actions">
          <button 
            className="btn-checkout" 
            onClick={processSale}
            disabled={processing || cart.length === 0}
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>
          <button 
            className="btn-clear" 
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
