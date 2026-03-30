import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [adjustmentData, setAdjustmentData] = useState({
    quantity: '',
    transactionType: 'adjustment',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [productsRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/inventory/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProducts(productsRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      setError('Failed to load inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/products/${selectedProduct.id}/stock`,
        {
          quantity: parseInt(adjustmentData.quantity),
          transactionType: adjustmentData.transactionType,
          notes: adjustmentData.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Stock adjusted successfully');
      resetAdjustment();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to adjust stock');
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetAdjustment = () => {
    setAdjustmentData({
      quantity: '',
      transactionType: 'adjustment',
      notes: ''
    });
    setSelectedProduct(null);
    setShowAdjustmentForm(false);
  };

  const openAdjustment = (product) => {
    setSelectedProduct(product);
    setShowAdjustmentForm(true);
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'purchase': return '📥';
      case 'sale': return '📤';
      case 'return': return '↩️';
      case 'adjustment': return '🔧';
      default: return '📋';
    }
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="inventory-container">
      <h1>Inventory Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showAdjustmentForm && selectedProduct && (
        <div className="form-container">
          <div className="form-header">
            <h2>Adjust Stock - {selectedProduct.name}</h2>
            <button className="btn-close" onClick={resetAdjustment}>Cancel</button>
          </div>
          
          <form onSubmit={handleAdjustment}>
            <div className="form-group">
              <label htmlFor="currentStock">Current Stock</label>
              <input
                type="text"
                id="currentStock"
                value={selectedProduct.stock_quantity}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="transactionType">Transaction Type *</label>
              <select
                id="transactionType"
                value={adjustmentData.transactionType}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, transactionType: e.target.value })}
                required
              >
                <option value="adjustment">Stock Adjustment</option>
                <option value="purchase">Purchase/Restock</option>
                <option value="return">Customer Return</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                required
                min="1"
                placeholder="Enter quantity"
              />
              <small>
                {adjustmentData.transactionType === 'sale' 
                  ? 'This will reduce stock' 
                  : 'This will increase stock'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={adjustmentData.notes}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                rows="3"
                placeholder="Reason for adjustment..."
              />
            </div>

            <button type="submit" className="btn-primary">
              Apply Adjustment
            </button>
          </form>
        </div>
      )}

      <div className="data-table-container">
        <h3>Current Stock Levels</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category_name || 'N/A'}</td>
                <td>{product.stock_quantity}</td>
                <td>{product.min_stock_level}</td>
                <td>
                  {product.stock_quantity <= 0 ? (
                    <span style={{ color: '#ff4444', fontWeight: 'bold' }}>Out of Stock</span>
                  ) : product.stock_quantity <= product.min_stock_level ? (
                    <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Low Stock</span>
                  ) : (
                    <span style={{ color: '#4CAF50' }}>In Stock</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => openAdjustment(product)}
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-table-container" style={{ marginTop: '2rem' }}>
        <h3>Recent Inventory Transactions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>User</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.created_at).toLocaleString()}</td>
                  <td>
                    <span>{getTransactionIcon(transaction.transaction_type)} {transaction.transaction_type}</span>
                  </td>
                  <td>{transaction.product_name}</td>
                  <td>{transaction.sku}</td>
                  <td>
                    {transaction.transaction_type === 'sale' ? '-' : '+'}
                    {transaction.quantity}
                  </td>
                  <td>{transaction.username}</td>
                  <td>{transaction.notes || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
