import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function Sales() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data);
    } catch (err) {
      setError('Failed to load sales data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleDetails = async (saleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaleDetails(response.data);
      setSelectedSale(saleId);
    } catch (err) {
      setError('Failed to load sale details');
      console.error(err);
    }
  };

  const closeDetails = () => {
    setSelectedSale(null);
    setSaleDetails(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      case 'refunded': return '#ff9800';
      default: return '#333';
    }
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'mobile_payment': return '📱';
      default: return '💰';
    }
  };

  if (loading) {
    return <div className="loading">Loading sales history...</div>;
  }

  return (
    <div className="sales-container">
      <h1>Sales History</h1>
      
      {error && <div className="error-message">{error}</div>}

      {selectedSale && saleDetails ? (
        <div className="form-container">
          <div className="form-header">
            <h2>Sale Details - #{saleDetails.id}</h2>
            <button className="btn-close" onClick={closeDetails}>Close</button>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <p><strong>Date:</strong> {new Date(saleDetails.created_at).toLocaleString()}</p>
              <p><strong>Cashier:</strong> {saleDetails.username} ({saleDetails.full_name || saleDetails.user_name})</p>
              <p><strong>Payment Method:</strong> {getPaymentIcon(saleDetails.payment_method)} {saleDetails.payment_method}</p>
              <p><strong>Status:</strong> 
                <span style={{ 
                  color: getStatusColor(saleDetails.status),
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}>
                  {saleDetails.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <h3>Items</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {saleDetails.items.map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary" style={{ marginTop: '2rem', maxWidth: '300px', marginLeft: 'auto' }}>
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>${parseFloat(saleDetails.subtotal).toFixed(2)}</span>
            </div>
            {saleDetails.discount_amount > 0 && (
              <div className="cart-summary-row">
                <span>Discount:</span>
                <span>-${parseFloat(saleDetails.discount_amount).toFixed(2)}</span>
              </div>
            )}
            {saleDetails.tax_amount > 0 && (
              <div className="cart-summary-row">
                <span>Tax:</span>
                <span>${parseFloat(saleDetails.tax_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary-row total">
              <span>Total:</span>
              <span>${parseFloat(saleDetails.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <h3>{sales.length}</h3>
              <p>Total Transactions</p>
            </div>
            <div className="stat-card">
              <h3>${sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0).toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
            <div className="stat-card">
              <h3>${(sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0) / (sales.length || 1)).toFixed(2)}</h3>
              <p>Average Sale</p>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Date</th>
                  <th>Cashier</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map(sale => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{new Date(sale.created_at).toLocaleString()}</td>
                      <td>{sale.username}</td>
                      <td>-</td>
                      <td>${parseFloat(sale.subtotal).toFixed(2)}</td>
                      <td>${parseFloat(sale.tax_amount || 0).toFixed(2)}</td>
                      <td>${parseFloat(sale.discount_amount || 0).toFixed(2)}</td>
                      <td><strong>${parseFloat(sale.total_amount).toFixed(2)}</strong></td>
                      <td>{getPaymentIcon(sale.payment_method)}</td>
                      <td>
                        <span style={{ 
                          color: getStatusColor(sale.status),
                          fontWeight: 'bold'
                        }}>
                          {sale.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-action btn-view"
                          onClick={() => fetchSaleDetails(sale.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11">No sales found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Sales;
