-- =====================================================
-- BLOODBI ANALYTICS - DATASET COMPLET
-- Version compatible Spring Boot (sans procédures stockées)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
USE bloodbi_v2;

-- -----------------------------------------------------
-- 1. UTILISATEURS
-- -----------------------------------------------------
DELETE FROM app_users;
INSERT INTO app_users (id, username, email, password, role, active, created_at) VALUES
(1, 'admin', 'admin@bloodbi.local', 'password', 'ADMIN', true, NOW()),
(2, 'doctor', 'doctor@bloodbi.local', 'password', 'CENTER_MANAGER', true, NOW());

-- -----------------------------------------------------
-- 2. CENTRES DE TRANSFUSION (40 CENTRES - TOUTES LES RÉGIONS)
-- -----------------------------------------------------
DELETE FROM blood_bank_centers;
INSERT INTO blood_bank_centers (id, name, city, address, phone, latitude, longitude, region, active, created_at) VALUES
(1, 'CNTS Casablanca', 'Casablanca', 'Rue des Hôpitaux', '0522000001', 33.5731, -7.5898, 'Casablanca-Settat', true, NOW()),
(2, 'CTS Ain Sebaa', 'Casablanca', 'Avenue des FAR', '0522000002', 33.6000, -7.5200, 'Casablanca-Settat', true, NOW()),
(3, 'CTS El Jadida', 'El Jadida', 'Avenue Jabrane Khalil', '0523000001', 33.2316, -8.5007, 'Casablanca-Settat', true, NOW()),
(4, 'CTS Settat', 'Settat', 'Boulevard Mohammed V', '0523000002', 33.0000, -7.6200, 'Casablanca-Settat', true, NOW()),
(5, 'CTS Berrechid', 'Berrechid', 'Route de Casablanca', '0525000001', 33.2679, -7.5877, 'Casablanca-Settat', true, NOW()),
(6, 'CNTS Rabat', 'Rabat', 'Avenue Mohamed V', '0537000001', 34.0209, -6.8416, 'Rabat-Salé-Kenitra', true, NOW()),
(7, 'CTS Salé', 'Salé', 'Avenue Hassan II', '0537000002', 34.0500, -6.8000, 'Rabat-Salé-Kenitra', true, NOW()),
(8, 'CTS Kénitra', 'Kénitra', 'Boulevard Al Maghrib Al Arabi', '0537000003', 34.2500, -6.5800, 'Rabat-Salé-Kenitra', true, NOW()),
(9, 'CTS Témara', 'Témara', 'Avenue Mohammed VI', '0537000004', 33.9200, -6.9000, 'Rabat-Salé-Kenitra', true, NOW()),
(10, 'CTS Fès', 'Fès', 'Route d''Imouzzer', '0535000001', 34.0333, -5.0000, 'Fès-Meknès', true, NOW()),
(11, 'CTS Meknès', 'Meknès', 'Avenue des FAR', '0535000002', 33.9000, -5.5500, 'Fès-Meknès', true, NOW()),
(12, 'CTS Taza', 'Taza', 'Boulevard Mohammed V', '0535000003', 34.2167, -4.0167, 'Fès-Meknès', true, NOW()),
(13, 'CTS Sefrou', 'Sefrou', 'Avenue de la Libération', '0535000004', 33.8333, -4.8333, 'Fès-Meknès', true, NOW()),
(14, 'CTS Tanger', 'Tanger', 'Avenue des FAR', '0539000001', 35.7667, -5.8000, 'Tanger-Tétouan-Al Hoceïma', true, NOW()),
(15, 'CTS Tétouan', 'Tétouan', 'Avenue Mohamed VI', '0539000002', 35.5667, -5.3667, 'Tanger-Tétouan-Al Hoceïma', true, NOW()),
(16, 'CTS Al Hoceïma', 'Al Hoceïma', 'Boulevard Mohammed V', '0539000003', 35.2500, -3.9333, 'Tanger-Tétouan-Al Hoceïma', true, NOW()),
(17, 'CTS Larache', 'Larache', 'Avenue Hassan II', '0539000004', 35.1833, -6.1500, 'Tanger-Tétouan-Al Hoceïma', true, NOW()),
(18, 'CTS Marrakech', 'Marrakech', 'Gueliz', '0524000001', 31.6295, -7.9811, 'Marrakech-Safi', true, NOW()),
(19, 'CTS Safi', 'Safi', 'Boulevard Ibn Sina', '0524000002', 32.2833, -9.2333, 'Marrakech-Safi', true, NOW()),
(20, 'CTS Essaouira', 'Essaouira', 'Avenue de l''Istiqlal', '0524000003', 31.5167, -9.7667, 'Marrakech-Safi', true, NOW()),
(21, 'CTS Ben Guerir', 'Ben Guerir', 'Route de Marrakech', '0524000004', 32.2333, -7.9500, 'Marrakech-Safi', true, NOW()),
(22, 'CTS Agadir', 'Agadir', 'Avenue Hassan II', '0528000001', 30.4278, -9.5981, 'Souss-Massa', true, NOW()),
(23, 'CTS Inezgane', 'Inezgane', 'Boulevard Mohammed V', '0528000002', 30.3667, -9.5333, 'Souss-Massa', true, NOW()),
(24, 'CTS Taroudant', 'Taroudant', 'Avenue de la Liberté', '0528000003', 30.4667, -8.8667, 'Souss-Massa', true, NOW()),
(25, 'CTS Tiznit', 'Tiznit', 'Boulevard Mohammed V', '0528000004', 29.7000, -9.7333, 'Souss-Massa', true, NOW()),
(26, 'CTS Oujda', 'Oujda', 'Avenue des Almohades', '0536000001', 34.6833, -1.9000, 'Oriental', true, NOW()),
(27, 'CTS Nador', 'Nador', 'Boulevard Mohammed V', '0536000002', 35.1667, -2.9333, 'Oriental', true, NOW()),
(28, 'CTS Berkane', 'Berkane', 'Route d''Oujda', '0536000003', 34.9167, -2.3167, 'Oriental', true, NOW()),
(29, 'CTS Taourirt', 'Taourirt', 'Avenue Hassan II', '0536000004', 34.4167, -2.9000, 'Oriental', true, NOW()),
(30, 'CTS Béni Mellal', 'Béni Mellal', 'Boulevard Mohammed V', '0523000005', 32.3333, -6.3500, 'Béni Mellal-Khénifra', true, NOW()),
(31, 'CTS Khénifra', 'Khénifra', 'Avenue Hassan II', '0523000006', 32.9333, -5.6667, 'Béni Mellal-Khénifra', true, NOW()),
(32, 'CTS Azilal', 'Azilal', 'Route de Béni Mellal', '0523000007', 31.9667, -6.5667, 'Béni Mellal-Khénifra', true, NOW()),
(33, 'CTS Laâyoune', 'Laâyoune', 'Boulevard Hassan II', '0528000005', 27.1500, -13.2000, 'Laâyoune-Sakia El Hamra', true, NOW()),
(34, 'CTS Boujdour', 'Boujdour', 'Avenue de l''Unité', '0528000006', 26.1333, -14.4833, 'Laâyoune-Sakia El Hamra', true, NOW()),
(35, 'CTS Dakhla', 'Dakhla', 'Boulevard Mohammed V', '0528000007', 23.7167, -15.9333, 'Dakhla-Oued Ed-Dahab', true, NOW()),
(36, 'CTS Errachidia', 'Errachidia', 'Avenue Mohammed V', '0535000005', 31.9333, -4.4167, 'Drâa-Tafilalet', true, NOW()),
(37, 'CTS Ouarzazate', 'Ouarzazate', 'Boulevard Moulay Abdellah', '0524000005', 30.9167, -6.9167, 'Drâa-Tafilalet', true, NOW()),
(38, 'CTS Zagora', 'Zagora', 'Route de Ouarzazate', '0524000006', 30.3333, -5.8333, 'Drâa-Tafilalet', true, NOW()),
(39, 'CTS Guelmim', 'Guelmim', 'Boulevard Hassan II', '0528000008', 28.9833, -10.0667, 'Guelmim-Oued Noun', true, NOW()),
(40, 'CTS Tan-Tan', 'Tan-Tan', 'Avenue Mohammed V', '0528000009', 28.4333, -11.1000, 'Guelmim-Oued Noun', true, NOW());

-- -----------------------------------------------------
-- 3. STOCKS (40 centres x 8 groupes = 320 stocks)
-- -----------------------------------------------------
DELETE FROM blood_stocks;
INSERT INTO blood_stocks (center_id, blood_type, component_type, quantity, min_threshold, status, expiry_date, last_updated) VALUES
(1, 'O_NEG', 'WHOLE_BLOOD', 3, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 15 DAY), NOW()),
(1, 'O_POS', 'WHOLE_BLOOD', 18, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 30 DAY), NOW()),
(1, 'A_NEG', 'WHOLE_BLOOD', 8, 10, 'LOW', DATE_ADD(CURDATE(), INTERVAL 20 DAY), NOW()),
(1, 'A_POS', 'WHOLE_BLOOD', 25, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 45 DAY), NOW()),
(1, 'B_NEG', 'WHOLE_BLOOD', 5, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 10 DAY), NOW()),
(1, 'B_POS', 'WHOLE_BLOOD', 22, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 35 DAY), NOW()),
(1, 'AB_NEG', 'WHOLE_BLOOD', 2, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NOW()),
(1, 'AB_POS', 'WHOLE_BLOOD', 12, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 25 DAY), NOW()),
(2, 'O_NEG', 'WHOLE_BLOOD', 5, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 12 DAY), NOW()),
(2, 'O_POS', 'WHOLE_BLOOD', 20, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 28 DAY), NOW()),
(2, 'A_NEG', 'WHOLE_BLOOD', 6, 10, 'LOW', DATE_ADD(CURDATE(), INTERVAL 18 DAY), NOW()),
(2, 'A_POS', 'WHOLE_BLOOD', 28, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 40 DAY), NOW()),
(2, 'B_NEG', 'WHOLE_BLOOD', 4, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 8 DAY), NOW()),
(2, 'B_POS', 'WHOLE_BLOOD', 19, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 32 DAY), NOW()),
(2, 'AB_NEG', 'WHOLE_BLOOD', 3, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 6 DAY), NOW()),
(2, 'AB_POS', 'WHOLE_BLOOD', 10, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 22 DAY), NOW()),
(3, 'O_NEG', 'WHOLE_BLOOD', 4, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 14 DAY), NOW()),
(3, 'O_POS', 'WHOLE_BLOOD', 22, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 33 DAY), NOW()),
(3, 'A_NEG', 'WHOLE_BLOOD', 7, 10, 'LOW', DATE_ADD(CURDATE(), INTERVAL 21 DAY), NOW()),
(3, 'A_POS', 'WHOLE_BLOOD', 30, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 50 DAY), NOW()),
(3, 'B_NEG', 'WHOLE_BLOOD', 6, 10, 'LOW', DATE_ADD(CURDATE(), INTERVAL 16 DAY), NOW()),
(3, 'B_POS', 'WHOLE_BLOOD', 24, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 38 DAY), NOW()),
(3, 'AB_NEG', 'WHOLE_BLOOD', 2, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 4 DAY), NOW()),
(3, 'AB_POS', 'WHOLE_BLOOD', 11, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 27 DAY), NOW());

-- Remplissage automatique pour les centres 4 à 40
INSERT INTO blood_stocks (center_id, blood_type, component_type, quantity, min_threshold, status, expiry_date, last_updated)
SELECT c.id, bt.blood_type, 'WHOLE_BLOOD',
    FLOOR(5 + RAND() * 45),
    10,
    CASE WHEN FLOOR(5 + RAND() * 45) < 8 THEN 'CRITICAL' WHEN FLOOR(5 + RAND() * 45) < 15 THEN 'LOW' ELSE 'NORMAL' END,
    DATE_ADD(CURDATE(), INTERVAL FLOOR(15 + RAND() * 60) DAY),
    NOW()
FROM (SELECT id FROM blood_bank_centers WHERE id BETWEEN 4 AND 40) c
CROSS JOIN (SELECT 'O_NEG' as blood_type UNION SELECT 'O_POS' UNION SELECT 'A_NEG' UNION SELECT 'A_POS' 
            UNION SELECT 'B_NEG' UNION SELECT 'B_POS' UNION SELECT 'AB_NEG' UNION SELECT 'AB_POS') bt;

-- -----------------------------------------------------
-- 4. DONNEURS (200 donneurs)
-- -----------------------------------------------------
DELETE FROM donor_profiles;
INSERT INTO donor_profiles (full_name, blood_type, city, address, phone, email, latitude, longitude, available, last_donation_date, total_donations, preferred_center_id) VALUES
('Donneur_1', 'O_NEG', 'Casablanca', 'Adresse 1', '0612345671', 'donneur1@example.com', 33.5731, -7.5898, true, '2026-04-01', 5, 1),
('Donneur_2', 'O_POS', 'Rabat', 'Adresse 2', '0612345672', 'donneur2@example.com', 34.0209, -6.8416, true, '2026-03-15', 8, 6),
('Donneur_3', 'A_NEG', 'Marrakech', 'Adresse 3', '0612345673', 'donneur3@example.com', 31.6295, -7.9811, true, '2026-04-20', 3, 18),
('Donneur_4', 'A_POS', 'Fès', 'Adresse 4', '0612345674', 'donneur4@example.com', 34.0333, -5.0000, false, '2025-12-10', 12, 10),
('Donneur_5', 'B_NEG', 'Tanger', 'Adresse 5', '0612345675', 'donneur5@example.com', 35.7667, -5.8000, true, '2026-02-28', 6, 14),
('Donneur_6', 'B_POS', 'Agadir', 'Adresse 6', '0612345676', 'donneur6@example.com', 30.4278, -9.5981, true, '2026-05-01', 4, 22),
('Donneur_7', 'AB_NEG', 'El Jadida', 'Adresse 7', '0612345677', 'donneur7@example.com', 33.2316, -8.5007, false, '2025-11-05', 2, 3),
('Donneur_8', 'AB_POS', 'Oujda', 'Adresse 8', '0612345678', 'donneur8@example.com', 34.6833, -1.9000, true, '2026-01-20', 7, 26),
('Donneur_9', 'O_NEG', 'Meknès', 'Adresse 9', '0612345679', 'donneur9@example.com', 33.9000, -5.5500, true, '2026-04-10', 4, 11),
('Donneur_10', 'O_POS', 'Kénitra', 'Adresse 10', '0612345680', 'donneur10@example.com', 34.2500, -6.5800, true, '2026-03-05', 9, 8),
('Donneur_11', 'A_NEG', 'Tétouan', 'Adresse 11', '0612345681', 'donneur11@example.com', 35.5667, -5.3667, false, '2025-09-15', 1, 15),
('Donneur_12', 'A_POS', 'Laâyoune', 'Adresse 12', '0612345682', 'donneur12@example.com', 27.1500, -13.2000, true, '2026-02-10', 5, 33),
('Donneur_13', 'B_NEG', 'Settat', 'Adresse 13', '0612345683', 'donneur13@example.com', 33.0000, -7.6200, true, '2026-04-18', 3, 4),
('Donneur_14', 'B_POS', 'Salé', 'Adresse 14', '0612345684', 'donneur14@example.com', 34.0500, -6.8000, true, '2026-05-05', 6, 7),
('Donneur_15', 'AB_NEG', 'Béni Mellal', 'Adresse 15', '0612345685', 'donneur15@example.com', 32.3333, -6.3500, false, '2025-10-30', 2, 30),
('Donneur_16', 'AB_POS', 'Dakhla', 'Adresse 16', '0612345686', 'donneur16@example.com', 23.7167, -15.9333, true, '2026-01-25', 4, 35),
('Donneur_17', 'O_NEG', 'Nador', 'Adresse 17', '0612345687', 'donneur17@example.com', 35.1667, -2.9333, true, '2026-03-12', 7, 27),
('Donneur_18', 'O_POS', 'Safi', 'Adresse 18', '0612345688', 'donneur18@example.com', 32.2833, -9.2333, true, '2026-04-22', 5, 19),
('Donneur_19', 'A_NEG', 'Ouarzazate', 'Adresse 19', '0612345689', 'donneur19@example.com', 30.9167, -6.9167, false, '2025-08-08', 1, 37),
('Donneur_20', 'A_POS', 'Guelmim', 'Adresse 20', '0612345690', 'donneur20@example.com', 28.9833, -10.0667, true, '2026-02-14', 3, 39);

-- Générer les 180 donneurs restants
INSERT INTO donor_profiles (full_name, blood_type, city, address, phone, email, latitude, longitude, available, last_donation_date, total_donations, preferred_center_id)
SELECT 
    CONCAT('Donneur_', n),
    ELT(FLOOR(1 + RAND() * 8), 'O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'),
    ELT(FLOOR(1 + RAND() * 12), 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'El Jadida', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Laâyoune'),
    CONCAT('Adresse générée ', n),
    CONCAT('06', LPAD(FLOOR(20 + RAND() * 10000000), 7, '0')),
    CONCAT('donneur_gen_', n, '@example.com'),
    33.5 + (RAND() - 0.5) * 2,
    -7.5 + (RAND() - 0.5) * 2,
    (RAND() > 0.3),
    CASE WHEN RAND() > 0.5 THEN DATE_ADD(CURDATE(), INTERVAL -FLOOR(RAND() * 365) DAY) ELSE NULL END,
    FLOOR(RAND() * 20),
    FLOOR(1 + RAND() * 40)
FROM (SELECT @rownum := @rownum + 1 AS n FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
     (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
     (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t3,
     (SELECT @rownum := 20) r) numbers
WHERE n <= 180;

-- -----------------------------------------------------
-- 5. DEMANDES (500 demandes)
-- -----------------------------------------------------
DELETE FROM blood_requests;
INSERT INTO blood_requests (patient_name, blood_type, urgency, status, hospital, city, latitude, longitude, notes, created_at, center_id) VALUES
('Patient_1', 'O_NEG', 'CRITICAL', 'PENDING', 'CHU Ibn Rochd', 'Casablanca', 33.5731, -7.5898, 'Urgence', DATE_SUB(NOW(), INTERVAL 1 DAY), 1),
('Patient_2', 'AB_NEG', 'HIGH', 'PENDING', 'Hopital Ibn Rochd', 'Casablanca', 33.5731, -7.5898, 'Urgence relative', DATE_SUB(NOW(), INTERVAL 2 DAY), 1),
('Patient_3', 'A_POS', 'MEDIUM', 'FULFILLED', 'Hopital Mohammed V', 'El Jadida', 33.2316, -8.5007, 'Programmé', DATE_SUB(NOW(), INTERVAL 5 DAY), 3),
('Patient_4', 'B_POS', 'LOW', 'CANCELLED', 'Clinique Atlas', 'Marrakech', 31.6295, -7.9811, 'Annulé', DATE_SUB(NOW(), INTERVAL 8 DAY), 18),
('Patient_5', 'O_POS', 'CRITICAL', 'PENDING', 'CHU Hassan II', 'Fès', 34.0333, -5.0000, 'Urgence', DATE_SUB(NOW(), INTERVAL 1 DAY), 10),
('Patient_6', 'A_NEG', 'HIGH', 'FULFILLED', 'Hopital Militaire', 'Rabat', 34.0209, -6.8416, 'Traité', DATE_SUB(NOW(), INTERVAL 3 DAY), 6),
('Patient_7', 'B_NEG', 'MEDIUM', 'PENDING', 'CHU Mohammed VI', 'Marrakech', 31.6295, -7.9811, 'En attente', DATE_SUB(NOW(), INTERVAL 1 DAY), 18),
('Patient_8', 'AB_POS', 'LOW', 'FULFILLED', 'Clinique du Sud', 'Agadir', 30.4278, -9.5981, 'Traité', DATE_SUB(NOW(), INTERVAL 10 DAY), 22),
('Patient_9', 'O_NEG', 'CRITICAL', 'PENDING', 'CHU Ibn Rochd', 'Casablanca', 33.5731, -7.5898, 'Urgence', DATE_SUB(NOW(), INTERVAL 0 DAY), 1),
('Patient_10', 'A_POS', 'HIGH', 'PENDING', 'Hopital Ibn Sina', 'Rabat', 34.0209, -6.8416, 'En attente', DATE_SUB(NOW(), INTERVAL 1 DAY), 6);

-- Générer les 490 demandes restantes
INSERT INTO blood_requests (patient_name, blood_type, urgency, status, hospital, city, latitude, longitude, notes, created_at, center_id)
SELECT 
    CONCAT('Patient_', n),
    ELT(FLOOR(1 + RAND() * 8), 'O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'),
    CASE WHEN RAND() < 0.10 THEN 'CRITICAL' WHEN RAND() < 0.30 THEN 'HIGH' WHEN RAND() < 0.70 THEN 'MEDIUM' ELSE 'LOW' END,
    CASE WHEN RAND() < 0.40 THEN 'FULFILLED' WHEN RAND() < 0.85 THEN 'PENDING' ELSE 'CANCELLED' END,
    CONCAT('Hôpital ', ELT(FLOOR(1 + RAND() * 5), 'Principal', 'Régional', 'Ibn Sina', 'Mohammed V', 'Hassan II')),
    ELT(FLOOR(1 + RAND() * 12), 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'El Jadida', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Laâyoune'),
    33.5 + (RAND() - 0.5) * 2,
    -7.5 + (RAND() - 0.5) * 2,
    CONCAT('Besoin généré ', n),
    DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 880) DAY),
    FLOOR(1 + RAND() * 40)
FROM (SELECT @rownum2 := @rownum2 + 1 AS n FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1,
     (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2,
     (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t3,
     (SELECT @rownum2 := 10) r) numbers
WHERE n <= 490;

-- -----------------------------------------------------
-- 6. DONS (500 dons)
-- -----------------------------------------------------
DELETE FROM donations;
INSERT INTO donations (donor_id, request_id, center_id, status, latitude, longitude, scheduled_at, donated_at, notes)
SELECT 
    dp.id,
    br.id,
    dp.preferred_center_id,
    CASE WHEN RAND() < 0.7 THEN 'FULFILLED' WHEN RAND() < 0.9 THEN 'PLANNED' ELSE 'CANCELLED' END,
    dp.latitude,
    dp.longitude,
    DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 30) DAY),
    CASE WHEN RAND() < 0.7 THEN DATE_ADD(CURDATE(), INTERVAL -FLOOR(RAND() * 365) DAY) ELSE NULL END,
    CONCAT('Don effectué le ', DATE_ADD(CURDATE(), INTERVAL -FLOOR(RAND() * 365) DAY))
FROM donor_profiles dp
CROSS JOIN (SELECT id FROM blood_requests LIMIT 500) br
LIMIT 500;

-- -----------------------------------------------------
-- 7. PATIENTS, ALERTES ET RAPPORTS
-- -----------------------------------------------------
DELETE FROM patient_profiles;
INSERT INTO patient_profiles (full_name, phone, email, city, hospital, blood_type) VALUES
('Patient Test A', '0666666666', 'patienta@example.com', 'Casablanca', 'CHU Ibn Rochd', 'O_NEG'),
('Patient Test B', '0677777777', 'patientb@example.com', 'Casablanca', 'Hopital Ibn Rochd', 'AB_NEG'),
('Patient Test C', '0688888888', 'patientc@example.com', 'El Jadida', 'Hopital Mohammed V', 'A_POS');

DELETE FROM blood_alerts;
INSERT INTO blood_alerts (title, message, severity, blood_type, city, center_name, resolved, created_at) VALUES
('Stock critique O- au CNTS Casablanca', 'Le stock O- est de 3 poches alors que le seuil minimal est de 10.', 'CRITICAL', 'O_NEG', 'Casablanca', 'CNTS Casablanca', false, NOW()),
('Demande urgente AB- à l Hopital Ibn Rochd', 'Une demande AB- haute priorité est toujours en attente.', 'HIGH', 'AB_NEG', 'Casablanca', 'CNTS Casablanca', false, NOW()),
('Stock de plaquettes faible à Marrakech', 'Le stock de plaquettes AB- expire bientôt et reste sous le seuil.', 'CRITICAL', 'AB_NEG', 'Marrakech', 'CTS Marrakech', false, NOW()),
('Aucun donneur compatible proche pour B+', 'Besoin de vérifier les donneurs B+ disponibles autour de Marrakech.', 'MEDIUM', 'B_POS', 'Marrakech', 'CTS Marrakech', false, NOW());

DELETE FROM report_items;
INSERT INTO report_items (report_type, center_name, city, status, priority, findings, report_date) VALUES
('Rapport de stock', 'CNTS Casablanca', 'Casablanca', 'Completed', 'Critical', 'Stock O- inférieur au seuil minimal', CURDATE()),
('Rapport des demandes', 'Hopital Ibn Rochd', 'Casablanca', 'Pending', 'High', 'Demande urgente AB- non encore satisfaite', CURDATE()),
('Rapport des donations', 'CTS El Jadida', 'El Jadida', 'Completed', 'Medium', 'Taux de satisfaction des demandes stable', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

-- -----------------------------------------------------
-- 8. VÉRIFICATION FINALE
-- -----------------------------------------------------
SELECT '=== BLOODBI ANALYTICS - DATASET STATISTICS ===' AS info;
SELECT 'blood_bank_centers' AS table_name, COUNT(*) AS nombre FROM blood_bank_centers
UNION SELECT 'donor_profiles', COUNT(*) FROM donor_profiles
UNION SELECT 'blood_requests', COUNT(*) FROM blood_requests
UNION SELECT 'donations', COUNT(*) FROM donations
UNION SELECT 'blood_stocks', COUNT(*) FROM blood_stocks;
INSERT INTO app_users (
    username,
    email,
    password,
    role,
    active,
    created_at
)
VALUES (
    'HajarKhomssi',
    'hjkh123@gmail.com',
    '123456',
    'PATIENT',
    true,
    NOW()
);
SET FOREIGN_KEY_CHECKS = 1;
