-- ================================================
-- BOOKSTORE PRO - Complete Database Schema
-- ================================================

CREATE DATABASE IF NOT EXISTS bookstore_pro;
USE bookstore_pro;

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)         NOT NULL,
  email      VARCHAR(150)         NOT NULL UNIQUE,
  password   VARCHAR(255)         NOT NULL,
  role       ENUM('user','admin') NOT NULL DEFAULT 'user',
  avatar     VARCHAR(255),
  phone      VARCHAR(30),
  is_active  TINYINT(1)           NOT NULL DEFAULT 1,
  last_login TIMESTAMP            NULL,
  created_at TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  color      VARCHAR(20)  DEFAULT '#6366f1',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Books ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255)  NOT NULL,
  author         VARCHAR(150)  NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NULL,
  isbn           VARCHAR(20)   NOT NULL UNIQUE,
  published_date DATE          NOT NULL,
  description    TEXT,
  category_id    INT           NULL,
  stock          INT           NOT NULL DEFAULT 0,
  pages          INT,
  language       VARCHAR(50)   DEFAULT 'English',
  publisher      VARCHAR(150),
  cover_image    VARCHAR(500),
  rating         DECIMAL(3,2)  DEFAULT 0.00,
  total_reviews  INT           DEFAULT 0,
  total_sold     INT           DEFAULT 0,
  is_featured    TINYINT(1)    DEFAULT 0,
  status         ENUM('active','inactive','out_of_stock') DEFAULT 'active',
  created_by     INT           NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_title    (title),
  INDEX idx_author   (author),
  INDEX idx_isbn     (isbn),
  INDEX idx_status   (status),
  INDEX idx_featured (is_featured)
);

-- ── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT          NOT NULL,
  user_id    INT          NOT NULL,
  rating     TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_review (book_id, user_id)
);

-- ── Activity Log ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NULL,
  action     VARCHAR(100) NOT NULL,
  entity     VARCHAR(50),
  entity_id  INT,
  details    TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================
-- SEED DATA
-- ================================================

-- Categories
INSERT IGNORE INTO categories (name, slug, color) VALUES
('Fiction',       'fiction',        '#6366f1'),
('Non-Fiction',   'non-fiction',    '#06b6d4'),
('Science',       'science',        '#10b981'),
('Technology',    'technology',     '#f59e0b'),
('Biography',     'biography',      '#ec4899'),
('Self-Help',     'self-help',      '#8b5cf6'),
('History',       'history',        '#ef4444'),
('Philosophy',    'philosophy',     '#14b8a6'),
('Business',      'business',       '#f97316'),
('Classic',       'classic',        '#a855f7');

-- Admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@bookstore.com',
 '$2b$12$aC0JfqoRcHlZaea.0qq9Fu82Kqw78ZCNrV9naXcPA5q6DTXqEVcve', 'admin')
ON DUPLICATE KEY UPDATE
  password = '$2b$12$aC0JfqoRcHlZaea.0qq9Fu82Kqw78ZCNrV9naXcPA5q6DTXqEVcve',
  role = 'admin';

-- Sample books
INSERT IGNORE INTO books (title, author, price, original_price, isbn, published_date, description, category_id, stock, pages, language, publisher, rating, total_sold, is_featured) VALUES
('The Great Gatsby',
 'F. Scott Fitzgerald', 12.99, 16.99,
 '978-0-7432-7356-5', '1925-04-10',
 'A masterpiece of American literature, following the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
 1, 50, 180, 'English', 'Scribner', 4.7, 1240, 1),

('To Kill a Mockingbird',
 'Harper Lee', 14.99, NULL,
 '978-0-06-112008-4', '1960-07-11',
 'Winner of the Pulitzer Prize, a moving story of racial injustice and the loss of innocence in the American South.',
 1, 40, 281, 'English', 'J. B. Lippincott & Co.', 4.9, 987, 1),

('1984',
 'George Orwell', 11.99, 14.99,
 '978-0-452-28423-4', '1949-06-08',
 'A chilling dystopian novel depicting a totalitarian society where Big Brother watches every move of its citizens.',
 1, 60, 328, 'English', 'Secker & Warburg', 4.8, 1456, 1),

('Clean Code',
 'Robert C. Martin', 35.99, 44.99,
 '978-0-13-235088-4', '2008-08-01',
 'A handbook of agile software craftsmanship. Every programmer should read this book to write better, cleaner code.',
 4, 25, 464, 'English', 'Prentice Hall', 4.6, 830, 1),

('A Brief History of Time',
 'Stephen Hawking', 15.99, NULL,
 '978-0-553-38016-3', '1988-04-01',
 'From the Big Bang to black holes, Professor Hawking explores the outer limits of our knowledge of the universe.',
 3, 35, 212, 'English', 'Bantam Books', 4.7, 2100, 0),

('The Alchemist',
 'Paulo Coelho', 13.99, 17.99,
 '978-0-06-112241-5', '1988-01-01',
 'A magical story about following your dreams and listening to your heart. One of the best-selling books in history.',
 1, 45, 197, 'English', 'HarperOne', 4.5, 3200, 1),

('Thinking, Fast and Slow',
 'Daniel Kahneman', 17.99, NULL,
 '978-0-374-53355-7', '2011-10-25',
 'A groundbreaking tour of the mind explaining the two systems that drive the way we think.',
 6, 20, 499, 'English', 'Farrar, Straus and Giroux', 4.6, 650, 0),

('Sapiens: A Brief History',
 'Yuval Noah Harari', 19.99, 24.99,
 '978-0-06-231609-7', '2011-01-01',
 'A bold, wide-ranging, and provocative look at the entire history of the human race.',
 2, 30, 443, 'English', 'Harper', 4.8, 1890, 1),

('The Pragmatic Programmer',
 'Andrew Hunt', 39.99, NULL,
 '978-0-13-595705-9', '1999-10-20',
 'A timeless guide for programmers who want to improve their craft and build better software.',
 4, 18, 352, 'English', 'Addison-Wesley', 4.7, 420, 0),

('Steve Jobs',
 'Walter Isaacson', 18.99, 22.99,
 '978-1-4516-4853-9', '2011-10-24',
 'Based on more than forty interviews with Steve Jobs, as well as interviews with family members, friends, and colleagues.',
 5, 22, 656, 'English', 'Simon & Schuster', 4.5, 780, 0);

-- Activity log seed
INSERT INTO activity_log (user_id, action, entity, entity_id, details) VALUES
(1, 'SYSTEM_INIT', 'system', NULL, 'Database initialized with seed data');
