CREATE DATABASE IF NOT EXISTS bloodbi_dw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloodbi_dw;

CREATE TABLE IF NOT EXISTS dim_date (
  date_id INT PRIMARY KEY,
  full_date DATE,
  day INT,
  month INT,
  month_name VARCHAR(20),
  quarter INT,
  year INT
);

CREATE TABLE IF NOT EXISTS dim_city (
  city_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  city VARCHAR(100),
  region VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS dim_center (
  center_id BIGINT PRIMARY KEY,
  center_name VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS dim_blood_type (
  blood_type_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  blood_type VARCHAR(20),
  rh_factor VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS dim_urgency (
  urgency_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  urgency_level VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS fact_blood_activity (
  fact_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  date_id INT,
  city_id BIGINT,
  center_id BIGINT,
  blood_type_id BIGINT,
  urgency_id BIGINT,

  donation_count INT DEFAULT 0,
  request_count INT DEFAULT 0,
  fulfilled_count INT DEFAULT 0,
  cancelled_count INT DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  response_time_hours DECIMAL(10,2),

  FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
  FOREIGN KEY (city_id) REFERENCES dim_city(city_id),
  FOREIGN KEY (center_id) REFERENCES dim_center(center_id),
  FOREIGN KEY (blood_type_id) REFERENCES dim_blood_type(blood_type_id),
  FOREIGN KEY (urgency_id) REFERENCES dim_urgency(urgency_id)
);

INSERT INTO dim_date (date_id, full_date, day, month, month_name, quarter, year) VALUES
(20260501, '2026-05-01', 1, 5, 'May', 2, 2026),
(20260502, '2026-05-02', 2, 5, 'May', 2, 2026),
(20260503, '2026-05-03', 3, 5, 'May', 2, 2026),
(20260513, '2026-05-13', 13, 5, 'May', 2, 2026);

INSERT INTO dim_city (city, region) VALUES
('Casablanca', 'Casablanca-Settat'),
('Rabat', 'Rabat-Sale-Kenitra'),
('Marrakech', 'Marrakech-Safi'),
('El Jadida', 'Casablanca-Settat');

INSERT INTO dim_center (center_id, center_name, city, region) VALUES
(1, 'CNTS Casablanca', 'Casablanca', 'Casablanca-Settat'),
(2, 'Centre Regional Rabat', 'Rabat', 'Rabat-Sale-Kenitra'),
(3, 'Centre de Transfusion Marrakech', 'Marrakech', 'Marrakech-Safi'),
(4, 'Centre El Jadida', 'El Jadida', 'Casablanca-Settat');

INSERT INTO dim_blood_type (blood_type, rh_factor) VALUES
('A_POS', 'POSITIVE'),
('A_NEG', 'NEGATIVE'),
('B_POS', 'POSITIVE'),
('B_NEG', 'NEGATIVE'),
('AB_POS', 'POSITIVE'),
('AB_NEG', 'NEGATIVE'),
('O_POS', 'POSITIVE'),
('O_NEG', 'NEGATIVE');

INSERT INTO dim_urgency (urgency_level) VALUES
('LOW'),
('MEDIUM'),
('HIGH'),
('CRITICAL');

INSERT INTO fact_blood_activity
(date_id, city_id, center_id, blood_type_id, urgency_id, donation_count, request_count, fulfilled_count, cancelled_count, stock_quantity, response_time_hours)
VALUES
(20260513, 1, 1, 8, 4, 2, 5, 2, 0, 3, 4.50),
(20260513, 2, 2, 6, 3, 1, 3, 1, 0, 2, 6.25),
(20260513, 3, 3, 3, 2, 1, 2, 1, 1, 4, 8.00),
(20260513, 4, 4, 1, 2, 3, 4, 3, 0, 12, 3.00);