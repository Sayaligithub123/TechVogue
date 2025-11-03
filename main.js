// Main JavaScript for navigation and shared functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on dashboard pages
    const dashboardPages = ['entrepreneur.html', 'investor.html', 'freelancer.html', 'admin.html', 'chat.html', 'analytics.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (dashboardPages.includes(currentPage)) {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = '../pages/login.html';
        }
    }

    // Initialize navigation
    initNavigation();
    initTheme();
    initSmoothScroll();
    initCounters();
    initCarousel();
});

// Initialize navigation menu
function initNavigation() {
    // Update active nav links
    const navLinks = document.querySelectorAll('.nav-menu a, .sidebar-menu a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// Theme toggle (dark/light)
function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.classList.add('dark-theme');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Smooth scroll for same-page links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id.length > 1) {
                e.preventDefault();
                document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Animated counters
function initCounters() {
    const els = document.querySelectorAll('.stat-value[data-target]');
    const ease = t => 1 - Math.pow(1 - t, 3);
    els.forEach(el => {
        const target = Number(el.dataset.target || '0');
        const format = el.dataset.format || '';
        const duration = 1500; const t0 = performance.now();
        function step(now) {
            const p = Math.min(1, (now - t0) / duration);
            let val = Math.round(ease(p) * target);
            if (format === 'currency-inr') {
                el.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
            } else {
                el.textContent = val.toLocaleString();
            }
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}

// Featured carousel
let carouselIndex = 0; let carouselTimer;
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    fetchDummy().then(data => {
        const slides = (data.startups || []).slice(0, 5).map(s => {
            return `
                <div class=\"slide\">
                    <div>
                        <div class=\"slide-title\">${s.startup}</div>
                        <div class=\"slide-summary\">${s.summary || ''}</div>
                        <div style=\"margin-top: 1rem; color: var(--text-light);\"><strong>Domain:</strong> ${s.domain} · <strong>Stage:</strong> ${s.fundingStage}</div>
                        <div class=\"progress-bar-container\" style=\"margin-top: 1rem;\">
                            <div class=\"progress-bar\" style=\"width: ${Math.min((s.raised / s.target) * 100, 100)}%\">${Math.round((s.raised / s.target) * 100)}%</div>
                        </div>
                    </div>
                    <div style=\"text-align:center;\">
                        <img src=\"assets/images/placeholder.png\" alt=\"${s.startup}\" style=\"max-width:100%; border-radius: 12px; box-shadow: var(--shadow-lg);\">
                    </div>
                </div>`;
        }).join('');
        track.innerHTML = slides;
        const prev = document.getElementById('carouselPrev');
        const next = document.getElementById('carouselNext');
        prev?.addEventListener('click', () => moveCarousel(-1));
        next?.addEventListener('click', () => moveCarousel(1));
        startCarousel();
    });
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const total = track.children.length;
    carouselIndex = (carouselIndex + direction + total) % total;
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;
    restartCarousel();
}

function startCarousel() { carouselTimer = setInterval(() => moveCarousel(1), 4000); }
function restartCarousel() { clearInterval(carouselTimer); startCarousel(); }

// Dummy data preload
async function fetchDummy() {
    try {
        // No bundled dummy data
        return { startups: [], users: [] };
    } catch {
        return { startups: [], users: [] };
    }
}

// Clear demo/local data helper (run manually if needed)
function clearAllDemoData() {
    const keys = [
        'users','usersSeeded','currentUser','entrepreneurProfiles','milestones','investorFeedback',
        'teamMembers','fundedStartups','freelancerApplications','eventRegistrations','messages',
        'startupApprovals','activityLogs','freelancerProfiles'
    ];
    keys.forEach(k => localStorage.removeItem(k));
}
window.clearAllDemoData = clearAllDemoData;

// Utility function to get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Utility function to show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations if not already present
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

