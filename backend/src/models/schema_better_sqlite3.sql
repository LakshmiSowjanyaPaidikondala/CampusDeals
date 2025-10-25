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
    role TEXT CHECK(role IN ('buyer','seller','admin') OR role IS NULL) DEFAULT NULL,
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

-- Cart table (legacy - keep for compatibility)
CREATE TABLE IF NOT EXISTS cart (
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Buy Cart table (for buyers)
CREATE TABLE IF NOT EXISTS buy_cart (
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Sell Cart table (for sellers)
CREATE TABLE IF NOT EXISTS sell_cart (
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
    order_type TEXT CHECK(order_type IN ('buy','sell')) DEFAULT 'buy',
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    cart_id INTEGER NULL,
    linked_order_id INTEGER NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash','upi')) NOT NULL,
    status TEXT CHECK(status IN ('pending','completed','cancelled')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (cart_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (linked_order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- Order Items table (for detailed order line items)
CREATE TABLE IF NOT EXISTS order_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_item REAL NOT NULL,
    item_total REAL NOT NULL,
    serial_numbers TEXT, -- JSON array of serial numbers for each quantity unit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Serial Number Allocations table (tracks which serials are available/allocated)
CREATE TABLE IF NOT EXISTS serial_allocations (
    allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    sell_order_id INTEGER NOT NULL, -- Which sell order generated this serial
    buy_order_id INTEGER NULL, -- Which buy order was allocated this serial (NULL = available)
    allocated_at DATETIME NULL, -- When it was allocated to a buyer
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sell_order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (buy_order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- Create indexes for optimal performance with better-sqlite3
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_variant ON products(product_variant);
CREATE INDEX IF NOT EXISTS idx_cart_cart ON cart(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_buy_cart_cart ON buy_cart(cart_id);
CREATE INDEX IF NOT EXISTS idx_buy_cart_product ON buy_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_sell_cart_cart ON sell_cart(cart_id);
CREATE INDEX IF NOT EXISTS idx_sell_cart_product ON sell_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_serial ON orders(serial_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_allocations_product_code ON serial_allocations(product_code);
CREATE INDEX IF NOT EXISTS idx_serial_allocations_serial ON serial_allocations(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_allocations_sell_order ON serial_allocations(sell_order_id);
CREATE INDEX IF NOT EXISTS idx_serial_allocations_buy_order ON serial_allocations(buy_order_id);
CREATE INDEX IF NOT EXISTS idx_serial_allocations_available ON serial_allocations(product_code, buy_order_id) WHERE buy_order_id IS NULL;

-- Analyze tables for query optimization
ANALYZE;