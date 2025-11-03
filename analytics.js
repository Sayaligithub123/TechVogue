// Analytics JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../pages/login.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    
    // Set dashboard link
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        dashboardLink.href = `${user.role}.html`;
        dashboardLink.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1) + ' Dashboard';
    }
    
    loadAnalytics(user.role);
});

function loadAnalytics(role) {
    const contentEl = document.getElementById('analyticsContent');
    
    switch(role) {
        case 'entrepreneur':
            loadEntrepreneurAnalytics(contentEl);
            break;
        case 'investor':
            loadInvestorAnalytics(contentEl);
            break;
        case 'freelancer':
            loadFreelancerAnalytics(contentEl);
            break;
        default:
            contentEl.innerHTML = '<p>Analytics not available for this role.</p>';
    }
}

function loadEntrepreneurAnalytics(container) {
    const user = getCurrentUser();
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]')
        .filter(m => m.userId === user.id);
    const feedback = JSON.parse(localStorage.getItem('investorFeedback') || '[]')
        .filter(f => f.entrepreneurId === user.id);
    const members = JSON.parse(localStorage.getItem('teamMembers') || '[]')
        .filter(m => m.userId === user.id);
    
    const completedMilestones = milestones.filter(m => new Date(m.date) < new Date()).length;
    const upcomingMilestones = milestones.filter(m => new Date(m.date) >= new Date()).length;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Milestones</h3>
                <div class="stat-value">${milestones.length}</div>
            </div>
            <div class="stat-card">
                <h3>Completed</h3>
                <div class="stat-value">${completedMilestones}</div>
            </div>
            <div class="stat-card">
                <h3>Upcoming</h3>
                <div class="stat-value">${upcomingMilestones}</div>
            </div>
            <div class="stat-card">
                <h3>Investor Interest</h3>
                <div class="stat-value">${feedback.length}</div>
            </div>
        </div>
        
        <section class="content-section">
            <h2>Milestone Progress</h2>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%;">
                    ${milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0}%
                </div>
            </div>
        </section>
        
        <section class="content-section">
            <h2>Team Growth</h2>
            <p>Team Members: <strong>${members.length}</strong></p>
        </section>
    `;
}

function loadInvestorAnalytics(container) {
    const user = getCurrentUser();
    const funded = JSON.parse(localStorage.getItem('fundedStartups') || '[]')
        .filter(f => f.investorId === user.id);
    const totalInvested = funded.reduce((sum, f) => sum + (f.amount || 0), 0);
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Funded Startups</h3>
                <div class="stat-value">${funded.length}</div>
            </div>
            <div class="stat-card">
                <h3>Total Investment</h3>
                <div class="stat-value">$${totalInvested.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <h3>Avg per Startup</h3>
                <div class="stat-value">$${funded.length > 0 ? Math.round(totalInvested / funded.length).toLocaleString() : 0}</div>
            </div>
        </div>
        
        <section class="content-section">
            <h2>Investment Overview</h2>
            <p>You have invested in <strong>${funded.length}</strong> startup${funded.length !== 1 ? 's' : ''}.</p>
        </section>
    `;
}

function loadFreelancerAnalytics(container) {
    const user = getCurrentUser();
    const applications = JSON.parse(localStorage.getItem('freelancerApplications') || '[]')
        .filter(a => a.freelancerId === user.id);
    const accepted = applications.filter(a => a.status === 'accepted').length;
    const pending = applications.filter(a => a.status === 'pending').length;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Applications</h3>
                <div class="stat-value">${applications.length}</div>
            </div>
            <div class="stat-card">
                <h3>Accepted</h3>
                <div class="stat-value">${accepted}</div>
            </div>
            <div class="stat-card">
                <h3>Pending</h3>
                <div class="stat-value">${pending}</div>
            </div>
            <div class="stat-card">
                <h3>Success Rate</h3>
                <div class="stat-value">${applications.length > 0 ? Math.round((accepted / applications.length) * 100) : 0}%</div>
            </div>
        </div>
        
        <section class="content-section">
            <h2>Application Status</h2>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${applications.length > 0 ? (accepted / applications.length) * 100 : 0}%;">
                    ${applications.length > 0 ? Math.round((accepted / applications.length) * 100) : 0}%
                </div>
            </div>
        </section>
    `;
}

