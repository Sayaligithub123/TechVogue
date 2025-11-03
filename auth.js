// Authentication JavaScript

// Initialize role selection cards
document.addEventListener('DOMContentLoaded', function() {
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            roleCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Save current user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Redirect based on role
        redirectToDashboard(user.role);
    } else {
        errorDiv.textContent = 'Invalid email or password';
        errorDiv.style.display = 'block';
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('signupError');
    
    const role = document.querySelector('input[name="role"]:checked')?.value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!role) {
        errorDiv.textContent = 'Please select a role';
        errorDiv.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.style.display = 'block';
        return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        errorDiv.textContent = 'Email already registered';
        errorDiv.style.display = 'block';
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redirect to dashboard
    redirectToDashboard(role);
}

// Redirect to appropriate dashboard
function redirectToDashboard(role) {
    switch(role) {
        case 'entrepreneur':
            window.location.href = '../pages/entrepreneur.html';
            break;
        case 'investor':
            window.location.href = '../pages/investor.html';
            break;
        case 'freelancer':
            window.location.href = '../pages/freelancer.html';
            break;
        default:
            window.location.href = '../index.html';
    }
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '../pages/login.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

