<?php
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

// Get query parameters
$category = $_GET['category'] ?? 'all';
$search = $_GET['search'] ?? '';
$sort = $_GET['sort'] ?? 'popular';
$page = $_GET['page'] ?? 1;
$limit = $_GET['limit'] ?? 9;
$featured = $_GET['featured'] ?? false;

// Calculate offset for pagination
$offset = ($page - 1) * $limit;

// Build query
$query = "SELECT p.*, c.name as category_name, 
                 COALESCE(AVG(r.rating), 4.5) as rating,
                 COUNT(r.id) as review_count
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN reviews r ON p.id = r.product_id
          WHERE 1=1";

$params = [];

// Add category filter
if ($category !== 'all') {
    $query .= " AND p.category_id = :category";
    $params[':category'] = $category;
}

// Add search filter
if (!empty($search)) {
    $query .= " AND (p.name LIKE :search OR p.description LIKE :search)";
    $params[':search'] = "%$search%";
}

// Add featured filter
if ($featured) {
    $query .= " AND p.featured = 1";
}

// Add availability filter
$query .= " AND p.available = 1";

// Group by product
$query .= " GROUP BY p.id";

// Add sorting
switch ($sort) {
    case 'price-low':
        $query .= " ORDER BY p.price ASC";
        break;
    case 'price-high':
        $query .= " ORDER BY p.price DESC";
        break;
    case 'name':
        $query .= " ORDER BY p.name ASC";
        break;
    case 'newest':
        $query .= " ORDER BY p.created_at DESC";
        break;
    case 'popular':
    default:
        $query .= " ORDER BY rating DESC";
        break;
}

// Add pagination
$query .= " LIMIT :limit OFFSET :offset";

try {
    // Get total count for pagination
    $countQuery = strstr($query, 'GROUP BY', true);
    if ($countQuery === false) {
        $countQuery = $query;
    }
    $countQuery = "SELECT COUNT(*) as total FROM ($countQuery) as temp";
    
    $stmt = $db->prepare($countQuery);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get products
    $stmt = $db->prepare($query);
    
    // Bind all parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate total pages
    $totalPages = ceil($total / $limit);
    
    json_response([
        'success' => true,
        'products' => $products,
        'total' => $total,
        'pages' => $totalPages,
        'current_page' => $page
    ]);
    
} catch(PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>