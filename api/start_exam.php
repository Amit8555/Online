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
    
    // Get exam code from request
    $data = json_decode(file_get_contents('php://input'), true);
    $exam_code = $data['exam_code'];
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Get exam details
    $sql = "SELECT * FROM exams WHERE exam_code = ? AND is_active = true";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$exam_code]);
    $exam = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$exam) {
        throw new Exception('Exam not found or inactive');
    }
    
    // Check if student already attempted this exam
    $sql = "SELECT * FROM exam_attempts 
            WHERE exam_id = ? AND student_id = ? AND status = 'completed'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$exam['id'], $student_id]);
    if ($stmt->rowCount() > 0) {
        throw new Exception('You have already completed this exam');
    }
    
    // Create exam attempt
    $sql = "INSERT INTO exam_attempts (exam_id, student_id, start_time, status) 
            VALUES (?, ?, NOW(), 'in_progress')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$exam['id'], $student_id]);
    $attempt_id = $pdo->lastInsertId();
    
    // Get questions for the exam
    $sql = "SELECT q.*, eq.marks 
            FROM exam_questions eq
            JOIN question_bank q ON eq.question_id = q.id
            WHERE eq.exam_id = ?
            ORDER BY RAND()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$exam['id']]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Remove correct answers from questions
    foreach ($questions as &$question) {
        unset($question['correct_answer']);
    }
    
    $pdo->commit();
    
    // Store attempt ID in session
    $_SESSION['current_attempt_id'] = $attempt_id;
    
    echo json_encode([
        'success' => true,
        'questions' => $questions
    ]);
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
