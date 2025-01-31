<?php
require_once '../database/db_config.php';
session_start();

header('Content-Type: application/json');

// Check if student is logged in
if (!isset($_SESSION['student_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Please log in to check exams'
    ]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get active exam for BCA first semester
    $stmt = $pdo->prepare("
        SELECT e.*, s.subject_name, s.subject_code
        FROM exams e
        JOIN subjects s ON e.subject_id = s.subject_id
        JOIN student_courses sc ON s.subject_id = sc.subject_id
        WHERE sc.student_id = ?
        AND s.semester = 1
        AND s.course_id = (SELECT course_id FROM courses WHERE course_code = 'BCA')
        AND e.status = 'active'
        AND e.start_time <= NOW()
        AND e.end_time >= NOW()
        AND NOT EXISTS (
            SELECT 1 FROM exam_attempts ea
            WHERE ea.student_id = sc.student_id
            AND ea.exam_id = e.exam_id
        )
        ORDER BY e.start_time ASC
        LIMIT 1
    ");
    
    $stmt->execute([$_SESSION['student_id']]);
    $activeExam = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($activeExam) {
        echo json_encode([
            'success' => true,
            'activeExam' => [
                'id' => $activeExam['exam_id'],
                'title' => $activeExam['exam_name'],
                'subject' => $activeExam['subject_name'],
                'subject_code' => $activeExam['subject_code'],
                'duration' => $activeExam['duration_minutes'],
                'start_time' => $activeExam['start_time'],
                'end_time' => $activeExam['end_time']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'activeExam' => null
        ]);
    }

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
