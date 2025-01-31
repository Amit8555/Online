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
    
    // Get available exams for BCA first semester
    $sql = "SELECT e.*, s.subject_name 
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
            )
            ORDER BY e.start_time";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id]);
    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($exams);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
