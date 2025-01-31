-- Create exam related tables
USE amit_coaching;

-- Table for subjects
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    course_id INT NOT NULL,
    full_marks INT NOT NULL DEFAULT 100,
    passing_marks INT NOT NULL DEFAULT 40,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Insert BCA first semester subjects
INSERT INTO subjects (subject_code, subject_name, semester, course_id, full_marks, passing_marks) VALUES
('BCA101', 'Computer Fundamentals', 1, (SELECT id FROM courses WHERE course_code = 'BCA'), 100, 40),
('BCA102', 'Programming in C', 1, (SELECT id FROM courses WHERE course_code = 'BCA'), 100, 40),
('BCA103', 'Mathematics-I', 1, (SELECT id FROM courses WHERE course_code = 'BCA'), 100, 40),
('BCA104', 'Digital Electronics', 1, (SELECT id FROM courses WHERE course_code = 'BCA'), 100, 40),
('BCA105', 'Communication Skills', 1, (SELECT id FROM courses WHERE course_code = 'BCA'), 100, 40);

-- Table for question bank
CREATE TABLE IF NOT EXISTS question_bank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    difficulty_level ENUM('easy', 'medium', 'hard') NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (created_by) REFERENCES teachers(id)
);

-- Table for exams
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_code VARCHAR(20) UNIQUE NOT NULL,
    subject_id INT NOT NULL,
    exam_title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    passing_percentage DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (created_by) REFERENCES teachers(id)
);

-- Table for exam questions
CREATE TABLE IF NOT EXISTS exam_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (question_id) REFERENCES question_bank(id)
);

-- Table for student exam attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    total_marks_obtained DECIMAL(5,2),
    status ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table for student answers
CREATE TABLE IF NOT EXISTS student_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer CHAR(1),
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id),
    FOREIGN KEY (question_id) REFERENCES question_bank(id)
);

-- Create indexes for better performance
CREATE INDEX idx_exam_subject ON exams(subject_id);
CREATE INDEX idx_exam_active ON exams(is_active);
CREATE INDEX idx_attempt_status ON exam_attempts(status);
CREATE INDEX idx_attempt_student ON exam_attempts(student_id);
