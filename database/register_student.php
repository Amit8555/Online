<?php
require_once 'db_config.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Validate and sanitize input
    $full_name = filter_var($_POST['fullName'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $phone = filter_var($_POST['phone'], FILTER_SANITIZE_STRING);
    $date_of_birth = $_POST['dob'];
    $gender = filter_var($_POST['gender'], FILTER_SANITIZE_STRING);
    $category = filter_var($_POST['category'], FILTER_SANITIZE_STRING);
    $aadhaar_number = filter_var($_POST['aadhaar'], FILTER_SANITIZE_STRING);
    $address = filter_var($_POST['address'], FILTER_SANITIZE_STRING);
    $city = filter_var($_POST['city'], FILTER_SANITIZE_STRING);
    $state = filter_var($_POST['state'], FILTER_SANITIZE_STRING);
    $pincode = filter_var($_POST['pincode'], FILTER_SANITIZE_STRING);
    $course = filter_var($_POST['course'], FILTER_SANITIZE_STRING);
    $batch_timing = filter_var($_POST['batch'], FILTER_SANITIZE_STRING);
    $last_exam = filter_var($_POST['lastExam'], FILTER_SANITIZE_STRING);
    $percentage = filter_var($_POST['percentage'], FILTER_VALIDATE_FLOAT);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Generate student ID
    $year = date('Y');
    $random = mt_rand(1000, 9999);
    $student_id = "STU{$year}{$random}";

    // Handle file uploads
    $upload_dir = '../uploads/students/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Process photo
    $photo_path = handleFileUpload('photo', $upload_dir, ['jpg', 'jpeg', 'png']);
    
    // Process marksheet
    $marksheet_path = handleFileUpload('marksheet', $upload_dir, ['pdf']);

    // Insert into database
    $sql = "INSERT INTO students (student_id, full_name, email, phone, date_of_birth, 
            gender, category, aadhaar_number, address, city, state, pincode, 
            course, batch_timing, last_exam, percentage, photo_path, marksheet_path, password) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $student_id,
        $full_name,
        $email,
        $phone,
        $date_of_birth,
        $gender,
        $category,
        $aadhaar_number,
        $address,
        $city,
        $state,
        $pincode,
        $course,
        $batch_timing,
        $last_exam,
        $percentage,
        $photo_path,
        $marksheet_path,
        $password
    ]);

    // Update batch count
    $sql = "UPDATE batches b 
            JOIN courses c ON b.course_id = c.id 
            SET b.current_students = b.current_students + 1 
            WHERE c.course_code = ? AND b.batch_time = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$course, $batch_timing]);

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'student_id' => $student_id
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
