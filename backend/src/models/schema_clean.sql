-- SQLite Schema for CampusDeals

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Drop tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;  
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_password TEXT NOT NULL,
    role TEXT CHECK(role IN ('buyer','seller','admin')) DEFAULT 'buyer',
    user_phone TEXT,
    user_studyyear TEXT,
    user_branch TEXT,
    user_section TEXT,
    user_residency TEXT,
    payment_received REAL DEFAULT 0,
    amount_given REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT CHECK(product_name IN ('drafter','white_lab_coat','brown_lab_coat','calculator')) NOT NULL,
    product_variant TEXT CHECK(product_variant IN ('premium_drafter','standard_drafter','budget_drafter',
                         'S','M','L','XL','XXL',
                         'MS','ES','ES-Plus')) NOT NULL,
    product_code TEXT UNIQUE,
    product_price REAL NOT NULL,
    product_images TEXT,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    serial_no TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash','upi')) NOT NULL,
    status TEXT CHECK(status IN ('pending','completed','cancelled')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cart_user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (cart_user_id) REFERENCES cart(user_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(user_email);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_serial ON orders(serial_no);