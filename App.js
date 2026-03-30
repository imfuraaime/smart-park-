import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Products from './components/Products';
import Sales from './components/Sales';
import './App.css';

// API configuration
const API_URL = 'http://localhost:3001/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <nav className="navbar">
            <div className="nav-brand">
              <h2>🏞️ Smart Park Store</h2>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/pos" className="nav-link">Point of Sale</Link>
              <Link to="/products" className="nav-link">Products</Link>
              <Link to="/inventory" className="nav-link">Inventory</Link>
              <Link to="/sales" className="nav-link">Sales History</Link>
            </div>
            <div className="nav-user">
              <span>Welcome, {user?.fullName}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          </nav>
        )}
        
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={<PrivateRoute><Dashboard /></PrivateRoute>} 
            />
            <Route 
              path="/pos" 
              element={<PrivateRoute><POS /></PrivateRoute>} 
            />
            <Route 
              path="/products" 
              element={<PrivateRoute><Products /></PrivateRoute>} 
            />
            <Route 
              path="/inventory" 
              element={<PrivateRoute><Inventory /></PrivateRoute>} 
            />
            <Route 
              path="/sales" 
              element={<PrivateRoute><Sales /></PrivateRoute>} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
