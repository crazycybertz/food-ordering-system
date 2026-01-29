// Authentication JavaScript
const API_BASE_URL = 'http://localhost/food_ordering/backend/api';

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        return JSON.parse(user);
    }
    return null;
}

// Update UI based on auth status
function updateAuthUI() {
    const user = checkAuth();
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.getElementById('userName');
    
    if (user) {
        // Hide auth buttons, show user menu
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = user.username || 'Account';
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Toggle dropdown
        const userBtn = document.getElementById('userBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (userBtn && dropdownMenu) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
    } else {
        // Show auth buttons, hide user menu
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Login Function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data
            localStorage.setItem('token', data.token || 'dummy_token');
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message
            showMessage('Login successful!', 'success');
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
            return data;
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        throw error;
    }
}

// Registration Function
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data
            localStorage.setItem('token', data.token || 'dummy_token');
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message
            showMessage('Registration successful!', 'success');
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
            return data;
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        throw error;
    }
}

// Logout Function
function logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show message
    showMessage('Logged out successfully', 'success');
    
    // Redirect to home
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Password Strength Checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch(strength) {
        case 0:
        case 1:
            return { strength: 1, text: 'Weak', color: '#ff4444' };
        case 2:
            return { strength: 2, text: 'Fair', color: '#ffbb33' };
        case 3:
            return { strength: 3, text: 'Good', color: '#00C851' };
        case 4:
            return { strength: 4, text: 'Strong', color: '#007E33' };
    }
}

// Toggle Password Visibility
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target') || 'password';
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Form Validation
function validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        
        if (rule.required && !value) {
            errors[field] = 'This field is required';
            continue;
        }
        
        if (rule.email && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors[field] = 'Please enter a valid email address';
            }
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `Must be at least ${rule.minLength} characters`;
        }
        
        if (rule.match && value !== formData[rule.match]) {
            errors[field] = 'Passwords do not match';
        }
    }
    
    return errors;
}

// Show Message Function
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Add styles
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 5px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;
    
    container.innerHTML = '';
    container.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 500);
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    setupPasswordToggle();
    
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginText = document.getElementById('loginText');
            const loginLoading = document.getElementById('loginLoading');
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
            });
            
            // Validate
            const errors = validateForm(
                { email, password },
                {
                    email: { required: true, email: true },
                    password: { required: true, minLength: 6 }
                }
            );
            
            if (Object.keys(errors).length > 0) {
                for (const [field, error] of Object.entries(errors)) {
                    const errorElement = document.getElementById(`${field}-error`);
                    if (errorElement) {
                        errorElement.textContent = error;
                    }
                }
                return;
            }
            
            // Show loading
            loginText.style.display = 'none';
            loginLoading.style.display = 'inline';
            loginBtn.disabled = true;
            
            try {
                await login(email, password);
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                // Hide loading
                loginText.style.display = 'inline';
                loginLoading.style.display = 'none';
                loginBtn.disabled = false;
            }
        });
    }
    
    // Registration Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Password strength checker
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const strength = checkPasswordStrength(this.value);
                const fill = document.getElementById('strength-fill');
                const text = document.getElementById('strength-text');
                
                if (fill && text) {
                    fill.style.width = `${strength.strength * 25}%`;
                    fill.style.background = strength.color;
                    text.textContent = strength.text;
                    text.style.color = strength.color;
                }
            });
        }
        
        // Confirm password validation
        const confirmInput = document.getElementById('confirm_password');
        if (confirmInput) {
            confirmInput.addEventListener('input', function() {
                const password = document.getElementById('password').value;
                const confirm = this.value;
                const errorElement = document.getElementById('confirm-error');
                
                if (password !== confirm) {
                    errorElement.textContent = 'Passwords do not match';
                } else {
                    errorElement.textContent = '';
                }
            });
        }
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirm_password: document.getElementById('confirm_password').value,
                full_name: document.getElementById('full_name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                terms: document.getElementById('terms').checked
            };
            
            const registerBtn = document.getElementById('registerBtn');
            const registerText = document.getElementById('registerText');
            const registerLoading = document.getElementById('registerLoading');
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
            });
            
            // Validate
            const errors = validateForm(
                formData,
                {
                    username: { required: true, minLength: 3 },
                    email: { required: true, email: true },
                    password: { required: true, minLength: 6 },
                    confirm_password: { required: true, match: 'password' },
                    full_name: { required: true, minLength: 2 },
                    terms: { required: true }
                }
            );
            
            if (!formData.terms) {
                errors.terms = 'You must agree to the terms and conditions';
            }
            
            if (Object.keys(errors).length > 0) {
                for (const [field, error] of Object.entries(errors)) {
                    const errorElement = document.getElementById(`${field}-error`);
                    if (errorElement) {
                        errorElement.textContent = error;
                    }
                }
                return;
            }
            
            // Show loading
            registerText.style.display = 'none';
            registerLoading.style.display = 'inline';
            registerBtn.disabled = true;
            
            try {
                // Remove confirm_password from data sent to server
                const { confirm_password, terms, ...userData } = formData;
                await register(userData);
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                // Hide loading
                registerText.style.display = 'inline';
                registerLoading.style.display = 'none';
                registerBtn.disabled = false;
            }
        });
    }
});