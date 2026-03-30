import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalProducts || 0}</h3>
          <p>Total Products</p>
        </div>
        
        <div className="stat-card">
          <h3>{stats?.lowStockProducts || 0}</h3>
          <p>Low Stock Items</p>
        </div>
        
        <div className="stat-card">
          <h3>${stats?.todaySales?.total?.toFixed(2) || '0.00'}</h3>
          <p>Today's Sales ({stats?.todaySales?.count || 0} transactions)</p>
        </div>
        
        <div className="stat-card">
          <h3>${stats?.monthlySales?.total?.toFixed(2) || '0.00'}</h3>
          <p>Monthly Sales ({stats?.monthlySales?.count || 0} transactions)</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Sales</h3>
          {stats?.recentSales?.length > 0 ? (
            <ul>
              {stats.recentSales.map((sale) => (
                <li key={sale.id}>
                  <strong>Sale #{sale.id}</strong> - ${sale.total_amount?.toFixed(2)} 
                  <br />
                  <small>
                    {new Date(sale.created_at).toLocaleString()} | {sale.username}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent sales</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Top Selling Products</h3>
          {stats?.topProducts?.length > 0 ? (
            <ul>
              {stats.topProducts.map((product, index) => (
                <li key={index}>
                  <strong>{product.name}</strong> (SKU: {product.sku})
                  <br />
                  <small>
                    Sold: {product.total_sold} units | Revenue: ${product.total_revenue?.toFixed(2)}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sales data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
