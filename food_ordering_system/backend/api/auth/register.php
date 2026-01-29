<?php
session_start();
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Invalid request method'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$required_fields = ['username', 'email', 'password', 'full_name'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        json_response(['error' => "$field is required"], 400);
    }
}

$username = sanitize_input($data['username']);
$email = sanitize_input($data['email']);
$password = $data['password'];
$full_name = sanitize_input($data['full_name']);

// Validate email
if (!validate_email($email)) {
    json_response(['error' => 'Invalid email format'], 400);
}

// Validate password strength
if (strlen($password) < 6) {
    json_response(['error' => 'Password must be at least 6 characters'], 400);
}

// Check if user already exists
$database = new Database();
$db = $database->getConnection();

$check_query = "SELECT id FROM users WHERE email = :email OR username = :username";
$stmt = $db->prepare($check_query);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':username', $username);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    json_response(['error' => 'User already exists'], 400);
}

// Hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$query = "INSERT INTO users (username, email, password_hash, full_name, role) 
          VALUES (:username, :email, :password_hash, :full_name, 'customer')";
$stmt = $db->prepare($query);
$stmt->bindParam(':username', $username);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':password_hash', $password_hash);
$stmt->bindParam(':full_name', $full_name);

if ($stmt->execute()) {
    $user_id = $db->lastInsertId();
    
    // Set session
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;
    $_SESSION['role'] = 'customer';
    $_SESSION['email'] = $email;
    
    json_response([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'id' => $user_id,
            'username' => $username,
            'email' => $email,
            'role' => 'customer'
        ]
    ], 201);
} else {
    json_response(['error' => 'Registration failed'], 500);
}
?>