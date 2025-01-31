<?php
require_once '../database/db_config.php';

header('Content-Type: application/json');

try {
    // Get student ID from session
    session_start();
    if (!isset($_SESSION['student_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $student_id = $_SESSION['student_id'];
    
    // Get available exams count
    $sql = "SELECT COUNT(*) as available
            FROM exams e
            JOIN subjects s ON e.subject_id = s.id
            WHERE s.semester = 1 
            AND s.course_id = (SELECT id FROM courses WHERE course_code = 'BCA')
            AND e.is_active = true
            AND e.start_time <= NOW()
            AND e.end_time >= NOW()
            AND NOT EXISTS (
                SELECT 1 FROM exam_attempts a 
                WHERE a.exam_id = e.id 
                AND a.student_id = ?
                AND a.status = 'completed'
            )";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id]);
    $available = $stmt->fetch(PDO::FETCH_ASSOC)['available'];
    
    // Get completed exams count
    $sql = "SELECT COUNT(*) as completed
            FROM exam_attempts ea
            JOIN exams e ON ea.exam_id = e.id
            JOIN subjects s ON e.subject_id = s.id
            WHERE s.semester = 1 
            AND s.course_id = (SELECT id FROM courses WHERE course_code = 'BCA')
            AND ea.student_id = ?
            AND ea.status = 'completed'";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id]);
    $completed = $stmt->fetch(PDO::FETCH_ASSOC)['completed'];
    
    echo json_encode([
        'success' => true,
        'available' => (int)$available,
        'completed' => (int)$completed
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
