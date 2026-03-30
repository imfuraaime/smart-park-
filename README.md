# 🏞️ Smart Park Store Management System

A comprehensive store management system for park facilities built with React.js, Node.js, and MySQL.

## 🌟 Features

### Core Functionality
- **Point of Sale (POS)**: Fast and intuitive sales interface with real-time inventory management
- **Product Management**: Complete CRUD operations for products with categories and stock tracking
- **Inventory Control**: Track stock levels, low stock alerts, and inventory transactions
- **Sales Analytics**: Dashboard with real-time statistics, trends, and reporting
- **User Management**: Role-based access control (Admin, Manager, Cashier)

### Technical Stack
- **Frontend**: React.js with modern hooks and components
- **Backend**: Node.js with Express.js framework
- **Database**: MySQL with optimized schema
- **Authentication**: JWT-based secure authentication

## 📁 Project Structure

```
smart-park-store/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection configuration
│   ├── database/
│   │   └── schema.sql           # MySQL database schema
│   └── server.js               # Express API server
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML template
│   └── src/
│       ├── components/         # React components
│       │   ├── Login.js       # Authentication
│       │   ├── Dashboard.js    # Main dashboard
│       │   ├── POS.js         # Point of Sale system
│       │   ├── Products.js    # Product management
│       │   ├── Inventory.js   # Inventory management
│       │   └── Sales.js      # Sales history
│       ├── App.js            # Main React application
│       ├── App.css          # Styling
│       └── index.js         # React entry point
└── package.json             # Root dependencies
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Step 1: Database Setup

1. **Install MySQL** if not already installed
2. **Create the database** by running the schema:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or manually execute the SQL commands in `backend/database/schema.sql` using MySQL Workbench or command line.

### Step 2: Backend Setup

1. Navigate to the project directory:
```bash
cd smart-park-store
```

2. Install backend dependencies:
```bash
npm install
```

3. **Configure environment variables** (optional):
Create a `.env` file in the root directory:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_park_store
JWT_SECRET=your_secret_key
```

4. **Update the password hash** in the database:
The default admin user password is `admin123`. For security, you should update it after first login by modifying the password through the application.

### Step 3: Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

### Step 4: Run the Application

You can run the application in two ways:

**Option 1: Run both servers simultaneously**
```bash
npm run dev
```

**Option 2: Run servers separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🔐 Default Login Credentials

- **Username**: admin
- **Password**: admin123
- **Role**: Administrator

⚠️ **Important**: Change the default password after first login!

## 📊 Database Schema Overview

### Main Tables
- **users**: System users (admins, managers, cashiers)
- **products**: Store inventory items
- **categories**: Product categories
- **sales**: Transaction records
- **sale_items**: Individual items in each sale
- **inventory_transactions**: Stock movement tracking
- **suppliers**: Vendor management
- **purchase_orders**: Stock replenishment orders

### Key Features
- Automatic stock level tracking
- Transaction history
- Low stock alerts
- Sales analytics
- Role-based permissions

## 🎨 UI Features

### Dashboard
- Real-time sales statistics
- Today's and monthly sales summaries
- Top selling products
- Recent transactions
- Low stock alerts

### Point of Sale (POS)
- Quick product selection by category
- Shopping cart functionality
- Multiple payment methods (Cash, Card, Mobile)
- Automatic tax calculation (8%)
- Real-time inventory updates

### Product Management
- Add/Edit/Delete products
- Category assignment
- Stock level tracking
- Cost and margin tracking
- Barcode support

### Inventory Management
- Stock level monitoring
- Inventory adjustments
- Transaction history
- Low stock warnings
- Multiple transaction types (Purchase, Sale, Adjustment, Return)

### Sales History
- Complete transaction records
- Detailed sale views
- Payment method tracking
- Sales analytics and summaries

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `PUT /api/products/:id/stock` - Update stock

### Sales
- `POST /api/sales` - Create new sale
- `GET /api/sales` - Get sales history
- `GET /api/sales/:id` - Get sale details

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Inventory
- `GET /api/inventory/transactions` - Get inventory transactions

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Secure API endpoints
- Input validation

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

Perfect for use on POS terminals and store management workstations.

## 🔄 Future Enhancements

- Print receipts functionality
- Barcode scanner integration
- Customer loyalty program
- Advanced reporting and exports
- Multi-store support
- Inventory forecasting
- Supplier management
- Purchase order system

## 📝 License

This project is created for demonstration purposes and can be freely used and modified.

## 🤝 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for Smart Park Stores**
