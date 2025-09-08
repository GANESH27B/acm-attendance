-- Smart Attendance Platform Database Schema
-- Run this script to initialize your database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS smartattend_db;
USE smartattend_db;

-- Users table for both students and admins
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    subject_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    status ENUM('present', 'absent', 'late') DEFAULT 'present',
    marked_by VARCHAR(50),
    qr_code_used TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (user_id, subject_id, attendance_date)
);

-- QR codes table for dynamic QR generation
CREATE TABLE IF NOT EXISTS qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    qr_data TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_user_date ON attendance(user_id, attendance_date);
CREATE INDEX idx_attendance_subject_date ON attendance(subject_id, attendance_date);
CREATE INDEX idx_qr_codes_user_active ON qr_codes(user_id, is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (
    id, full_name, email, password_hash, role, department, registration_number, acm_member
) VALUES (
    'ADMIN001', 
    'System Administrator', 
    'admin@smartattend.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin', 
    'Administration',
    'ADMIN001',
    FALSE
);

-- Insert sample subjects
INSERT IGNORE INTO subjects (subject_name, subject_code, department, credits) VALUES
('Data Structures and Algorithms', 'CSE301', 'Computer Science Engineering', 4),
('Database Management Systems', 'CSE302', 'Computer Science Engineering', 3),
('Web Development', 'CSE303', 'Computer Science Engineering', 3),
('Software Engineering', 'CSE304', 'Computer Science Engineering', 3),
('Computer Networks', 'CSE305', 'Computer Science Engineering', 4),
('Digital Signal Processing', 'ECE301', 'Electronics and Communication Engineering', 4),
('Microprocessors', 'ECE302', 'Electronics and Communication Engineering', 3),
('Thermodynamics', 'ME301', 'Mechanical Engineering', 3),
('Fluid Mechanics', 'ME302', 'Mechanical Engineering', 4);

-- Insert sample student users (password: student123)
INSERT IGNORE INTO users (
    id, full_name, email, password_hash, role, department, 
    registration_number, student_id, acm_member, acm_role, year, section
) VALUES 
('USER001', 'John Doe', 'john.doe@klu.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Computer Science Engineering', 'REG2024001', '21001A05L0', TRUE, 'Technical Lead', '3rd Year', 'A'),
('USER002', 'Jane Smith', 'jane.smith@klu.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Computer Science Engineering', 'REG2024002', '21001A05L1', TRUE, 'President', '3rd Year', 'A'),
('USER003', 'Mike Johnson', 'mike.johnson@klu.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Mechanical Engineering', 'REG2024003', '21001A03L0', FALSE, NULL, '2nd Year', 'B'),
('USER004', 'Sarah Wilson', 'sarah.wilson@klu.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Electronics and Communication Engineering', 'REG2024004', '21001A04L0', TRUE, 'Secretary', '1st Year', 'A');

-- Insert sample attendance records
INSERT IGNORE INTO attendance (user_id, subject_id, attendance_date, attendance_time, status, marked_by) VALUES
('USER001', 1, CURDATE(), '09:15:00', 'present', 'ADMIN001'),
('USER001', 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'present', 'ADMIN001'),
('USER001', 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '14:00:00', 'present', 'ADMIN001'),
('USER002', 1, CURDATE(), '09:12:00', 'present', 'ADMIN001'),
('USER002', 6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '11:00:00', 'present', 'ADMIN001'),
('USER003', 8, CURDATE(), '10:00:00', 'present', 'ADMIN001'),
('USER004', 6, CURDATE(), '09:18:00', 'present', 'ADMIN001');