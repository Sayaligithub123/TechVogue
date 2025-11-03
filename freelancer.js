// Freelancer Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user || user.role !== 'freelancer') {
        window.location.href = '../pages/login.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    
    loadProfile();
    loadOpportunities();
    loadApplications();
    updateStats();

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
});

function loadProfile() {
    const profile = getFreelancerProfile();
    if (profile) {
        document.getElementById('skills').value = profile.skills || '';
        document.getElementById('experience').value = profile.experience || '';
        document.getElementById('portfolio').value = profile.portfolio || '';
        document.getElementById('bio').value = profile.bio || '';
    }
}

function handleProfileSubmit(e) {
    e.preventDefault();
    const profile = {
        skills: document.getElementById('skills').value,
        experience: document.getElementById('experience').value,
        portfolio: document.getElementById('portfolio').value,
        bio: document.getElementById('bio').value,
        userId: getCurrentUser().id
    };
    
    saveFreelancerProfile(profile);
    showNotification('Profile saved successfully!', 'success');
}

function loadOpportunities() {
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const listEl = document.getElementById('opportunitiesList');
    
    if (profiles.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No opportunities available at the moment.</p>';
        return;
    }

    listEl.innerHTML = profiles.map(profile => {
        const entrepreneur = users.find(u => u.id === profile.userId);
        const hasApplied = hasAppliedToStartup(profile.userId);
        
        return `
            <div style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
                <h3>${profile.startupName || 'Unnamed Startup'}</h3>
                <p><strong>Domain:</strong> ${profile.domain || 'N/A'}</p>
                <p><strong>Entrepreneur:</strong> ${entrepreneur?.name || 'N/A'}</p>
                <p style="margin: 1rem 0;">${profile.ideaSummary || 'No description available.'}</p>
                ${!hasApplied ? `
                    <button class="btn-primary btn-small" onclick="applyToStartup('${profile.userId}')">Apply to Collaborate</button>
                ` : '<span style="color: var(--secondary-color);">✓ Application Sent</span>'}
            </div>
        `;
    }).join('');
}

function applyToStartup(startupId) {
    const user = getCurrentUser();
    const applications = JSON.parse(localStorage.getItem('freelancerApplications') || '[]');
    
    if (hasAppliedToStartup(startupId)) {
        showNotification('You have already applied to this startup.', 'error');
        return;
    }
    
    const application = {
        id: Date.now().toString(),
        freelancerId: user.id,
        freelancerName: user.name,
        startupId: startupId,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    applications.push(application);
    localStorage.setItem('freelancerApplications', JSON.stringify(applications));
    
    showNotification('Application sent successfully!', 'success');
    loadOpportunities();
    loadApplications();
    updateStats();
}

function hasAppliedToStartup(startupId) {
    const applications = JSON.parse(localStorage.getItem('freelancerApplications') || '[]');
    return applications.some(a => a.freelancerId === getCurrentUser().id && a.startupId === startupId);
}

function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('freelancerApplications') || '[]')
        .filter(a => a.freelancerId === getCurrentUser().id);
    
    const listEl = document.getElementById('applicationsList');
    
    if (applications.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No applications sent yet.</p>';
        return;
    }

    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    listEl.innerHTML = applications.map(app => {
        const profile = profiles.find(p => p.userId === app.startupId);
        const entrepreneur = users.find(u => u.id === app.startupId);
        
        return `
                <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.5rem;">
                <strong>${profile?.startupName || 'Unknown Startup'}</strong> - ${entrepreneur?.name || 'N/A'}
                <span style="float: right; color: ${app.status === 'accepted' ? 'var(--secondary-color)' : app.status === 'rejected' ? '#ef4444' : 'var(--text-light)'};">
                    ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
                    Applied on ${formatDate(app.date)}
                </p>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const applications = JSON.parse(localStorage.getItem('freelancerApplications') || '[]')
        .filter(a => a.freelancerId === getCurrentUser().id);
    const active = applications.filter(a => a.status === 'accepted').length;
    
    document.getElementById('applicationsSent').textContent = applications.length;
    document.getElementById('activeCollaborations').textContent = active;
}

function getFreelancerProfile() {
    const profiles = JSON.parse(localStorage.getItem('freelancerProfiles') || '[]');
    return profiles.find(p => p.userId === getCurrentUser().id) || {};
}

function saveFreelancerProfile(profile) {
    const profiles = JSON.parse(localStorage.getItem('freelancerProfiles') || '[]');
    const index = profiles.findIndex(p => p.userId === profile.userId);
    if (index !== -1) {
        profiles[index] = profile;
    } else {
        profiles.push(profile);
    }
    localStorage.setItem('freelancerProfiles', JSON.stringify(profiles));
}

function showSettings() {
    if (confirm('Settings feature coming soon!')) {
        // Settings implementation
    }
}

