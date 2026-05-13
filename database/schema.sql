CREATE DATABASE IF NOT EXISTS bloodbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloodbi;

CREATE TABLE IF NOT EXISTS app_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_bank_centers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  address VARCHAR(255),
  phone VARCHAR(30),
  latitude DOUBLE,
  longitude DOUBLE,
  region VARCHAR(120),
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donor_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255),
  blood_type VARCHAR(20),
  city VARCHAR(100),
  address VARCHAR(255),
  phone VARCHAR(30),
  email VARCHAR(255),
  latitude DOUBLE,
  longitude DOUBLE,
  available BOOLEAN DEFAULT TRUE,
  last_donation_date DATE,
  total_donations INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  preferred_center_id BIGINT,
  CONSTRAINT fk_donor_center
    FOREIGN KEY (preferred_center_id)
    REFERENCES blood_bank_centers(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255),
  phone VARCHAR(30),
  email VARCHAR(255),
  city VARCHAR(100),
  hospital VARCHAR(255),
  blood_type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS blood_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patient_name VARCHAR(255),
  blood_type VARCHAR(20),
  urgency VARCHAR(20),
  status VARCHAR(20),
  hospital VARCHAR(255),
  city VARCHAR(100),
  latitude DOUBLE,
  longitude DOUBLE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at DATETIME,
  center_id BIGINT,
  CONSTRAINT fk_request_center
    FOREIGN KEY (center_id)
    REFERENCES blood_bank_centers(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blood_stocks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  center_id BIGINT,
  blood_type VARCHAR(20),
  component_type VARCHAR(30),
  quantity INT,
  min_threshold INT,
  status VARCHAR(20),
  expiry_date DATE,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_center
    FOREIGN KEY (center_id)
    REFERENCES blood_bank_centers(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donor_id BIGINT,
  request_id BIGINT,
  center_id BIGINT,
  status VARCHAR(30),
  latitude DOUBLE,
  longitude DOUBLE,
  scheduled_at DATETIME,
  donated_at DATETIME,
  notes TEXT,
  CONSTRAINT fk_donation_donor
    FOREIGN KEY (donor_id)
    REFERENCES donor_profiles(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_donation_request
    FOREIGN KEY (request_id)
    REFERENCES blood_requests(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_donation_center
    FOREIGN KEY (center_id)
    REFERENCES blood_bank_centers(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blood_alerts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  message TEXT,
  severity VARCHAR(30),
  blood_type VARCHAR(20),
  city VARCHAR(100),
  center_name VARCHAR(255),
  resolved BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_type VARCHAR(100),
  center_name VARCHAR(255),
  city VARCHAR(100),
  status VARCHAR(50),
  priority VARCHAR(50),
  findings TEXT,
  report_date DATE
);