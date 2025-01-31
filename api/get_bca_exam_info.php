<?php
require_once '../database/db_config.php';
session_start();

header('Content-Type: application/json');

// Check if student is logged in
if (!isset($_SESSION['student_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Please log in to view exam information'
    ]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get BCA first semester subjects with exam status
    $stmt = $pdo->prepare("
        SELECT 
            s.subject_id,
            s.subject_code,
            s.subject_name,
            CASE 
                WHEN e.exam_id IS NOT NULL 
                AND e.status = 'active' 
                AND e.start_time <= NOW() 
                AND e.end_time >= NOW() 
                AND NOT EXISTS (
                    SELECT 1 FROM exam_attempts ea 
                    WHERE ea.exam_id = e.exam_id 
                    AND ea.student_id = ?
                ) THEN 1
                ELSE 0
            END as has_active_exam
        FROM subjects s
        LEFT JOIN exams e ON s.subject_id = e.subject_id
        WHERE s.semester = 1
        AND s.course_id = (SELECT course_id FROM courses WHERE course_code = 'BCA')
    ");
    
    $stmt->execute([$_SESSION['student_id']]);
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get next upcoming exam
    $stmt = $pdo->prepare("
        SELECT e.*, s.subject_name
        FROM exams e
        JOIN subjects s ON e.subject_id = s.subject_id
        WHERE s.semester = 1
        AND s.course_id = (SELECT course_id FROM courses WHERE course_code = 'BCA')
        AND e.status = 'active'
        AND e.start_time > NOW()
        AND NOT EXISTS (
            SELECT 1 FROM exam_attempts ea
            WHERE ea.exam_id = e.exam_id
            AND ea.student_id = ?
        )
        ORDER BY e.start_time ASC
        LIMIT 1
    ");
    
    $stmt->execute([$_SESSION['student_id']]);
    $nextExam = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get count of upcoming exams
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM exams e
        JOIN subjects s ON e.subject_id = s.subject_id
        WHERE s.semester = 1
        AND s.course_id = (SELECT course_id FROM courses WHERE course_code = 'BCA')
        AND e.status = 'active'
        AND e.start_time > NOW()
        AND NOT EXISTS (
            SELECT 1 FROM exam_attempts ea
            WHERE ea.exam_id = e.exam_id
            AND ea.student_id = ?
        )
    ");
    
    $stmt->execute([$_SESSION['student_id']]);
    $upcomingCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Check for active exam
    $stmt = $pdo->prepare("
        SELECT e.*, s.subject_name
        FROM exams e
        JOIN subjects s ON e.subject_id = s.subject_id
        WHERE s.semester = 1
        AND s.course_id = (SELECT course_id FROM courses WHERE course_code = 'BCA')
        AND e.status = 'active'
        AND e.start_time <= NOW()
        AND e.end_time >= NOW()
        AND NOT EXISTS (
            SELECT 1 FROM exam_attempts ea
            WHERE ea.exam_id = e.exam_id
            AND ea.student_id = ?
        )
        LIMIT 1
    ");
    
    $stmt->execute([$_SESSION['student_id']]);
    $activeExam = $stmt->fetch(PDO::FETCH_ASSOC);

    // Prepare response
    $response = [
        'success' => true,
        'subjects' => array_map(function($subject) {
            return [
                'code' => $subject['subject_code'],
                'name' => $subject['subject_name'],
                'hasExam' => $subject['has_active_exam'] == 1
            ];
        }, $subjects),
        'nextExam' => $nextExam ? [
            'subject_name' => $nextExam['subject_name'],
            'start_time' => $nextExam['start_time'],
            'duration_minutes' => $nextExam['duration_minutes']
        ] : null,
        'upcomingCount' => intval($upcomingCount),
        'activeExam' => $activeExam ? [
            'id' => $activeExam['exam_id'],
            'subject_name' => $activeExam['subject_name'],
            'end_time' => $activeExam['end_time']
        ] : null
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
