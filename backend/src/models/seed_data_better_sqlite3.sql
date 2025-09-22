-- Better-SQLite3 Optimized Seed Data-- Better-SQLite3 Optimized Seed Data

-- This file is optimized for better-sqlite3@12.2.0 with transactions and prepared statements-- This file-- Cal-- Calculators

('calculator', 'MS', 'CALC-MS001', 950.00, 'Calci.jpg', 20),

-- Start transaction for optimal performance('calculator', 'ES', 'CALC-ES001', 950.00, 'Calci.jpg', 25),

BEGIN TRANSACTION;('calculator', 'ES-Plus', 'CALC-ESP001', 950.00, 'Calci.jpg', 15),



-- Insert Users (Buyers, Sellers, and Admin)-- ChartBox

-- Password is 'password123' hashed with bcrypt rounds=12('chartbox', 'chart holder', 'CHART-MS001', 60.00, 'chart holder.jpg', 20);

INSERT INTO users 

(user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given)-- Sample cart data (optional for testing)

VALUES('calculator', 'MS', 'CALC-MS001', 950.00, 'Calci.jpg', 20),

-- Buyers('calculator', 'ES', 'CALC-ES001', 950.00, 'Calci.jpg', 25),

('Ravi Kumar', 'ravi@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876543210', '2nd Year', 'CSE', 'A', 'Hostel', 0.00, 0.00),('calculator', 'ES-Plus', 'CALC-ESP001', 950.00, 'Calci.jpg', 15),

('Anjali Sharma', 'anjali@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876501234', '3rd Year', 'ECE', 'B', 'Day Scholar', 0.00, 0.00),

('Mohit Verma', 'mohit@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9123456789', '1st Year', 'ME', 'C', 'Hostel', 0.00, 0.00),-- ChartBox

('Sneha Patel', 'sneha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9988776655', '2nd Year', 'EEE', 'A', 'Day Scholar', 0.00, 0.00),('chartbox', 'chart holder', 'CHART-MS001', 60.00, 'chart holder.jpg', 20);imized for better-sqlite3@12.2.0 with transactions and prepared statements

('Arjun Reddy', 'arjun@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876123456', '4th Year', 'CIVIL', 'B', 'Hostel', 0.00, 0.00),

-- Start transaction for optimal performance

-- SellersBEGIN TRANSACTION;

('Priya Singh', 'priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9123987654', '3rd Year', 'CSE', 'C', 'Day Scholar', 500.00, 300.00),

('Karan Malhotra', 'karan@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '2nd Year', 'ECE', 'A', 'Hostel', 1000.00, 700.00),-- Insert Users (Buyers, Sellers, and Admin)

('Neha Gupta', 'neha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9234567890', '4th Year', 'ME', 'B', 'Day Scholar', 300.00, 200.00),-- Password is 'password123' hashed with bcrypt rounds=12

('Rahul Das', 'rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9345678901', '3rd Year', 'CIVIL', 'C', 'Hostel', 800.00, 500.00),INSERT INTO users 

('Simran Kaur', 'simran@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '1st Year', 'CSE', 'A', 'Day Scholar', 200.00, 100.00),(user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given)

VALUES

-- Admin user-- Buyers

('Admin User', 'admin@campusdeals.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'admin', '9999999999', 'Admin', 'Admin', 'Admin', 'Admin', 0.00, 0.00);('Ravi Kumar', 'ravi@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876543210', '2nd Year', 'CSE', 'A', 'Hostel', 0.00, 0.00),

('Anjali Sharma', 'anjali@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876501234', '3rd Year', 'ECE', 'B', 'Day Scholar', 0.00, 0.00),

-- Insert Products('Mohit Verma', 'mohit@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9123456789', '1st Year', 'ME', 'C', 'Hostel', 0.00, 0.00),

INSERT INTO products ('Sneha Patel', 'sneha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9988776655', '2nd Year', 'EEE', 'A', 'Day Scholar', 0.00, 0.00),

(product_name, product_variant, product_code, product_price, product_images, quantity)('Arjun Reddy', 'arjun@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876123456', '4th Year', 'CIVIL', 'B', 'Hostel', 0.00, 0.00),

VALUES

-- Drafters-- Sellers

('drafter', 'premium_drafter', 'DFT-P001', 400.00, 'Drafter.jpeg', 15),('Priya Singh', 'priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9123987654', '3rd Year', 'CSE', 'C', 'Day Scholar', 500.00, 300.00),

('drafter', 'standard_drafter', 'DFT-S001', 350.00, 'Drafter.jpeg', 25),('Karan Malhotra', 'karan@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '2nd Year', 'ECE', 'A', 'Hostel', 1000.00, 700.00),

('drafter', 'budget_drafter', 'DFT-B001', 300.00, 'Drafter.jpeg', 30),('Neha Gupta', 'neha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9234567890', '4th Year', 'ME', 'B', 'Day Scholar', 300.00, 200.00),

('Rahul Das', 'rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9345678901', '3rd Year', 'CIVIL', 'C', 'Hostel', 800.00, 500.00),

-- White Lab Coats('Simran Kaur', 'simran@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '1st Year', 'CSE', 'A', 'Day Scholar', 200.00, 100.00),

('white_lab_coat', 'S', 'WLC-S001', 230.00, 'Chemical.jpeg', 12),

('white_lab_coat', 'M', 'WLC-M001', 230.00, 'Chemical.jpeg', 20),-- Admin user

('white_lab_coat', 'L', 'WLC-L001', 230.00, 'Chemical.jpeg', 18),('Admin User', 'admin@campusdeals.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'admin', '9999999999', 'Admin', 'Admin', 'Admin', 'Admin', 0.00, 0.00);

('white_lab_coat', 'XL', 'WLC-XL001', 230.00, 'Chemical.jpeg', 10),

('white_lab_coat', 'XXL', 'WLC-XXL001', 230.00, 'Chemical.jpeg', 5),-- Insert Products

INSERT INTO products 

-- Brown Lab Coats(product_name, product_variant, product_code, product_price, product_images, quantity)

('brown_lab_coat', 'S', 'BLC-S001', 230.00, 'Mechanical.jpeg', 8),VALUES

('brown_lab_coat', 'M', 'BLC-M001', 230.00, 'Mechanical.jpeg', 15),-- Drafters

('brown_lab_coat', 'L', 'BLC-L001', 230.00, 'Mechanical.jpeg', 12),('drafter', 'premium_drafter', 'DFT-P001', 400.00, 'Drafter.jpeg', 15),

('brown_lab_coat', 'XL', 'BLC-XL001', 230.00, 'Mechanical.jpeg', 7),('drafter', 'standard_drafter', 'DFT-S001', 350.00, 'Drafter.jpeg', 25),

('brown_lab_coat', 'XXL', 'BLC-XXL001', 230.00, 'Mechanical.jpeg', 3),('drafter', 'budget_drafter', 'DFT-B001', 300.00, 'Drafter.jpeg', 30),



-- Calculators-- White Lab Coats

('calculator', 'MS', 'CALC-MS001', 950.00, 'Calci.jpg', 20),('white_lab_coat', 'S', 'WLC-S001', 230.00, 'Chemical.jpeg', 12),

('calculator', 'ES', 'CALC-ES001', 950.00, 'Calci.jpg', 25),('white_lab_coat', 'M', 'WLC-M001', 230.00, 'Chemical.jpeg', 20),

('calculator', 'ES-Plus', 'CALC-ESP001', 950.00, 'Calci.jpg', 15),('white_lab_coat', 'L', 'WLC-L001', 230.00, 'Chemical.jpeg', 18),

('white_lab_coat', 'XL', 'WLC-XL001', 230.00, 'Chemical.jpeg', 10),

-- ChartBox('white_lab_coat', 'XXL', 'WLC-XXL001', 230.00, 'Chemical.jpeg', 5),

('chartbox', 'chart holder', 'CHART-MS001', 60.00, 'chart holder.jpg', 20);

-- Brown Lab Coats

-- Sample cart data (optional for testing)('brown_lab_coat', 'S', 'BLC-S001', 230.00, 'Mechanical.jpeg', 8),

INSERT INTO cart (user_id, product_id, quantity) VALUES('brown_lab_coat', 'M', 'BLC-M001', 230.00, 'Mechanical.jpeg', 15),

(1, 1, 1), -- Ravi Kumar buying premium drafter('brown_lab_coat', 'L', 'BLC-L001', 230.00, 'Mechanical.jpeg', 12),

(2, 4, 2), -- Anjali Sharma buying 2 white lab coats (S)('brown_lab_coat', 'XL', 'BLC-XL001', 230.00, 'Mechanical.jpeg', 7),

(3, 14, 1), -- Mohit Verma buying MS calculator('brown_lab_coat', 'XXL', 'BLC-XXL001', 230.00, 'Mechanical.jpeg', 3),

(4, 6, 1), -- Sneha Patel buying white lab coat (L)

(5, 2, 1); -- Arjun Reddy buying standard drafter-- Calculators

('calculator', 'MS', 'CALC-MS001', 950.00, 'Calci.jpg', 20),

-- Sample order data (optional for testing)('calculator', 'ES', 'CALC-ES001', 950.00, 'Calci.jpg', 25),

INSERT INTO orders (user_id, serial_no, product_id, total_amount, payment_method, status) VALUES('calculator', 'ES-Plus', 'CALC-ESP001', 950.00, 'Calci.jpg', 15);

(1, 'ORD-001-2024', 1, 2500.00, 'upi', 'completed'),

(2, 'ORD-002-2024', 4, 900.00, 'cash', 'pending'),-- ChartBox

(3, 'ORD-003-2024', 14, 1200.00, 'upi', 'completed'),('chartbox', 'chart holder', 'CHART-MS001', 60.00, 'chart holder.jpg', 20);

(4, 'ORD-004-2024', 6, 450.00, 'cash', 'pending'),-- Sample cart data (optional for testing)

(5, 'ORD-005-2024', 2, 1800.00, 'upi', 'completed');INSERT INTO cart (user_id, product_id, quantity) VALUES

(1, 1, 1), -- Ravi Kumar buying premium drafter

-- Commit transaction(2, 4, 2), -- Anjali Sharma buying 2 white lab coats (S)

COMMIT;(3, 14, 1), -- Mohit Verma buying MS calculator

(4, 6, 1), -- Sneha Patel buying white lab coat (L)

-- Update statistics for better query planning(5, 2, 1); -- Arjun Reddy buying standard drafter

ANALYZE;
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