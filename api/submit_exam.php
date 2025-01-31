<?php
require_once '../database/db_config.php';

header('Content-Type: application/json');

try {
    // Get student ID from session
    session_start();
    if (!isset($_SESSION['student_id']) || !isset($_SESSION['current_attempt_id'])) {
        throw new Exception('Not authenticated or no active exam');
    }
    
    $student_id = $_SESSION['student_id'];
    $attempt_id = $_SESSION['current_attempt_id'];
    
    // Get submission data
    $data = json_decode(file_get_contents('php://input'), true);
    $answers = $data['answers'];
    $time_taken = $data['time_taken'];
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Get exam attempt details
    $sql = "SELECT ea.*, e.total_marks, e.passing_percentage 
            FROM exam_attempts ea
            JOIN exams e ON ea.exam_id = e.id
            WHERE ea.id = ? AND ea.student_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$attempt_id, $student_id]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$attempt || $attempt['status'] !== 'in_progress') {
        throw new Exception('Invalid exam attempt');
    }
    
    // Get questions and correct answers
    $sql = "SELECT q.*, eq.marks 
            FROM exam_questions eq
            JOIN question_bank q ON eq.question_id = q.id
            WHERE eq.exam_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$attempt['exam_id']]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate results
    $total_score = 0;
    $score_obtained = 0;
    $correct_answers = 0;
    $wrong_answers = 0;
    $questions_attempted = count($answers);
    
    foreach ($questions as $index => $question) {
        $total_score += $question['marks'];
        
        if (isset($answers[$index])) {
            // Save student's answer
            $sql = "INSERT INTO student_answers 
                    (attempt_id, question_id, selected_answer) 
                    VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $attempt_id,
                $question['id'],
                $answers[$index]
            ]);
            
            // Calculate score
            if ($answers[$index] === $question['correct_answer']) {
                $score_obtained += $question['marks'];
                $correct_answers++;
            } else {
                $wrong_answers++;
            }
        }
    }
    
    // Calculate percentage
    $percentage = ($score_obtained / $total_score) * 100;
    $passed = $percentage >= $attempt['passing_percentage'];
    
    // Update exam attempt
    $sql = "UPDATE exam_attempts 
            SET status = 'completed',
                end_time = NOW(),
                total_marks_obtained = ?
            WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$score_obtained, $attempt_id]);
    
    // Clear session exam data
    unset($_SESSION['current_attempt_id']);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'results' => [
            'score_obtained' => $score_obtained,
            'total_score' => $total_score,
            'percentage' => round($percentage, 2),
            'passed' => $passed,
            'correct_answers' => $correct_answers,
            'wrong_answers' => $wrong_answers,
            'questions_attempted' => $questions_attempted,
            'time_taken' => $time_taken
        ]
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
