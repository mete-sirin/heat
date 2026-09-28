-- HEAT Database Schema (MySQL)

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  budget DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  time_zone VARCHAR(64) NOT NULL DEFAULT 'Europe/Istanbul',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_hash CHAR(64) NULL DEFAULT NULL,
  verification_expires_at DATETIME NULL DEFAULT NULL,
  reset_hash CHAR(64) NULL DEFAULT NULL,
  reset_expires_at DATETIME NULL DEFAULT NULL,
  password_changed_at DATETIME NULL DEFAULT NULL,
  logged_out_at DATETIME NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_verification_hash (verification_hash),
  INDEX idx_users_reset_hash (reset_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spendings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  spending_name VARCHAR(255) NOT NULL,
  spending_category VARCHAR(100) NOT NULL DEFAULT 'Generic',
  amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM('cash', 'creditCard', 'qr', 'debitCard') NOT NULL DEFAULT 'cash',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_spendings_user_created (user_id, created_at),
  INDEX idx_spendings_user_category (user_id, spending_category),
  CONSTRAINT fk_spendings_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  subscription_name VARCHAR(255) NOT NULL,
  subscription_category VARCHAR(100) NOT NULL DEFAULT 'Generic',
  amount DECIMAL(12, 2) NOT NULL,
  length INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  next_billing_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_subscriptions_user_amount (user_id, amount),
  INDEX idx_subscriptions_user_category (user_id, subscription_category),
  CONSTRAINT fk_subscriptions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
