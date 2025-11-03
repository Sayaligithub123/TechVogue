// Chat/Messages JavaScript

let currentChatId = null;

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
    
    loadContacts();
    
    // Send message on Enter key
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

function loadContacts() {
    const user = getCurrentUser();
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Get unique contacts
    const contactIds = new Set();
    messages.forEach(msg => {
        if (msg.fromId === user.id) contactIds.add(msg.toId);
        if (msg.toId === user.id) contactIds.add(msg.fromId);
    });
    
    // Add contacts from other modules (investor feedback, applications, etc.)
    if (user.role === 'entrepreneur') {
        const feedback = JSON.parse(localStorage.getItem('investorFeedback') || '[]');
        feedback.filter(f => f.entrepreneurId === user.id).forEach(f => contactIds.add(f.investorId));
    }
    
    if (user.role === 'freelancer') {
        const apps = JSON.parse(localStorage.getItem('freelancerApplications') || '[]');
        apps.filter(a => a.freelancerId === user.id).forEach(a => {
            const profiles = JSON.parse(localStorage.getItem('entrepreneurProfiles') || '[]');
            const profile = profiles.find(p => p.userId === a.startupId);
            if (profile) contactIds.add(a.startupId);
        });
    }
    
    const contacts = Array.from(contactIds).map(id => {
        const contactUser = users.find(u => u.id === id);
        if (!contactUser) return null;
        
        const unreadCount = messages.filter(m => 
            m.fromId === id && m.toId === user.id && !m.read
        ).length;
        
        const lastMessage = messages
            .filter(m => (m.fromId === id && m.toId === user.id) || (m.fromId === user.id && m.toId === id))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        
        return {
            id: contactUser.id,
            name: contactUser.name,
            unreadCount,
            lastMessage: lastMessage?.text || 'No messages yet'
        };
    }).filter(c => c !== null);
    
    const listEl = document.getElementById('contactsList');
    if (contacts.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No contacts yet.</p>';
        return;
    }
    
    listEl.innerHTML = contacts.map(contact => `
        <div class="contact-item" onclick="openChat('${contact.id}')" id="contact-${contact.id}">
            <h4>${contact.name}</h4>
            <p>${contact.lastMessage}</p>
            ${contact.unreadCount > 0 ? `<span class="unread-badge">${contact.unreadCount}</span>` : ''}
        </div>
    `).join('');
}

function openChat(contactId) {
    currentChatId = contactId;
    const user = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const contact = users.find(u => u.id === contactId);
    
    // Update active contact
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    const contactEl = document.getElementById(`contact-${contactId}`);
    if (contactEl) contactEl.classList.add('active');
    
    // Update chat header
    document.getElementById('chatHeader').innerHTML = `<h3>Chat with ${contact?.name || 'Unknown'}</h3>`;
    
    // Show message input
    document.getElementById('messageInputArea').style.display = 'flex';
    
    // Load messages
    loadMessages(contactId);
    
    // Mark messages as read
    markAsRead(contactId);
}

function loadMessages(contactId) {
    const user = getCurrentUser();
    const messages = JSON.parse(localStorage.getItem('messages') || '[]')
        .filter(m => (m.fromId === user.id && m.toId === contactId) || (m.fromId === contactId && m.toId === user.id))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const messagesArea = document.getElementById('messagesArea');
    messagesArea.innerHTML = messages.map(msg => {
        const isSent = msg.fromId === user.id;
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div>${msg.text}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            </div>
        `;
    }).join('');
    
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage() {
    if (!currentChatId) return;
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;
    
    const user = getCurrentUser();
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    messages.push({
        id: Date.now().toString(),
        fromId: user.id,
        toId: currentChatId,
        text: text,
        timestamp: new Date().toISOString(),
        read: false
    });
    
    localStorage.setItem('messages', JSON.stringify(messages));
    input.value = '';
    loadMessages(currentChatId);
    loadContacts();
}

function markAsRead(contactId) {
    const user = getCurrentUser();
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    messages.forEach(msg => {
        if (msg.fromId === contactId && msg.toId === user.id && !msg.read) {
            msg.read = true;
        }
    });
    
    localStorage.setItem('messages', JSON.stringify(messages));
    loadContacts();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

