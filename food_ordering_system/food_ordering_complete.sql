-- Complete Database with Sample Data
DROP DATABASE IF EXISTS food_ordering;
CREATE DATABASE food_ordering;
USE food_ordering;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT NOT NULL,
    image_url VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    stock INT DEFAULT 100,
    calories INT,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method ENUM('cash', 'card', 'paypal') DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Pizza', 'Delicious pizzas with various toppings', 'assets/images/pizza-cat.jpg'),
('Burger', 'Juicy burgers with fresh ingredients', 'assets/images/burger-cat.jpg'),
('Pasta', 'Italian pasta dishes', 'assets/images/pasta-cat.jpg'),
('Drinks', 'Refreshing beverages', 'assets/images/drinks-cat.jpg'),
('Desserts', 'Sweet treats', 'assets/images/desserts-cat.jpg'),
('Salads', 'Fresh and healthy salads', 'assets/images/salads-cat.jpg');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, featured, calories, protein, carbs, fat) VALUES
('Margherita Pizza', 'Classic pizza with fresh tomatoes, mozzarella, and basil', 12.99, 1, 'assets/images/margherita.jpg', 1, 850, 35, 90, 25),
('Pepperoni Pizza', 'Pizza topped with pepperoni and extra cheese', 14.99, 1, 'assets/images/pepperoni.jpg', 1, 950, 40, 95, 35),
('Cheeseburger', 'Beef patty with cheese, lettuce, tomato, and special sauce', 8.99, 2, 'assets/images/cheeseburger.jpg', 0, 650, 30, 45, 35),
('BBQ Bacon Burger', 'Burger with BBQ sauce, bacon, and onion rings', 10.99, 2, 'assets/images/bbq-burger.jpg', 1, 800, 35, 50, 45),
('Spaghetti Carbonara', 'Pasta with eggs, cheese, pancetta, and black pepper', 11.99, 3, 'assets/images/carbonara.jpg', 0, 700, 25, 80, 30),
('Fettuccine Alfredo', 'Creamy pasta with parmesan cheese and butter', 10.99, 3, 'assets/images/alfredo.jpg', 0, 750, 20, 85, 40),
('Coca Cola', 'Classic refreshing cola drink', 2.99, 4, 'assets/images/coke.jpg', 0, 150, 0, 39, 0),
('Orange Juice', 'Freshly squeezed orange juice', 3.99, 4, 'assets/images/orange-juice.jpg', 0, 110, 2, 26, 0),
('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 5.99, 5, 'assets/images/chocolate-cake.jpg', 1, 450, 6, 65, 20),
('Cheesecake', 'New York style cheesecake with strawberry topping', 6.99, 5, 'assets/images/cheesecake.jpg', 0, 500, 8, 45, 35),
('Caesar Salad', 'Romaine lettuce with croutons, parmesan, and Caesar dressing', 7.99, 6, 'assets/images/caesar-salad.jpg', 0, 350, 15, 25, 20),
('Greek Salad', 'Fresh vegetables with feta cheese and olive oil', 6.99, 6, 'assets/images/greek-salad.jpg', 0, 300, 10, 20, 25);

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@foodhub.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Admin', 'admin');

-- Create sample customer (password: password123)
INSERT INTO users (username, email, password_hash, full_name, phone, address) VALUES
('john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '+1234567890', '123 Main St, New York, NY 10001');

-- Create sample orders
INSERT INTO orders (user_id, order_number, total_amount, status, delivery_address, phone, payment_method) VALUES
(2, 'ORD-2024-001', 25.97, 'completed', '123 Main St, New York, NY 10001', '+1234567890', 'card'),
(2, 'ORD-2024-002', 18.97, 'processing', '123 Main St, New York, NY 10001', '+1234567890', 'cash');

-- Create sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 12.99, 12.99),
(1, 3, 1, 8.99, 8.99),
(1, 7, 2, 2.99, 5.98),
(2, 2, 1, 14.99, 14.99),
(2, 9, 1, 5.99, 5.99);

-- Create sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Best pizza ever! Will order again.'),
(2, 3, 4, 'Good burger, but could use more sauce.'),
(2, 7, 5, 'Always refreshing!');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Create views for common queries
CREATE VIEW popular_products AS
SELECT p.*, c.name as category_name, 
       COALESCE(AVG(r.rating), 0) as avg_rating,
       COUNT(r.id) as review_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.available = 1
GROUP BY p.id
ORDER BY avg_rating DESC, review_count DESC;

CREATE VIEW monthly_sales AS
SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month,
       COUNT(*) as orders,
       SUM(o.total_amount) as revenue
FROM orders o
WHERE o.status = 'completed'
GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
ORDER BY month DESC;

-- Create stored procedure for generating order numbers
DELIMITER $$
CREATE PROCEDURE generate_order_number(OUT order_number VARCHAR(50))
BEGIN
    DECLARE date_part VARCHAR(10);
    DECLARE random_part VARCHAR(10);
    DECLARE counter INT DEFAULT 1;
    
    SET date_part = DATE_FORMAT(NOW(), '%Y%m%d');
    SET random_part = LPAD(FLOOR(RAND() * 10000), 4, '0');
    
    WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = CONCAT('ORD-', date_part, '-', random_part)) DO
        SET random_part = LPAD(FLOOR(RAND() * 10000), 4, '0');
        SET counter = counter + 1;
        IF counter > 100 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to generate unique order number';
        END IF;
    END WHILE;
    
    SET order_number = CONCAT('ORD-', date_part, '-', random_part);
END$$
DELIMITER ;

-- Create trigger for updating product stock
DELIMITER $$
CREATE TRIGGER update_stock_after_order
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
END$$
DELIMITER ;

-- Create trigger for preventing negative stock
DELIMITER $$
CREATE TRIGGER prevent_negative_stock
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock cannot be negative';
    END IF;
END$$
DELIMITER ;

-- Insert more sample data for testing
INSERT INTO users (username, email, password_hash, full_name, phone, address) VALUES
('jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', '+1987654321', '456 Park Ave, Boston, MA 02115'),
('bob_wilson', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Wilson', '+1555123456', '789 Oak St, Chicago, IL 60601');

INSERT INTO orders (user_id, order_number, total_amount, status, delivery_address, phone, payment_method) VALUES
(3, 'ORD-2024-003', 32.96, 'pending', '456 Park Ave, Boston, MA 02115', '+1987654321', 'paypal'),
(4, 'ORD-2024-004', 21.97, 'completed', '789 Oak St, Chicago, IL 60601', '+1555123456', 'card');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(3, 2, 2, 14.99, 29.98),
(3, 8, 1, 3.99, 3.99),
(4, 4, 1, 10.99, 10.99),
(4, 10, 1, 6.99, 6.99),
(4, 11, 1, 7.99, 7.99);

INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(3, 2, 5, 'Excellent pepperoni pizza!'),
(3, 8, 4, 'Fresh and tasty orange juice'),
(4, 4, 5, 'Amazing burger with perfect bacon'),
(4, 10, 4, 'Delicious cheesecake, would recommend');

SELECT 'Database setup completed successfully!' as message;