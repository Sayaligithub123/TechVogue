// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin (for demo, we'll allow any logged-in user to access admin)
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../pages/login.html';
        return;
    }

    loadUsers();
    loadStartupApprovals();
    loadActivityLogs();
    updateStats();
});

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No users found.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button class="btn-small btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function loadStartupApprovals() {
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const approvals = JSON.parse(localStorage.getItem('startupApprovals') || '[]');
    
    const listEl = document.getElementById('startupApprovals');
    
    if (profiles.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No startups pending approval.</p>';
        return;
    }

    listEl.innerHTML = profiles.map(profile => {
        const entrepreneur = users.find(u => u.id === profile.userId);
        const approval = approvals.find(a => a.startupId === profile.userId);
        const isApproved = approval?.approved === true;
        
        return `
            <div style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
                <h3>${profile.startupName || 'Unnamed Startup'}</h3>
                <p><strong>Entrepreneur:</strong> ${entrepreneur?.name || 'N/A'}</p>
                <p><strong>Domain:</strong> ${profile.domain || 'N/A'}</p>
                <p style="margin: 1rem 0;">${profile.ideaSummary || 'No description.'}</p>
                ${isApproved ? 
                    '<span style="color: var(--secondary-color);">✓ Approved</span>' : 
                    `<button class="btn-primary btn-small" onclick="approveStartup('${profile.userId}')">Approve</button>
                     <button class="btn-small btn-danger" onclick="rejectStartup('${profile.userId}')">Reject</button>`
                }
            </div>
        `;
    }).join('');
}

function approveStartup(startupId) {
    const approvals = JSON.parse(localStorage.getItem('startupApprovals') || '[]');
    const index = approvals.findIndex(a => a.startupId === startupId);
    
    if (index !== -1) {
        approvals[index].approved = true;
    } else {
        approvals.push({ startupId, approved: true, date: new Date().toISOString() });
    }
    
    localStorage.setItem('startupApprovals', JSON.stringify(approvals));
    addActivityLog(`Approved startup for user ${startupId}`);
    showNotification('Startup approved!', 'success');
    loadStartupApprovals();
}

function rejectStartup(startupId) {
    if (!confirm('Are you sure you want to reject this startup?')) return;
    
    const approvals = JSON.parse(localStorage.getItem('startupApprovals') || '[]');
    const index = approvals.findIndex(a => a.startupId === startupId);
    
    if (index !== -1) {
        approvals[index].approved = false;
    } else {
        approvals.push({ startupId, approved: false, date: new Date().toISOString() });
    }
    
    localStorage.setItem('startupApprovals', JSON.stringify(approvals));
    addActivityLog(`Rejected startup for user ${startupId}`);
    showNotification('Startup rejected.', 'error');
    loadStartupApprovals();
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    
    addActivityLog(`Deleted user ${userId}`);
    showNotification('User deleted.', 'success');
    loadUsers();
    updateStats();
}

function loadActivityLogs() {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
    
    const logsEl = document.getElementById('activityLogs');
    
    if (logs.length === 0) {
        logsEl.innerHTML = '<p style="color: var(--text-light);">No activity logs yet.</p>';
        return;
    }

    logsEl.innerHTML = logs.map(log => `
        <div style="padding: 0.75rem; border-left: 3px solid var(--primary-color); background: var(--bg-light); margin-bottom: 0.5rem; border-radius: 4px;">
            <strong>${log.action}</strong>
            <span style="color: var(--text-light); font-size: 0.875rem; float: right;">${formatDate(log.timestamp)}</span>
        </div>
    `).join('');
}

function addActivityLog(action) {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    logs.push({
        action,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activityLogs', JSON.stringify(logs));
    loadActivityLogs();
}

function updateStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalEntrepreneurs').textContent = users.filter(u => u.role === 'entrepreneur').length;
    document.getElementById('totalInvestors').textContent = users.filter(u => u.role === 'investor').length;
    document.getElementById('totalFreelancers').textContent = users.filter(u => u.role === 'freelancer').length;
}

