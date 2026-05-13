USE bloodbi;

CREATE OR REPLACE VIEW view_requests_by_blood_type AS
SELECT
  blood_type,
  COUNT(*) AS total_requests,
  SUM(CASE WHEN status = 'FULFILLED' THEN 1 ELSE 0 END) AS fulfilled_requests,
  SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_requests,
  SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_requests,
  SUM(CASE WHEN urgency = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_requests
FROM blood_requests
GROUP BY blood_type;

CREATE OR REPLACE VIEW view_stock_by_center AS
SELECT
  c.id AS center_id,
  c.name AS center_name,
  c.city,
  c.region,
  s.blood_type,
  s.component_type,
  s.quantity,
  s.min_threshold,
  s.status,
  s.expiry_date,
  s.last_updated
FROM blood_stocks s
JOIN blood_bank_centers c ON c.id = s.center_id;

CREATE OR REPLACE VIEW view_monthly_donations AS
SELECT
  DATE_FORMAT(donated_at, '%Y-%m') AS month,
  COUNT(*) AS total_donations
FROM donations
WHERE status = 'FULFILLED'
  AND donated_at IS NOT NULL
GROUP BY DATE_FORMAT(donated_at, '%Y-%m');

CREATE OR REPLACE VIEW view_donors_by_blood_type AS
SELECT
  blood_type,
  COUNT(*) AS total_donors,
  SUM(CASE WHEN available = TRUE THEN 1 ELSE 0 END) AS available_donors
FROM donor_profiles
GROUP BY blood_type;

CREATE OR REPLACE VIEW view_donors_by_city AS
SELECT
  city,
  COUNT(*) AS total_donors,
  SUM(CASE WHEN available = TRUE THEN 1 ELSE 0 END) AS available_donors
FROM donor_profiles
GROUP BY city;

CREATE OR REPLACE VIEW view_critical_stocks AS
SELECT
  c.name AS center_name,
  c.city,
  s.blood_type,
  s.component_type,
  s.quantity,
  s.min_threshold,
  s.status,
  s.expiry_date
FROM blood_stocks s
JOIN blood_bank_centers c ON c.id = s.center_id
WHERE s.status = 'CRITICAL'
   OR s.quantity < s.min_threshold;

CREATE OR REPLACE VIEW view_active_alerts AS
SELECT
  id,
  title,
  message,
  severity,
  blood_type,
  city,
  center_name,
  resolved,
  created_at
FROM blood_alerts
WHERE resolved = FALSE
ORDER BY
  CASE severity
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3
    WHEN 'LOW' THEN 4
    ELSE 5
  END,
  created_at DESC;

CREATE OR REPLACE VIEW view_reports AS
SELECT
  id,
  report_type,
  center_name,
  city,
  status,
  priority,
  findings,
  report_date
FROM report_items
ORDER BY report_date DESC;

CREATE OR REPLACE VIEW view_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM donor_profiles) AS total_donors,
  (SELECT COUNT(*) FROM donor_profiles WHERE available = TRUE) AS available_donors,
  (SELECT COUNT(*) FROM blood_requests WHERE status = 'PENDING') AS active_requests,
  (SELECT COUNT(*) FROM blood_requests WHERE urgency = 'CRITICAL' AND status = 'PENDING') AS critical_requests,
  (SELECT COUNT(*) FROM blood_stocks WHERE status = 'CRITICAL') AS critical_stocks,
  (SELECT COUNT(*) FROM donations WHERE status = 'FULFILLED') AS fulfilled_donations,
  (SELECT COUNT(*) FROM blood_bank_centers WHERE active = TRUE) AS active_centers,
  (SELECT COUNT(*) FROM blood_alerts WHERE resolved = FALSE) AS active_alerts;

CREATE OR REPLACE VIEW view_fulfillment_rate AS
SELECT
  COUNT(*) AS total_requests,
  SUM(CASE WHEN status = 'FULFILLED' THEN 1 ELSE 0 END) AS fulfilled_requests,
  ROUND(
    100 * SUM(CASE WHEN status = 'FULFILLED' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) AS fulfillment_rate_percentage
FROM blood_requests;

CREATE OR REPLACE VIEW view_blood_request_details AS
SELECT
  r.id,
  r.patient_name,
  r.blood_type,
  r.urgency,
  r.status,
  r.hospital,
  r.city,
  c.name AS assigned_center,
  r.created_at,
  r.fulfilled_at
FROM blood_requests r
LEFT JOIN blood_bank_centers c ON c.id = r.center_id;

CREATE OR REPLACE VIEW view_donation_details AS
SELECT
  d.id,
  dp.full_name AS donor_name,
  dp.blood_type,
  c.name AS center_name,
  c.city,
  d.status,
  d.scheduled_at,
  d.donated_at
FROM donations d
LEFT JOIN donor_profiles dp ON dp.id = d.donor_id
LEFT JOIN blood_bank_centers c ON c.id = d.center_id;