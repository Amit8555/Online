<?php
require_once '../database/db_config.php';
session_start();

header('Content-Type: application/json');

// Check if student is logged in
if (!isset($_SESSION['student_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Please log in to access the exam'
    ]);
    exit;
}

// Get exam ID from request
$examId = isset($_GET['exam_id']) ? intval($_GET['exam_id']) : 0;

if ($examId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid exam ID'
    ]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if exam exists and is active
    $stmt = $pdo->prepare("
        SELECT e.*, s.subject_name, s.subject_code 
        FROM exams e
        JOIN subjects s ON e.subject_id = s.subject_id
        WHERE e.exam_id = ? AND e.status = 'active'
        AND e.start_time <= NOW() AND e.end_time >= NOW()
    ");
    $stmt->execute([$examId]);
    $exam = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$exam) {
        echo json_encode([
            'success' => false,
            'message' => 'Exam not found or not active'
        ]);
        exit;
    }

    // Check if student is enrolled in the course
    $stmt = $pdo->prepare("
        SELECT * FROM student_courses
        WHERE student_id = ? AND subject_id = ?
    ");
    $stmt->execute([$_SESSION['student_id'], $exam['subject_id']]);
    
    if (!$stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'You are not enrolled in this course'
        ]);
        exit;
    }

    // Check if student has already attempted the exam
    $stmt = $pdo->prepare("
        SELECT * FROM exam_attempts
        WHERE student_id = ? AND exam_id = ?
    ");
    $stmt->execute([$_SESSION['student_id'], $examId]);
    
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'You have already attempted this exam'
        ]);
        exit;
    }

    // Get exam questions
    $stmt = $pdo->prepare("
        SELECT q.*, GROUP_CONCAT(o.option_text ORDER BY o.option_order) as options
        FROM questions q
        LEFT JOIN question_options o ON q.question_id = o.question_id
        WHERE q.exam_id = ?
        GROUP BY q.question_id
        ORDER BY q.question_order
    ");
    $stmt->execute([$examId]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process questions and options
    foreach ($questions as &$question) {
        $question['options'] = explode(',', $question['options']);
        // Remove correct answer from response
        unset($question['correct_answer']);
    }

    // Create exam attempt record
    $stmt = $pdo->prepare("
        INSERT INTO exam_attempts (student_id, exam_id, start_time)
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$_SESSION['student_id'], $examId]);
    $attemptId = $pdo->lastInsertId();

    // Prepare response
    $response = [
        'success' => true,
        'title' => $exam['exam_name'],
        'subject_code' => $exam['subject_code'],
        'subject_name' => $exam['subject_name'],
        'duration_minutes' => $exam['duration_minutes'],
        'total_marks' => $exam['total_marks'],
        'passing_percentage' => $exam['passing_percentage'],
        'start_time' => $exam['start_time'],
        'end_time' => $exam['end_time'],
        'attempt_id' => $attemptId,
        'questions' => $questions
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
