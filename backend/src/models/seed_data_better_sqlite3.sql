-- Better-SQLite3 Optimized Seed Data
-- This file is optimized for better-sqlite3@12.2.0 with transactions and prepared statements

-- Start transaction for optimal performance
BEGIN TRANSACTION;

-- Insert Users (Buyers, Sellers, and Admin)
-- Password is 'password123' hashed with bcrypt rounds=12
INSERT INTO users 
(user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given)
VALUES
-- Buyers
('Ravi Kumar', 'ravi@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876543210', '2nd Year', 'CSE', 'A', 'Hostel', 0.00, 0.00),
('Anjali Sharma', 'anjali@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876501234', '3rd Year', 'ECE', 'B', 'Day Scholar', 0.00, 0.00),
('Mohit Verma', 'mohit@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9123456789', '1st Year', 'ME', 'C', 'Hostel', 0.00, 0.00),
('Sneha Patel', 'sneha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9988776655', '2nd Year', 'EEE', 'A', 'Day Scholar', 0.00, 0.00),
('Arjun Reddy', 'arjun@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876123456', '4th Year', 'CIVIL', 'B', 'Hostel', 0.00, 0.00),

-- Sellers
('Priya Singh', 'priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9123987654', '3rd Year', 'CSE', 'C', 'Day Scholar', 500.00, 300.00),
('Karan Malhotra', 'karan@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '2nd Year', 'ECE', 'A', 'Hostel', 1000.00, 700.00),
('Neha Gupta', 'neha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9234567890', '4th Year', 'ME', 'B', 'Day Scholar', 300.00, 200.00),
('Rahul Das', 'rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9345678901', '3rd Year', 'CIVIL', 'C', 'Hostel', 800.00, 500.00),
('Simran Kaur', 'simran@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '1st Year', 'CSE', 'A', 'Day Scholar', 200.00, 100.00),

-- Admin user
('Admin User', 'admin@campusdeals.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'admin', '9999999999', 'Admin', 'Admin', 'Admin', 'Admin', 0.00, 0.00);

-- Insert Products
INSERT INTO products 
(product_name, product_variant, product_code, product_price, product_images, quantity)
VALUES
-- Drafters
('drafter', 'premium_drafter', 'DFT-P001', 2500.00, 'images/drafter_premium.jpg', 15),
('drafter', 'standard_drafter', 'DFT-S001', 1800.00, 'images/drafter_standard.jpg', 25),
('drafter', 'budget_drafter', 'DFT-B001', 1200.00, 'images/drafter_budget.jpg', 30),

-- White Lab Coats
('white_lab_coat', 'S', 'WLC-S001', 450.00, 'images/white_labcoat_s.jpg', 12),
('white_lab_coat', 'M', 'WLC-M001', 450.00, 'images/white_labcoat_m.jpg', 20),
('white_lab_coat', 'L', 'WLC-L001', 450.00, 'images/white_labcoat_l.jpg', 18),
('white_lab_coat', 'XL', 'WLC-XL001', 450.00, 'images/white_labcoat_xl.jpg', 10),
('white_lab_coat', 'XXL', 'WLC-XXL001', 450.00, 'images/white_labcoat_xxl.jpg', 5),

-- Brown Lab Coats
('brown_lab_coat', 'S', 'BLC-S001', 500.00, 'images/brown_labcoat_s.jpg', 8),
('brown_lab_coat', 'M', 'BLC-M001', 500.00, 'images/brown_labcoat_m.jpg', 15),
('brown_lab_coat', 'L', 'BLC-L001', 500.00, 'images/brown_labcoat_l.jpg', 12),
('brown_lab_coat', 'XL', 'BLC-XL001', 500.00, 'images/brown_labcoat_xl.jpg', 7),
('brown_lab_coat', 'XXL', 'BLC-XXL001', 500.00, 'images/brown_labcoat_xxl.jpg', 3),

-- Calculators
('calculator', 'MS', 'CALC-MS001', 1200.00, 'images/calculator_ms.jpg', 20),
('calculator', 'ES', 'CALC-ES001', 800.00, 'images/calculator_es.jpg', 25),
('calculator', 'ES-Plus', 'CALC-ESP001', 1500.00, 'images/calculator_es_plus.jpg', 15);

-- Sample cart data (optional for testing)
INSERT INTO cart (user_id, product_id, quantity) VALUES
(1, 1, 1), -- Ravi Kumar buying premium drafter
(2, 4, 2), -- Anjali Sharma buying 2 white lab coats (S)
(3, 14, 1), -- Mohit Verma buying MS calculator
(4, 6, 1), -- Sneha Patel buying white lab coat (L)
(5, 2, 1); -- Arjun Reddy buying standard drafter

-- Sample order data (optional for testing)
INSERT INTO orders (user_id, serial_no, product_id, total_amount, payment_method, status) VALUES
(1, 'ORD-001-2024', 1, 2500.00, 'upi', 'completed'),
(2, 'ORD-002-2024', 4, 900.00, 'cash', 'pending'),
(3, 'ORD-003-2024', 14, 1200.00, 'upi', 'completed'),
(4, 'ORD-004-2024', 6, 450.00, 'cash', 'pending'),
(5, 'ORD-005-2024', 2, 1800.00, 'upi', 'completed');

-- Commit transaction
COMMIT;

-- Update statistics for better query planning
ANALYZE;