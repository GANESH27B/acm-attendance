-- Smart Attendance Platform Database Schema

-- Users table for both students and admins
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    department VARCHAR(100),
    profile_image TEXT,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    student_id VARCHAR(50),
    registration_number VARCHAR(50) UNIQUE,
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    acm_member BOOLEAN DEFAULT FALSE,
    acm_role VARCHAR(50),
    year VARCHAR(20),
    section VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects/Classes table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    status ENUM('present', 'absent', 'late') DEFAULT 'present',
    marked_by VARCHAR(50), -- Admin who marked the attendance
    qr_code_used TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (user_id, event_name(191), attendance_date)
);

-- QR codes table for dynamic QR generation
CREATE TABLE qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    qr_data TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Offline sync queue for mobile app
CREATE TABLE sync_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    action_type ENUM('attendance', 'profile_update') NOT NULL,
    data JSON NOT NULL,
    sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin users
INSERT INTO users (id, full_name, email, password_hash, role, department) VALUES
('ADMIN001', 'System Administrator', 'admin@gmail.com', '$2b$10$example_hash', 'admin', 'Administration'),
('ADMIN002', 'Super Admin', 'superadmin@gmail.com', '$2b$10$example_hash', 'admin', 'Administration');

-- Insert sample subjects
INSERT INTO subjects (subject_name, subject_code, department, credits) VALUES
('Data Structures and Algorithms', 'CSE301', 'Computer Science Engineering', 4),
('Database Management Systems', 'CSE302', 'Computer Science Engineering', 3),
('Web Development', 'CSE303', 'Computer Science Engineering', 3),
('Software Engineering', 'CSE304', 'Computer Science Engineering', 3),
('Computer Networks', 'CSE305', 'Computer Science Engineering', 4),
('Digital Signal Processing', 'ECE301', 'Electronics and Communication Engineering', 4),
('Microprocessors', 'ECE302', 'Electronics and Communication Engineering', 3),
('Thermodynamics', 'ME301', 'Mechanical Engineering', 3),
('Fluid Mechanics', 'ME302', 'Mechanical Engineering', 4);

-- Insert sample student users
INSERT INTO users (id, full_name, email, password_hash, role, department) VALUES
('USER123', 'John Doe', 'john.doe@klu.ac.in', '$2b$10$example_hash', 'user', 'Computer Science Engineering'),
('USER124', 'Jane Smith', 'jane.smith@klu.ac.in', '$2b$10$example_hash', 'user', 'Electronics and Communication Engineering'),
('USER125', 'Mike Johnson', 'mike.johnson@klu.ac.in', '$2b$10$example_hash', 'user', 'Mechanical Engineering'),
('USER126', 'Sarah Wilson', 'sarah.wilson@klu.ac.in', '$2b$10$example_hash', 'user', 'Computer Science Engineering');

-- Insert sample attendance records
INSERT INTO attendance (user_id, event_name, attendance_date, attendance_time, status, marked_by) VALUES
('USER123', 'Data Structures and Algorithms', '2024-01-27', '09:15:00', 'present', 'ADMIN001'),
('USER123', 'Database Management Systems', '2024-01-26', '10:30:00', 'present', 'ADMIN001'),
('USER123', 'Web Development', '2024-01-25', '14:00:00', 'absent', 'ADMIN001'),
('USER124', 'Data Structures and Algorithms', '2024-01-27', '09:12:00', 'present', 'ADMIN001'),
('USER124', 'Digital Signal Processing', '2024-01-26', '11:00:00', 'present', 'ADMIN001'),
('USER126', 'Data Structures and Algorithms', '2024-01-27', '09:18:00', 'present', 'ADMIN001');

-- Create indexes for better performance
CREATE INDEX idx_attendance_user_date ON attendance(user_id, attendance_date);
CREATE INDEX idx_attendance_event_date ON attendance(event_name, attendance_date);
CREATE INDEX idx_qr_codes_user_active ON qr_codes(user_id, is_active);
CREATE INDEX idx_sync_queue_status ON sync_queue(sync_status);
