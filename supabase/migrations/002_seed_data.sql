-- Insert default admin user (PIN: 2518)
-- Note: In production, you should hash the PIN properly
INSERT INTO users (username, pin_hash, role, is_active, created_at) 
VALUES (
  'admin', 
  -- This is a simple hash for demo. Use bcrypt in production!
  '$2a$10$YourHashedPinHere', 
  'admin', 
  true, 
  NOW()
);

-- Insert sample hall data
INSERT INTO hall_data (hall_number, data_type, data_value, created_by)
SELECT 
  1,
  'attendance',
  '{"total": 150, "present": 145, "absent": 5}'::jsonb,
  id
FROM users WHERE username = 'admin'
UNION ALL
SELECT 
  2,
  'attendance',
  '{"total": 200, "present": 195, "absent": 5}'::jsonb,
  id
FROM users WHERE username = 'admin'
UNION ALL
SELECT 
  3,
  'attendance',
  '{"total": 180, "present": 175, "absent": 5}'::jsonb,
  id
FROM users WHERE username = 'admin';
