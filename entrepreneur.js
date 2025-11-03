// Entrepreneur Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user || user.role !== 'entrepreneur') {
        window.location.href = '../pages/login.html';
        return;
    }

    // Display user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = user.name;
    }

    // Load existing data
    loadProfile();
    loadMilestones();
    loadInvestorFeedback();
    loadTeamMembers();
    updateStats();

    // Form handlers
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    const milestoneForm = document.getElementById('milestoneForm');
    if (milestoneForm) {
        milestoneForm.addEventListener('submit', handleMilestoneSubmit);
    }

    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
});

// Load and display profile
function loadProfile() {
    const profile = getEntrepreneurProfile();
    if (profile) {
        document.getElementById('startupName').value = profile.startupName || '';
        document.getElementById('domain').value = profile.domain || '';
        document.getElementById('ideaSummary').value = profile.ideaSummary || '';
    }
}

// Handle profile form submission
function handleProfileSubmit(e) {
    e.preventDefault();
    const profile = {
        startupName: document.getElementById('startupName').value,
        domain: document.getElementById('domain').value,
        ideaSummary: document.getElementById('ideaSummary').value,
        userId: getCurrentUser().id
    };
    
    saveEntrepreneurProfile(profile);
    showNotification('Profile saved successfully!', 'success');
    updateStats();
}

// Handle milestone submission
function handleMilestoneSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('milestoneDate').value;
    const description = document.getElementById('milestoneDesc').value;
    
    if (!date || !description) return;

    const milestones = getMilestones();
    milestones.push({
        id: Date.now().toString(),
        date,
        description,
        userId: getCurrentUser().id
    });
    
    localStorage.setItem('milestones', JSON.stringify(milestones));
    document.getElementById('milestoneForm').reset();
    loadMilestones();
    updateStats();
}

// Load and display milestones
function loadMilestones() {
    const milestones = getMilestones();
    const listEl = document.getElementById('milestoneList');
    if (!listEl) return;

    listEl.innerHTML = '';
    milestones.forEach(milestone => {
        const li = document.createElement('li');
        li.className = 'milestone-item';
        li.innerHTML = `
            <div class="milestone-date">${formatDate(milestone.date)}</div>
            <div>${milestone.description}</div>
            <button type="button" class="btn-small btn-danger" onclick="deleteMilestone('${milestone.id}')" style="margin-top: 0.5rem;">Delete</button>
        `;
        listEl.appendChild(li);
    });
}

// Delete milestone
function deleteMilestone(id) {
    const milestones = getMilestones().filter(m => m.id !== id);
    localStorage.setItem('milestones', JSON.stringify(milestones));
    loadMilestones();
    updateStats();
}

// Mock upload pitch deck
function mockUploadDeck() {
    const statusEl = document.getElementById('deckStatus');
    statusEl.innerHTML = '<p style="color: var(--secondary-color);">✓ Pitch deck uploaded successfully! (Simulated)</p>';
    showNotification('Pitch deck uploaded!', 'success');
}

// Load investor feedback
function loadInvestorFeedback() {
    const feedback = getInvestorFeedback();
    const feedbackEl = document.getElementById('investorFeedback');
    if (!feedbackEl) return;

    if (feedback.length === 0) {
        feedbackEl.innerHTML = '<p style="color: var(--text-light);">No investor feedback yet.</p>';
        return;
    }

    feedbackEl.innerHTML = feedback.map(fb => `
        <div style="padding: 1rem; border-left: 4px solid var(--primary-color); background: var(--bg-light); margin-bottom: 1rem; border-radius: 4px;">
            <strong>${fb.investorName}</strong> - ${formatDate(fb.date)}
            <p>${fb.message}</p>
        </div>
    `).join('');
}

// Load team members
function loadTeamMembers() {
    const members = getTeamMembers();
    const teamEl = document.getElementById('teamList');
    if (!teamEl) return;

    if (members.length === 0) {
        teamEl.innerHTML = '<p style="color: var(--text-light);">No team members yet.</p>';
        return;
    }

    teamEl.innerHTML = members.map(member => `
        <div style="padding: 1rem; background: var(--bg-light); margin-bottom: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${member.name}</strong> - ${member.skills}
            </div>
            <button type="button" class="btn-small btn-danger" onclick="removeTeamMember('${member.id}')">Remove</button>
        </div>
    `).join('');
}

// Show add freelancer modal
function showAddFreelancer() {
    const name = prompt('Enter freelancer name:');
    const skills = prompt('Enter skills:');
    
    if (name && skills) {
        const members = getTeamMembers();
        members.push({
            id: Date.now().toString(),
            name,
            skills,
            userId: getCurrentUser().id
        });
        localStorage.setItem('teamMembers', JSON.stringify(members));
        loadTeamMembers();
        updateStats();
        showNotification('Team member added!', 'success');
    }
}

// Remove team member
function removeTeamMember(id) {
    const members = getTeamMembers().filter(m => m.id !== id);
    localStorage.setItem('teamMembers', JSON.stringify(members));
    loadTeamMembers();
    updateStats();
}

// Update stats
function updateStats() {
    const milestones = getMilestones();
    const members = getTeamMembers();
    const feedback = getInvestorFeedback();

    document.getElementById('activeMilestones').textContent = milestones.length;
    document.getElementById('teamMembers').textContent = members.length;
    document.getElementById('investorInterest').textContent = feedback.length;
    
    // Mock message count
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const userMessages = messages.filter(m => 
        m.toId === getCurrentUser().id || m.fromId === getCurrentUser().id
    );
    document.getElementById('messageCount').textContent = new Set(userMessages.map(m => m.toId === getCurrentUser().id ? m.fromId : m.toId)).size;
}

// Settings functions
function showSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'flex';
}

function hideSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    const newPassword = document.getElementById('changePassword').value;
    const profileVisible = document.getElementById('profileVisible').checked;

    if (newPassword && newPassword.length >= 6) {
        const user = getCurrentUser();
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    const profile = getEntrepreneurProfile();
    profile.visible = profileVisible;
    saveEntrepreneurProfile(profile);

    hideSettings();
    showNotification('Settings saved!', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        const user = getCurrentUser();
        const users = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.id !== user.id);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }
}

// Data helper functions
function getEntrepreneurProfile() {
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    return profiles.find(p => p.userId === getCurrentUser().id) || {};
}

function saveEntrepreneurProfile(profile) {
    const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
    const index = profiles.findIndex(p => p.userId === profile.userId);
    if (index !== -1) {
        profiles[index] = profile;
    } else {
        profiles.push(profile);
    }
    localStorage.setItem('entrepreneurProfiles', JSON.stringify(profiles));
}

function getMilestones() {
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    return milestones.filter(m => m.userId === getCurrentUser().id);
}

function getInvestorFeedback() {
    return JSON.parse(localStorage.getItem('investorFeedback') || '[]').filter(f => f.entrepreneurId === getCurrentUser().id);
}

function getTeamMembers() {
    const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    return members.filter(m => m.userId === getCurrentUser().id);
}

