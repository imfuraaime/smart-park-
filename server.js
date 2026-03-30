const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'smart_park_store_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ============ AUTH ROUTES ============

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND status = ?', 
            [username, 'active']);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register
app.post('/api/auth/register', authenticateToken, async (req, res) => {
    try {
        const { username, email, password, fullName, role, phone } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, passwordHash, fullName, role || 'cashier', phone]
        );

        res.status(201).json({ 
            message: 'User created successfully',
            userId: result.insertId 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ CATEGORIES ROUTES ============

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories WHERE status = ? ORDER BY name', ['active']);
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create category
app.post('/api/categories', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ PRODUCTS ROUTES ============

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.status = 'active' 
            ORDER BY p.name
        `);
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [req.params.id]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(products[0]);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { name, sku, categoryId, description, price, costPrice, stockQuantity, minStockLevel, barcode } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO products (name, sku, category_id, description, price, cost_price, stock_quantity, min_stock_level, barcode) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, sku, categoryId, description, price, costPrice, stockQuantity, minStockLevel, barcode]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const { name, categoryId, description, price, costPrice, minStockLevel, barcode, status } = req.body;
        
        await pool.query(
            `UPDATE products SET name = ?, category_id = ?, description = ?, price = ?, cost_price = ?, min_stock_level = ?, barcode = ?, status = ? 
             WHERE id = ?`,
            [name, categoryId, description, price, costPrice, minStockLevel, barcode, status, req.params.id]
        );
        
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product stock
app.put('/api/products/:id/stock', authenticateToken, async (req, res) => {
    try {
        const { quantity, transactionType, notes } = req.body;
        
        // Update product stock
        let newQuantity;
        if (transactionType === 'sale') {
            newQuantity = -Math.abs(quantity);
        } else if (transactionType === 'purchase' || transactionType === 'return') {
            newQuantity = Math.abs(quantity);
        } else {
            newQuantity = quantity;
        }
        
        await pool.query(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [newQuantity, req.params.id]
        );
        
        // Record transaction
        await pool.query(
            'INSERT INTO inventory_transactions (product_id, user_id, transaction_type, quantity, notes) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, req.user.id, transactionType, Math.abs(quantity), notes]
        );
        
        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ SALES ROUTES ============

// Create sale
app.post('/api/sales', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { items, subtotal, taxAmount, discountAmount, totalAmount, paymentMethod } = req.body;
        
        // Create sale record
        const [saleResult] = await connection.query(
            `INSERT INTO sales (user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, subtotal, taxAmount || 0, discountAmount || 0, totalAmount, paymentMethod || 'cash']
        );
        
        const saleId = saleResult.insertId;
        
        // Create sale items and update inventory
        for (const item of items) {
            await connection.query(
                'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [saleId, item.productId, item.quantity, item.price, item.subtotal]
            );
            
            // Update product stock
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
            
            // Record inventory transaction
            await connection.query(
                'INSERT INTO inventory_transactions (product_id, user_id, transaction_type, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
                [item.productId, req.user.id, 'sale', item.quantity, item.price]
            );
        }
        
        await connection.commit();
        res.status(201).json({ saleId, message: 'Sale completed successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Create sale error:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        connection.release();
    }
});

// Get sales history
app.get('/api/sales', authenticateToken, async (req, res) => {
    try {
        const [sales] = await pool.query(`
            SELECT s.*, u.username, u.full_name as user_name 
            FROM sales s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.created_at DESC 
            LIMIT 100
        `);
        res.json(sales);
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get sale details
app.get('/api/sales/:id', authenticateToken, async (req, res) => {
    try {
        const [sales] = await pool.query(`
            SELECT s.*, u.username, u.full_name as user_name 
            FROM sales s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `, [req.params.id]);
        
        if (sales.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        
        const [items] = await pool.query(`
            SELECT si.*, p.name as product_name, p.sku 
            FROM sale_items si 
            JOIN products p ON si.product_id = p.id 
            WHERE si.sale_id = ?
        `, [req.params.id]);
        
        res.json({ ...sales[0], items });
    } catch (error) {
        console.error('Get sale details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ DASHBOARD ROUTES ============

// Get dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        // Get total products
        const [productsCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE status = ?', ['active']);
        
        // Get low stock products
        const [lowStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_level AND status = ?', ['active']);
        
        // Get today's sales
        const [todaySales] = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
            FROM sales 
            WHERE DATE(created_at) = CURDATE() AND status = 'completed'
        `);
        
        // Get monthly sales
        const [monthlySales] = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
            FROM sales 
            WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'completed'
        `);
        
        // Get recent sales
        const [recentSales] = await pool.query(`
            SELECT s.*, u.username 
            FROM sales s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.created_at DESC 
            LIMIT 5
        `);
        
        // Get top selling products
        const [topProducts] = await pool.query(`
            SELECT p.name, p.sku, SUM(si.quantity) as total_sold, SUM(si.subtotal) as total_revenue
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            JOIN sales s ON si.sale_id = s.id
            WHERE MONTH(s.created_at) = MONTH(CURDATE()) AND YEAR(s.created_at) = YEAR(CURDATE())
            GROUP BY p.id, p.name, p.sku
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        
        res.json({
            totalProducts: productsCount[0].count,
            lowStockProducts: lowStock[0].count,
            todaySales: {
                count: todaySales[0].count,
                total: parseFloat(todaySales[0].total)
            },
            monthlySales: {
                count: monthlySales[0].count,
                total: parseFloat(monthlySales[0].total)
            },
            recentSales,
            topProducts
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ INVENTORY ROUTES ============

// Get inventory transactions
app.get('/api/inventory/transactions', authenticateToken, async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT it.*, p.name as product_name, p.sku, u.username
            FROM inventory_transactions it
            JOIN products p ON it.product_id = p.id
            JOIN users u ON it.user_id = u.id
            ORDER BY it.created_at DESC
            LIMIT 50
        `);
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ SUPPLIERS ROUTES ============

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
    try {
        const [suppliers] = await pool.query('SELECT * FROM suppliers WHERE status = ? ORDER BY name', ['active']);
        res.json(suppliers);
    } catch (error) {
        console.error('Get suppliers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create supplier
app.post('/api/suppliers', authenticateToken, async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;
        const [result] = await pool.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, contactPerson, email, phone, address]
        );
        res.status(201).json({ id: result.insertId, message: 'Supplier created successfully' });
    } catch (error) {
        console.error('Create supplier error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Smart Park Store API running on port ${PORT}`);
});
