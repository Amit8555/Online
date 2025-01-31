-- Create database
CREATE DATABASE IF NOT EXISTS amit_coaching;
USE amit_coaching;

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(12) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    specialization VARCHAR(50) NOT NULL,
    experience INT NOT NULL,
    resume_path VARCHAR(255) NOT NULL,
    certificate_path VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(12) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL,
    aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    course VARCHAR(50) NOT NULL,
    batch_timing VARCHAR(50) NOT NULL,
    last_exam VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    marksheet_path VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    duration VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    batch_time VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    current_students INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default courses
INSERT INTO courses (course_code, course_name, description, duration) VALUES
('BCA', 'Bachelor of Computer Applications', 'Regular BCA program with comprehensive computer science education', '3 Years'),
('BCA-AI', 'BCA with AI Specialization', 'BCA program with focus on Artificial Intelligence and Machine Learning', '3 Years'),
('BCA-DS', 'BCA with Data Science', 'BCA program specialized in Data Science and Analytics', '3 Years'),
('BCA-CLOUD', 'BCA with Cloud Computing', 'BCA program with emphasis on Cloud Computing and DevOps', '3 Years');

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_path VARCHAR(255) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marks DECIMAL(5,2),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Create indexes for better performance
CREATE INDEX idx_teacher_id ON teachers(teacher_id);
CREATE INDEX idx_student_id ON students(student_id);
CREATE INDEX idx_course_code ON courses(course_code);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_assignment_due ON assignments(due_date);
