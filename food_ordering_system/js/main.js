// DOM Elements
const cartCountElement = document.getElementById('cart-count');
const featuredProductsContainer = document.getElementById('featured-products');

// API Base URL
const API_BASE_URL = 'http://localhost/food_ordering/backend/api';

// Load featured products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    updateCartCount();
});

// Load featured products from API
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/get_products.php?featured=true`);
        const data = await response.json();
        
        if (data.success && featuredProductsContainer) {
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products in grid
function displayProducts(products) {
    featuredProductsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        featuredProductsContainer.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.image_url || 'assets/images/default-food.jpg'}" 
             alt="${product.name}" 
             class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description.substring(0, 60)}...</p>
            <div class="product-footer">
                <span class="product-price">$${product.price}</span>
                <button class="btn btn-primary add-to-cart" 
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to Add to Cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', addToCart);
    
    return card;
}

// Add product to cart
function addToCart(event) {
    const button = event.target;
    const productId = button.getAttribute('data-product-id');
    const productName = button.getAttribute('data-product-name');
    const productPrice = parseFloat(button.getAttribute('data-product-price'));
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showMessage(`${productName} added to cart!`, 'success');
}

// Update cart count in navbar
function updateCartCount() {
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Show message to user
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

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check if user is logged in
function checkAuthStatus() {
    return localStorage.getItem('token') !== null;
}

// Redirect if not logged in
function requireAuth() {
    if (!checkAuthStatus()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect if not admin
function requireAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}