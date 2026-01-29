// Menu Page JavaScript
let currentPage = 1;
let itemsPerPage = 9;
let currentCategory = 'all';
let currentSort = 'popular';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateAuthUI();
});

// Load products from API
async function loadProducts() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const menuGrid = document.getElementById('menuGrid');
    
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (menuGrid) menuGrid.style.display = 'none';
    
    try {
        let url = `${API_BASE_URL}/products/get_products.php?`;
        
        // Add category filter
        if (currentCategory !== 'all') {
            url += `category=${currentCategory}&`;
        }
        
        // Add search term
        if (currentSearch) {
            url += `search=${encodeURIComponent(currentSearch)}&`;
        }
        
        // Add sorting
        url += `sort=${currentSort}&`;
        
        // Add pagination
        url += `page=${currentPage}&limit=${itemsPerPage}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.products);
            setupPagination(data.total, data.pages);
        } else {
            throw new Error(data.error || 'Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Failed to load products. Please try again.', 'error');
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (menuGrid) menuGrid.style.display = 'grid';
    }
}

// Display products in grid
function displayProducts(products) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    // Clear existing products
    menuGrid.innerHTML = '';
    
    if (products.length === 0) {
        menuGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-utensils" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
        return;
    }
    
    // Get template
    const template = document.getElementById('product-card-template');
    
    products.forEach(product => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.product-card');
        
        // Set data attributes
        card.setAttribute('data-id', product.id);
        card.setAttribute('data-category', product.category_id);
        
        // Fill template variables
        const elements = {
            '{{id}}': product.id,
            '{{category_id}}': product.category_id,
            '{{image_url}}': product.image_url || 'assets/images/default-food.jpg',
            '{{name}}': product.name,
            '{{description}}': product.description.substring(0, 80) + '...',
            '{{price}}': parseFloat(product.price).toFixed(2),
            '{{rating}}': product.rating || '4.5',
            '{{review_count}}': product.review_count || '0',
            '{{category_name}}': product.category_name || 'Food',
            '{{badge_text}}': product.featured ? 'Featured' : (product.available ? '' : 'Sold Out'),
            '{{badge_style}}': product.featured ? 'background: #ff6b6b;' : (!product.available ? 'background: #999;' : 'display: none;')
        };
        
        // Replace all placeholders
        let html = template.innerHTML;
        for (const [placeholder, value] of Object.entries(elements)) {
            html = html.replace(new RegExp(placeholder, 'g'), value);
        }
        
        card.innerHTML = html;
        
        // Add event listeners
        const addToCartBtn = card.querySelector('.add-to-cart');
        const quickViewBtn = card.querySelector('.quick-view-btn');
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const productName = this.getAttribute('data-product-name');
                const productPrice = parseFloat(this.getAttribute('data-product-price'));
                
                window.cartManager.addToCart(productId, productName, productPrice);
            });
        }
        
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                showQuickView(productId);
            });
        }
        
        menuGrid.appendChild(card);
    });
}

// Setup pagination
function setupPagination(totalItems, totalPages) {
    const pagination = document.getElementById('pagination');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (!pagination || !pageNumbers) return;
    
    // Show/hide pagination
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex';
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    // Show first page, last page, and pages around current
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstPage = createPageNumber(1);
        pageNumbers.appendChild(firstPage);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = createPageNumber(i);
        pageNumbers.appendChild(pageNumber);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastPage = createPageNumber(totalPages);
        pageNumbers.appendChild(lastPage);
    }
    
    // Update button states
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// Create page number element
function createPageNumber(page) {
    const span = document.createElement('span');
    span.className = 'page-number';
    if (page === currentPage) {
        span.className += ' active';
    }
    span.textContent = page;
    
    span.addEventListener('click', () => {
        if (page !== currentPage) {
            currentPage = page;
            loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    return span;
}

// Show quick view modal
async function showQuickView(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/get_product.php?id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            const modal = document.getElementById('quickViewModal');
            const modalBody = document.getElementById('modalBody');
            const template = document.getElementById('quick-view-template');
            
            if (!modal || !modalBody || !template) return;
            
            // Generate stars HTML
            const rating = parseFloat(product.rating) || 4.5;
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let starsHTML = '';
            
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    starsHTML += '<i class="fas fa-star"></i>';
                } else if (i === fullStars + 1 && hasHalfStar) {
                    starsHTML += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHTML += '<i class="far fa-star"></i>';
                }
            }
            
            // Fill template
            const elements = {
                '{{image_url}}': product.image_url || 'assets/images/default-food.jpg',
                '{{name}}': product.name,
                '{{description}}': product.description,
                '{{price}}': parseFloat(product.price).toFixed(2),
                '{{rating}}': rating.toFixed(1),
                '{{review_count}}': product.review_count || '0',
                '{{stars}}': starsHTML,
                '{{calories}}': product.calories || '350',
                '{{protein}}': product.protein || '15',
                '{{carbs}}': product.carbs || '45',
                '{{fat}}': product.fat || '12'
            };
            
            let html = template.innerHTML;
            for (const [placeholder, value] of Object.entries(elements)) {
                html = html.replace(new RegExp(placeholder, 'g'), value);
            }
            
            modalBody.innerHTML = html;
            
            // Add event listeners for modal
            const closeBtn = document.getElementById('modalClose');
            const addBtn = modalBody.querySelector('.btn-add');
            const minusBtn = modalBody.querySelector('.minus');
            const plusBtn = modalBody.querySelector('.plus');
            const qtyInput = modalBody.querySelector('.qty-input');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('show');
                });
            }
            
            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    const quantity = parseInt(qtyInput.value) || 1;
                    const productId = this.getAttribute('data-id');
                    const productName = product.name;
                    const productPrice = parseFloat(product.price);
                    
                    for (let i = 0; i < quantity; i++) {
                        window.cartManager.addToCart(productId, productName, productPrice);
                    }
                    
                    modal.classList.remove('show');
                });
            }
            
            if (minusBtn) {
                minusBtn.addEventListener('click', () => {
                    const current = parseInt(qtyInput.value) || 1;
                    if (current > 1) {
                        qtyInput.value = current - 1;
                    }
                });
            }
            
            if (plusBtn) {
                plusBtn.addEventListener('click', () => {
                    const current = parseInt(qtyInput.value) || 1;
                    if (current < 10) {
                        qtyInput.value = current + 1;
                    }
                });
            }
            
            // Show modal
            modal.classList.add('show');
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        showMessage('Failed to load product details', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current category and reload products
            currentCategory = this.getAttribute('data-category');
            currentPage = 1;
            loadProducts();
        });
    });
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1;
            loadProducts();
        });
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    function performSearch() {
        const term = searchInput.value.trim();
        if (term) {
            currentSearch = term;
            currentPage = 1;
            
            // Show search results
            if (searchResults) {
                searchResults.classList.add('show');
                document.getElementById('searchTerm').textContent = term;
            }
            
            loadProducts();
        }
    }
    
    function clearSearch() {
        currentSearch = '';
        searchInput.value = '';
        
        if (searchResults) {
            searchResults.classList.remove('show');
        }
        
        loadProducts();
    }
}

// Show message function
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