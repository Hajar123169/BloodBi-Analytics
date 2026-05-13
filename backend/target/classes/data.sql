INSERT INTO app_users (id, username, email, password, role, active, created_at) VALUES
(1, 'admin', 'admin@bloodbi.local', 'password', 'ADMIN', true, NOW()),
(2, 'doctor', 'doctor@bloodbi.local', 'password', 'CENTER_MANAGER', true, NOW());

INSERT INTO blood_bank_centers (id, name, city, address, phone, latitude, longitude, region, active, created_at) VALUES
(1, 'CNTS Casablanca', 'Casablanca', 'Rue des Hopitaux, Casablanca', '0522000001', 33.5731, -7.5898, 'Casablanca-Settat', true, NOW()),
(2, 'Centre Regional Rabat', 'Rabat', 'Avenue Mohammed V, Rabat', '0537000002', 34.0209, -6.8416, 'Rabat-Sale-Kenitra', true, NOW()),
(3, 'Centre de Transfusion Marrakech', 'Marrakech', 'Gueliz, Marrakech', '0524000003', 31.6295, -7.9811, 'Marrakech-Safi', true, NOW()),
(4, 'Centre El Jadida', 'El Jadida', 'Avenue Jabrane Khalil, El Jadida', '0523000004', 33.2316, -8.5007, 'Casablanca-Settat', true, NOW());

INSERT INTO donor_profiles (id, full_name, blood_type, city, address, phone, email, latitude, longitude, available, last_donation_date, total_donations, preferred_center_id, created_at) VALUES
(1, 'Hajar Khomssi', 'O_NEG', 'El Jadida', 'Hay Al Qods', '0611111111', 'hajar@example.com', 33.2316, -8.5007, true, '2025-04-10', 4, 4, NOW()),
(2, 'Sara Mahfoud', 'A_POS', 'Casablanca', 'Maarif', '0622222222', 'sara@example.com', 33.5731, -7.5898, true, '2025-03-15', 6, 1, NOW()),
(3, 'Adil Karimi', 'AB_NEG', 'Rabat', 'Agdal', '0633333333', 'adil@example.com', 34.0209, -6.8416, false, '2025-02-20', 2, 2, NOW()),
(4, 'Nabil Ouardi', 'B_POS', 'Marrakech', 'Massira', '0644444444', 'nabil@example.com', 31.6295, -7.9811, true, '2025-05-01', 3, 3, NOW()),
(5, 'Fatima Azzouz', 'O_POS', 'Casablanca', 'Ain Sebaa', '0655555555', 'fatima@example.com', 33.6000, -7.5200, true, '2025-01-12', 7, 1, NOW());

INSERT INTO patient_profiles (id, full_name, phone, email, city, hospital, blood_type) VALUES
(1, 'Patient A', '0666666666', 'patienta@example.com', 'Casablanca', 'CHU Ibn Rochd', 'O_NEG'),
(2, 'Patient B', '0677777777', 'patientb@example.com', 'Casablanca', 'Hopital Ibn Rochd', 'AB_NEG'),
(3, 'Patient C', '0688888888', 'patientc@example.com', 'El Jadida', 'Hopital Mohammed V', 'A_POS');

INSERT INTO blood_requests (id, patient_name, blood_type, urgency, status, hospital, city, latitude, longitude, notes, created_at, center_id) VALUES
(1, 'Patient A', 'O_NEG', 'CRITICAL', 'PENDING', 'CHU Ibn Rochd', 'Casablanca', 33.5731, -7.5898, 'Operation urgente', NOW(), 1),
(2, 'Patient B', 'AB_NEG', 'HIGH', 'PENDING', 'Hopital Ibn Rochd', 'Casablanca', 33.5731, -7.5898, 'Transfusion urgente', NOW(), 1),
(3, 'Patient C', 'A_POS', 'MEDIUM', 'FULFILLED', 'Hopital Mohammed V', 'El Jadida', 33.2316, -8.5007, 'Intervention programmee', DATE_SUB(NOW(), INTERVAL 5 DAY), 4),
(4, 'Patient D', 'B_POS', 'LOW', 'CANCELLED', 'Clinique Atlas', 'Marrakech', 31.6295, -7.9811, 'Besoin annule', DATE_SUB(NOW(), INTERVAL 8 DAY), 3);

INSERT INTO blood_stocks (id, center_id, blood_type, component_type, quantity, min_threshold, status, expiry_date, last_updated) VALUES
(1, 1, 'O_NEG', 'RED_CELLS', 3, 10, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 15 DAY), NOW()),
(2, 1, 'A_POS', 'PLASMA', 25, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 120 DAY), NOW()),
(3, 3, 'AB_NEG', 'PLATELETS', 2, 8, 'CRITICAL', DATE_ADD(CURDATE(), INTERVAL 4 DAY), NOW()),
(4, 2, 'O_POS', 'WHOLE_BLOOD', 18, 10, 'NORMAL', DATE_ADD(CURDATE(), INTERVAL 24 DAY), NOW()),
(5, 4, 'B_POS', 'RED_CELLS', 9, 10, 'LOW', DATE_ADD(CURDATE(), INTERVAL 18 DAY), NOW());

INSERT INTO donations (id, donor_id, request_id, center_id, status, latitude, longitude, scheduled_at, donated_at, notes) VALUES
(1, 1, 3, 4, 'FULFILLED', 33.2316, -8.5007, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'Don realise avec succes'),
(2, 2, 1, 1, 'PLANNED', 33.5731, -7.5898, DATE_ADD(NOW(), INTERVAL 1 DAY), NULL, 'Planifie pour urgence O-'),
(3, 5, 2, 1, 'PLANNED', 33.5731, -7.5898, DATE_ADD(NOW(), INTERVAL 2 DAY), NULL, 'Don compatible a confirmer');

INSERT INTO blood_alerts (id, title, message, severity, blood_type, city, center_name, resolved, created_at) VALUES
(1, 'Stock critique O- au CNTS Casablanca', 'Le stock O- est de 3 poches alors que le seuil minimal est de 10.', 'CRITICAL', 'O_NEG', 'Casablanca', 'CNTS Casablanca', false, NOW()),
(2, 'Demande urgente AB- a l Hopital Ibn Rochd', 'Une demande AB- haute priorite est toujours en attente.', 'HIGH', 'AB_NEG', 'Casablanca', 'CNTS Casablanca', false, NOW()),
(3, 'Stock de plaquettes faible a Marrakech', 'Le stock de plaquettes AB- expire bientot et reste sous le seuil.', 'CRITICAL', 'AB_NEG', 'Marrakech', 'Centre de Transfusion Marrakech', false, NOW()),
(4, 'Aucun donneur compatible proche pour B+', 'Besoin de verifier les donneurs B+ disponibles autour de Marrakech.', 'MEDIUM', 'B_POS', 'Marrakech', 'Centre de Transfusion Marrakech', false, NOW());

INSERT INTO report_items (id, report_type, center_name, city, status, priority, findings, report_date) VALUES
(1, 'Rapport de stock', 'CNTS Casablanca', 'Casablanca', 'Completed', 'Critical', 'Stock O- inferieur au seuil minimal', CURDATE()),
(2, 'Rapport des demandes', 'Hopital Ibn Rochd', 'Casablanca', 'Pending', 'High', 'Demande urgente AB- non encore satisfaite', CURDATE()),
(3, 'Rapport des donations', 'Centre El Jadida', 'El Jadida', 'Completed', 'Medium', 'Taux de satisfaction des demandes stable', DATE_SUB(CURDATE(), INTERVAL 1 DAY));
