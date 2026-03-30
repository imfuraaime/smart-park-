import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    barcode: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 10
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product updated successfully');
      } else {
        await axios.post(`${API_URL}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product created successfully');
      }

      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.category_id || '',
      description: product.description || '',
      price: product.price.toString(),
      costPrice: product.cost_price?.toString() || '',
      stockQuantity: product.stock_quantity.toString(),
      minStockLevel: product.min_stock_level.toString(),
      barcode: product.barcode || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      description: '',
      price: '',
      costPrice: '',
      stockQuantity: '',
      minStockLevel: '',
      barcode: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-container">
      <h1>Products Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginBottom: '1rem' }}>
          Add New Product
        </button>
      )}

      {showForm && (
        <div className="form-container">
          <div className="form-header">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <button className="btn-close" onClick={resetForm}>Cancel</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                disabled={editingProduct !== null}
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="costPrice">Cost Price</label>
              <input
                type="number"
                id="costPrice"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockQuantity">Initial Stock Quantity</label>
              <input
                type="number"
                id="stockQuantity"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                disabled={editingProduct !== null}
              />
            </div>

            <div className="form-group">
              <label htmlFor="minStockLevel">Minimum Stock Level</label>
              <input
                type="number"
                id="minStockLevel"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="barcode">Barcode</label>
              <input
                type="text"
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Min Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category_name || 'N/A'}</td>
                <td>${parseFloat(product.price).toFixed(2)}</td>
                <td>
                  <span style={{ 
                    color: product.stock_quantity <= product.min_stock_level ? '#ff4444' : 'inherit',
                    fontWeight: product.stock_quantity <= product.min_stock_level ? 'bold' : 'normal'
                  }}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td>{product.min_stock_level}</td>
                <td>
                  <button className="btn-action btn-edit" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
