-- =====================================================
-- BLOODBI ANALYTICS - DATA WAREHOUSE (V2)
-- Schéma en étoile avec dimensions enrichies
-- =====================================================

CREATE DATABASE IF NOT EXISTS bloodbi_dw_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloodbi_dw_v2;

-- -----------------------------------------------------
-- 1. DIMENSION DATE (avec features temporelles)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_date (
    date_id INT PRIMARY KEY,
    full_date DATE,
    day INT,
    month INT,
    month_name VARCHAR(20),
    quarter INT,
    year INT,
    day_of_week INT,
    day_of_week_name VARCHAR(20),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    is_ramadan BOOLEAN,
    season VARCHAR(10)
);

TRUNCATE TABLE dim_date;

-- Procédure corrigée (variables renommées pour éviter les mots réservés)
DELIMITER $$
CREATE PROCEDURE generate_dim_date_v2()
BEGIN
    DECLARE v_start_date DATE DEFAULT '2024-01-01';
    DECLARE v_end_date DATE DEFAULT '2026-12-31';
    DECLARE v_current_date DATE DEFAULT v_start_date;
    
    WHILE v_current_date <= v_end_date DO
        INSERT INTO dim_date (date_id, full_date, day, month, month_name, quarter, year,
            day_of_week, day_of_week_name, is_weekend, is_holiday, is_ramadan, season)
        VALUES (
            DATE_FORMAT(v_current_date, '%Y%m%d'),
            v_current_date,
            DAY(v_current_date),
            MONTH(v_current_date),
            MONTHNAME(v_current_date),
            QUARTER(v_current_date),
            YEAR(v_current_date),
            DAYOFWEEK(v_current_date),
            DAYNAME(v_current_date),
            IF(DAYOFWEEK(v_current_date) IN (1, 7), TRUE, FALSE),
            IF((MONTH(v_current_date) = 1 AND DAY(v_current_date) = 1) OR
               (MONTH(v_current_date) = 5 AND DAY(v_current_date) = 1) OR
               (MONTH(v_current_date) = 7 AND DAY(v_current_date) = 30) OR
               (MONTH(v_current_date) = 8 AND DAY(v_current_date) = 14) OR
               (MONTH(v_current_date) = 8 AND DAY(v_current_date) = 20) OR
               (MONTH(v_current_date) = 11 AND DAY(v_current_date) = 6) OR
               (MONTH(v_current_date) = 11 AND DAY(v_current_date) = 18), TRUE, FALSE),
            IF(MONTH(v_current_date) IN (3, 4), TRUE, FALSE),
            CASE
                WHEN MONTH(v_current_date) IN (12,1,2) THEN 'Winter'
                WHEN MONTH(v_current_date) IN (3,4,5) THEN 'Spring'
                WHEN MONTH(v_current_date) IN (6,7,8) THEN 'Summer'
                ELSE 'Autumn'
            END
        );
        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);
    END WHILE;
END$$
DELIMITER ;

CALL generate_dim_date_v2();
DROP PROCEDURE generate_dim_date_v2;

-- -----------------------------------------------------
-- 2. DIMENSION CITY
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_city (
    city_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(100),
    region VARCHAR(120)
);

TRUNCATE TABLE dim_city;
INSERT INTO dim_city (city, region) VALUES
('Casablanca', 'Casablanca-Settat'),
('Rabat', 'Rabat-Sale-Kenitra'),
('Marrakech', 'Marrakech-Safi'),
('Fès', 'Fès-Meknès'),
('Tanger', 'Tanger-Tétouan-Al Hoceïma'),
('Agadir', 'Souss-Massa'),
('El Jadida', 'Casablanca-Settat'),
('Meknès', 'Fès-Meknès'),
('Oujda', 'Oriental'),
('Kénitra', 'Rabat-Sale-Kenitra'),
('Tétouan', 'Tanger-Tétouan-Al Hoceïma'),
('Laâyoune', 'Laâyoune-Sakia El Hamra'),
('Settat', 'Casablanca-Settat'),
('Safi', 'Marrakech-Safi'),
('Nador', 'Oriental'),
('Béni Mellal', 'Béni Mellal-Khénifra'),
('Khénifra', 'Béni Mellal-Khénifra'),
('Dakhla', 'Dakhla-Oued Ed-Dahab'),
('Errachidia', 'Drâa-Tafilalet'),
('Ouarzazate', 'Drâa-Tafilalet'),
('Guelmim', 'Guelmim-Oued Noun');

-- -----------------------------------------------------
-- 3. DIMENSION CENTER
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_center (
    center_id BIGINT PRIMARY KEY,
    center_name VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(120)
);

TRUNCATE TABLE dim_center;
INSERT INTO dim_center (center_id, center_name, city, region)
SELECT id, name, city, region FROM bloodbi_v2.blood_bank_centers;

-- -----------------------------------------------------
-- 4. DIMENSION BLOOD TYPE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_blood_type (
    blood_type_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    blood_type VARCHAR(20),
    rh_factor VARCHAR(10)
);

TRUNCATE TABLE dim_blood_type;
INSERT INTO dim_blood_type (blood_type, rh_factor) VALUES
('A_POS', 'POSITIVE'), ('A_NEG', 'NEGATIVE'),
('B_POS', 'POSITIVE'), ('B_NEG', 'NEGATIVE'),
('AB_POS', 'POSITIVE'), ('AB_NEG', 'NEGATIVE'),
('O_POS', 'POSITIVE'), ('O_NEG', 'NEGATIVE');

-- -----------------------------------------------------
-- 5. DIMENSION URGENCY
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_urgency (
    urgency_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    urgency_level VARCHAR(20)
);

TRUNCATE TABLE dim_urgency;
INSERT INTO dim_urgency (urgency_level) VALUES
('LOW'), ('MEDIUM'), ('HIGH'), ('CRITICAL');

-- -----------------------------------------------------
-- 6. TABLE DE FAITS
-- -----------------------------------------------------
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

-- Insertion de données dans fact_blood_activity
TRUNCATE TABLE fact_blood_activity;
INSERT INTO fact_blood_activity (date_id, city_id, center_id, blood_type_id, urgency_id, 
    donation_count, request_count, fulfilled_count, cancelled_count, stock_quantity, response_time_hours)
SELECT 
    d.date_id,
    ct.city_id,
    c.center_id,
    bt.blood_type_id,
    u.urgency_id,
    FLOOR(RAND() * 10) as donation_count,
    FLOOR(RAND() * 20) as request_count,
    FLOOR(RAND() * 15) as fulfilled_count,
    FLOOR(RAND() * 5) as cancelled_count,
    FLOOR(RAND() * 50) as stock_quantity,
    ROUND(RAND() * 24, 2) as response_time_hours
FROM dim_date d
CROSS JOIN (SELECT city_id FROM dim_city LIMIT 5) ct
CROSS JOIN (SELECT center_id FROM dim_center LIMIT 10) c
CROSS JOIN (SELECT blood_type_id FROM dim_blood_type LIMIT 4) bt
CROSS JOIN (SELECT urgency_id FROM dim_urgency LIMIT 2) u
WHERE RAND() < 0.1
LIMIT 5000;

-- -----------------------------------------------------
-- 7. VÉRIFICATION FINALE
-- -----------------------------------------------------
SELECT '=== DATA WAREHOUSE STATISTICS ===' AS info;
SELECT 'dim_date' as table_name, COUNT(*) as nombre FROM dim_date
UNION SELECT 'dim_city', COUNT(*) FROM dim_city
UNION SELECT 'dim_center', COUNT(*) FROM dim_center
UNION SELECT 'dim_blood_type', COUNT(*) FROM dim_blood_type
UNION SELECT 'dim_urgency', COUNT(*) FROM dim_urgency
UNION SELECT 'fact_blood_activity', COUNT(*) FROM fact_blood_activity;