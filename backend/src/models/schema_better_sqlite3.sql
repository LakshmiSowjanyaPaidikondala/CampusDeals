-- Better-SQLite3 Optimized Schema
-- This file is optimized for better-sqlite3@12.2.0

-- Enable foreign key constraints and set optimal pragmas for better-sqlite3
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000;
PRAGMA temp_store = memory;

-- Create tables only if they don't exist (preserve existing data)
-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT CHECK(product_name IN ('drafter','white_lab_coat','brown_lab_coat','calculator','chartbox')) NOT NULL,
    product_variant TEXT CHECK(product_variant IN ('premium_drafter','standard_drafter','budget_drafter', 'S','M','L','XL','XXL', 'MS','ES','ES-Plus','chart holder')) NOT NULL,
    product_code TEXT UNIQUE,
    product_price REAL NOT NULL,
    product_images TEXT,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    serial_no TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash','upi')) NOT NULL,
    status TEXT CHECK(status IN ('pending','completed','cancelled')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked INTEGER DEFAULT 0,
    revoked_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for optimal performance with better-sqlite3
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_variant ON products(product_variant);
CREATE INDEX IF NOT EXISTS idx_cart_cart ON cart(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_serial ON orders(serial_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked);

-- Analyze tables for query optimization
ANALYZE;