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
if (empty($data['email']) || empty($data['password'])) {
    json_response(['error' => 'Email and password are required'], 400);
}

$email = sanitize_input($data['email']);
$password = $data['password'];

// Database connection
$database = new Database();
$db = $database->getConnection();

// Check if user exists
$query = "SELECT id, username, email, password_hash, role, full_name FROM users WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    json_response(['error' => 'Invalid email or password'], 401);
}

$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    json_response(['error' => 'Invalid email or password'], 401);
}

// Set session variables
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['email'] = $user['email'];
$_SESSION['role'] = $user['role'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['logged_in'] = true;

// Update last login
$update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
$update_stmt = $db->prepare($update_query);
$update_stmt->bindParam(':id', $user['id']);
$update_stmt->execute();

// Remove password hash from response
unset($user['password_hash']);

json_response([
    'success' => true,
    'message' => 'Login successful',
    'user' => $user
]);
?>