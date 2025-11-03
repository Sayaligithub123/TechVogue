// Investor Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user || user.role !== 'investor') {
        window.location.href = '../pages/login.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    
    loadStartups();
    loadFundedStartups();
    updateStats();

    document.getElementById('searchInput').addEventListener('input', loadStartups);
    document.getElementById('categoryFilter').addEventListener('change', loadStartups);
    document.getElementById('stageFilter').addEventListener('change', loadStartups);
});

function loadStartups() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const stage = document.getElementById('stageFilter').value;
    
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    let filtered = profiles.filter(p => !category || p.domain === category);
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.startupName?.toLowerCase().includes(searchTerm) ||
            p.ideaSummary?.toLowerCase().includes(searchTerm)
        );
    }

    const listEl = document.getElementById('startupsList');
    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No startups found.</p>';
        return;
    }

    listEl.innerHTML = filtered.map(profile => {
        const entrepreneur = users.find(u => u.id === profile.userId);
        const userMilestones = milestones.filter(m => m.userId === profile.userId);
        const isFunded = isStartupFunded(profile.userId);
        
        return `
            <div style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
                <h3>${profile.startupName || 'Unnamed Startup'}</h3>
                <p><strong>Domain:</strong> ${profile.domain || 'N/A'}</p>
                <p><strong>Entrepreneur:</strong> ${entrepreneur?.name || 'N/A'}</p>
                <p><strong>Milestones:</strong> ${userMilestones.length}</p>
                <p style="margin: 1rem 0;">${profile.ideaSummary || 'No description available.'}</p>
                ${!isFunded ? `
                    <button class="btn-primary btn-small" onclick="viewStartupDetails('${profile.userId}')">View Details</button>
                    <button class="btn-secondary btn-small" onclick="expressInterest('${profile.userId}')">Express Interest</button>
                ` : '<span style="color: var(--secondary-color);">✓ Funded</span>'}
            </div>
        `;
    }).join('');
}

function viewStartupDetails(userId) {
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    const profile = profiles.find(p => p.userId === userId);
    const userMilestones = milestones.filter(m => m.userId === userId);

    const details = `
Startup: ${profile?.startupName || 'N/A'}
Domain: ${profile?.domain || 'N/A'}
Description: ${profile?.ideaSummary || 'N/A'}
Milestones: ${userMilestones.map(m => `${formatDate(m.date)}: ${m.description}`).join('\n')}
    `;
    
    alert(details);
}

function expressInterest(userId) {
    const user = getCurrentUser();
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const profile = profiles.find(p => p.userId === userId);
    
    const feedback = {
        id: Date.now().toString(),
        entrepreneurId: userId,
        investorId: user.id,
        investorName: user.name,
        message: `I'm interested in investing in ${profile?.startupName || 'your startup'}. Let's discuss!`,
        date: new Date().toISOString()
    };
    
    const feedbacks = JSON.parse(localStorage.getItem('investorFeedback') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('investorFeedback', JSON.stringify(feedbacks));
    
    showNotification('Interest expressed! The entrepreneur will be notified.', 'success');
    updateStats();
}

function loadFundedStartups() {
    const funded = getFundedStartups();
    const listEl = document.getElementById('fundedList');
    
    if (funded.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No funded startups yet.</p>';
        return;
    }

    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    listEl.innerHTML = funded.map(item => {
        const profile = profiles.find(p => p.userId === item.startupId);
        const userMilestones = milestones.filter(m => m.userId === item.startupId);
        const entrepreneur = users.find(u => u.id === item.startupId);
        
        return `
            <div style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
                <h3>${profile?.startupName || 'Unnamed Startup'}</h3>
                <p><strong>Entrepreneur:</strong> ${entrepreneur?.name || 'N/A'}</p>
                <p><strong>Investment Amount:</strong> $${item.amount.toLocaleString()}</p>
                <p><strong>Progress:</strong> ${userMilestones.length} milestones completed</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${Math.min((userMilestones.length / 10) * 100, 100)}%;">
                        ${Math.round((userMilestones.length / 10) * 100)}%
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function isStartupFunded(startupId) {
    const funded = getFundedStartups();
    return funded.some(f => f.startupId === startupId && f.investorId === getCurrentUser().id);
}

function getFundedStartups() {
    const funded = JSON.parse(localStorage.getItem('fundedStartups') || '[]');
    return funded.filter(f => f.investorId === getCurrentUser().id);
}

function updateStats() {
    const funded = getFundedStartups();
    const feedbacks = JSON.parse(localStorage.getItem('investorFeedback') || '[]').filter(f => f.investorId === getCurrentUser().id);
    
    document.getElementById('fundedStartups').textContent = funded.length;
    document.getElementById('pendingReviews').textContent = feedbacks.length;
    
    const total = funded.reduce((sum, f) => sum + (f.amount || 0), 0);
    document.getElementById('totalInvestment').textContent = '$' + total.toLocaleString();
}

function showSettings() {
    if (confirm('Settings feature coming soon!')) {
        // Settings modal implementation
    }
}


