<?php
require_once 'db_config.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Validate and sanitize input
    $full_name = filter_var($_POST['teacherName'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['teacherEmail'], FILTER_SANITIZE_EMAIL);
    $phone = filter_var($_POST['teacherPhone'], FILTER_SANITIZE_STRING);
    $date_of_birth = $_POST['teacherDOB'];
    $qualification = filter_var($_POST['qualification'], FILTER_SANITIZE_STRING);
    $specialization = filter_var($_POST['specialization'], FILTER_SANITIZE_STRING);
    $experience = filter_var($_POST['experience'], FILTER_VALIDATE_INT);
    $password = password_hash($_POST['newPassword'], PASSWORD_DEFAULT);

    // Generate teacher ID
    $year = date('Y');
    $random = mt_rand(1000, 9999);
    $teacher_id = "TCH{$year}{$random}";

    // Handle file uploads
    $upload_dir = '../uploads/teachers/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Process resume
    $resume_path = handleFileUpload('resume', $upload_dir, ['pdf']);
    
    // Process certificate
    $certificate_path = handleFileUpload('certificate', $upload_dir, ['pdf']);

    // Insert into database
    $sql = "INSERT INTO teachers (teacher_id, full_name, email, phone, date_of_birth, 
            qualification, specialization, experience, resume_path, certificate_path, password) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $teacher_id,
        $full_name,
        $email,
        $phone,
        $date_of_birth,
        $qualification,
        $specialization,
        $experience,
        $resume_path,
        $certificate_path,
        $password
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'teacher_id' => $teacher_id
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function handleFileUpload($file_key, $upload_dir, $allowed_extensions) {
    if (!isset($_FILES[$file_key])) {
        throw new Exception("No file uploaded for {$file_key}");
    }

    $file = $_FILES[$file_key];
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($file_extension, $allowed_extensions)) {
        throw new Exception("Invalid file type for {$file_key}");
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
        throw new Exception("File size too large for {$file_key}");
    }

    $file_name = uniqid() . '.' . $file_extension;
    $file_path = $upload_dir . $file_name;

    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        throw new Exception("Failed to upload {$file_key}");
    }

    return $file_path;
}
?>
