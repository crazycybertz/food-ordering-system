// Admin Panel JavaScript
const ADMIN_API_BASE = 'http://localhost/food_ordering/backend/admin';

// Check admin authentication
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html?redirect=admin';
        return false;
    }
    return true;
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminAuth()) return;
    
    initializeSidebar();
    loadDashboardData();
    setupEventListeners();
    initializeCharts();
});

// Initialize sidebar navigation
function initializeSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-area > section');
    const pageTitle = document.getElementById('pageTitle');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (!targetSection) return;
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            targetSection.style.display = 'block';
            
            // Update page title
            if (pageTitle) {
                pageTitle.textContent = this.querySelector('span').textContent;
            }
        });
    });
    
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load recent orders
        const ordersResponse = await fetch(`${ADMIN_API_BASE}/orders/get_recent.php`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            if (ordersData.success) {
                populateRecentOrders(ordersData.orders);
            }
        }
        
        // Load products count
        const productsResponse = await fetch(`${ADMIN_API_BASE}/products/count.php`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            if (productsData.success) {
                updateStatsCard('products', productsData.count);
            }
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Populate recent orders table
function populateRecentOrders(orders) {
    const tableBody = document.getElementById('recentOrdersBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format date
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Status badge
        const statusClass = `status-${order.status}`;
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        
        row.innerHTML = `
            <td>#${order.order_number}</td>
            <td>${order.customer_name || 'Guest'}</td>
            <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${formattedDate}</td>
        `;
        
        // Add click event to view order details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            viewOrderDetails(order.id);
        });
        
        tableBody.appendChild(row);
    });
}

// Update stats card
function updateStatsCard(type, value) {
    const card = document.querySelector(`.stat-card:nth-child(${
        type === 'revenue' ? 1 :
        type === 'orders' ? 2 :
        type === 'products' ? 3 :
        type === 'customers' ? 4 : 1
    }) h2`);
    
    if (card) {
        if (type === 'revenue') {
            card.textContent = `$${parseFloat(value).toLocaleString()}`;
        } else {
            card.textContent = value.toLocaleString();
        }
    }
}

// Initialize charts
function initializeCharts() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductModal();
        });
    }
    
    // Product modal
    const productModal = document.getElementById('productModal');
    const productModalClose = document.getElementById('productModalClose');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    
    if (productModalClose) {
        productModalClose.addEventListener('click', () => {
            productModal.classList.remove('show');
        });
    }
    
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', () => {
            productModal.classList.remove('show');
        });
    }
    
    // Image preview
    const imageInput = document.getElementById('product_image');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const preview = document.getElementById('previewImage');
            const file = this.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Product form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch(`${ADMIN_API_BASE}/products/add.php`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Product added successfully', 'success');
                    productModal.classList.remove('show');
                    productForm.reset();
                    document.getElementById('previewImage').style.display = 'none';
                    
                    // Reload products if on products page
                    if (document.getElementById('products').style.display === 'block') {
                        loadProductsTable();
                    }
                } else {
                    throw new Error(data.error || 'Failed to add product');
                }
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
}

// Open product modal
function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    
    if (product) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        
        // Fill form with product data
        document.getElementById('product_name').value = product.name;
        document.getElementById('product_category').value = product.category_id;
        document.getElementById('product_description').value = product.description;
        document.getElementById('product_price').value = product.price;
        document.getElementById('product_stock').value = product.stock || '';
        document.getElementById('product_featured').checked = product.featured;
        document.getElementById('product_available').checked = product.available;
        
        if (product.image_url) {
            const preview = document.getElementById('previewImage');
            preview.src = product.image_url;
            preview.style.display = 'block';
        }
        
        // Update form action
        productForm.dataset.mode = 'edit';
        productForm.dataset.productId = product.id;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        document.getElementById('previewImage').style.display = 'none';
        productForm.dataset.mode = 'add';
    }
    
    modal.classList.add('show');
}

// Load products table
async function loadProductsTable() {
    try {
        const response = await fetch(`${ADMIN_API_BASE}/products/get_all.php`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        const tableBody = document.getElementById('productsTableBody');
        
        if (data.success && tableBody) {
            tableBody.innerHTML = '';
            
            data.products.forEach(product => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>
                        <img src="${product.image_url || 'assets/images/default-food.jpg'}" 
                             alt="${product.name}" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    </td>
                    <td>${product.name}</td>
                    <td>${product.category_name}</td>
                    <td>$${parseFloat(product.price).toFixed(2)}</td>
                    <td>
                        <span class="status-badge ${product.available ? 'status-completed' : 'status-cancelled'}">
                            ${product.available ? 'Available' : 'Unavailable'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-icon edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const response = await fetch(`${ADMIN_API_BASE}/products/get.php?id=${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        if (data.success) {
            openProductModal(data.product);
        }
    } catch (error) {
        showMessage('Failed to load product details', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${ADMIN_API_BASE}/products/delete.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Product deleted successfully', 'success');
            loadProductsTable();
        } else {
            throw new Error(data.error || 'Failed to delete product');
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${ADMIN_API_BASE}/orders/get.php?id=${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        const modal = document.getElementById('orderModal');
        const modalBody = modal.querySelector('.modal-body');
        
        if (data.success && modalBody) {
            const order = data.order;
            
            // Format date
            const orderDate = new Date(order.created_at);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Status options
            const statusOptions = ['pending', 'processing', 'completed', 'cancelled'];
            
            modalBody.innerHTML = `
                <div class="order-details">
                    <div class="order-header">
                        <div class="order-info">
                            <p><strong>Order Date:</strong> ${formattedDate}</p>
                            <p><strong>Customer:</strong> ${order.customer_name}</p>
                            <p><strong>Phone:</strong> ${order.phone}</p>
                            <p><strong>Email:</strong> ${order.customer_email}</p>
                        </div>
                        
                        <div class="order-status">
                            <label for="orderStatus">Status:</label>
                            <select id="orderStatus" class="status-select">
                                ${statusOptions.map(status => `
                                    <option value="${status}" ${order.status === status ? 'selected' : ''}>
                                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="order-items">
                        <h4>Order Items</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.product_name}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Delivery Fee</span>
                            <span>$2.99</span>
                        </div>
                        <div class="summary-row">
                            <span>Tax</span>
                            <span>$${(order.total_amount * 0.10).toFixed(2)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${(parseFloat(order.total_amount) + 2.99 + (order.total_amount * 0.10)).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-primary" onclick="updateOrderStatus(${order.id})">
                            Update Status
                        </button>
                        <button class="btn btn-outline" onclick="printOrder(${order.id})">
                            <i class="fas fa-print"></i> Print Invoice
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('orderId').textContent = order.order_number;
            modal.classList.add('show');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showMessage('Failed to load order details', 'error');
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById('orderStatus');
    const newStatus = statusSelect.value;
    
    try {
        const response = await fetch(`${ADMIN_API_BASE}/orders/update_status.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                order_id: orderId,
                status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Order status updated successfully', 'success');
            loadDashboardData(); // Refresh recent orders
            
            // Close modal after 1 second
            setTimeout(() => {
                document.getElementById('orderModal').classList.remove('show');
            }, 1000);
        } else {
            throw new Error(data.error || 'Failed to update order status');
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Print order invoice
function printOrder(orderId) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Invoice #${orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 1.2em; }
            </style>
        </head>
        <body>
            <div class="invoice-header">
                <h1>FoodHub</h1>
                <p>Order Invoice</p>
            </div>
            <p>Printing invoice for order #${orderId}...</p>
        </body>
        </html>
    `);
    
    // In a real app, you would load the actual order data here
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Show message
function showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4CAF50' : '#ff6b6b'};
        color: white;
        border-radius: 5px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Make functions available globally
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.printOrder = printOrder;