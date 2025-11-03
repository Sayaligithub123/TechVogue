// Pitch Events JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../pages/login.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    
    // Set dashboard link based on role
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        dashboardLink.href = `${user.role}.html`;
        dashboardLink.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1) + ' Dashboard';
    }
    
    loadEvents();
    renderCalendar();
});

const mockEvents = [];

function loadEvents() {
    const user = getCurrentUser();
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const userRegistrations = registrations.filter(r => r.userId === user.id).map(r => r.eventId);
    
    const events = mockEvents.map(event => ({
        ...event,
        registered: userRegistrations.includes(event.id)
    }));

    const listEl = document.getElementById('eventsList');
    if (events.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-light);">No upcoming events.</p>';
        return;
    }

    listEl.innerHTML = events.map(event => `
        <div style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem;">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${formatDate(event.date)}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p style="margin: 1rem 0;">${event.description}</p>
            ${event.registered ? 
                '<span style="color: var(--secondary-color);">✓ Registered</span>' : 
                `<button class="btn-primary btn-small" onclick="registerForEvent('${event.id}')">Register</button>`
            }
        </div>
    `).join('');
}

function registerForEvent(eventId) {
    const user = getCurrentUser();
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    
    if (registrations.some(r => r.userId === user.id && r.eventId === eventId)) {
        showNotification('You are already registered for this event.', 'error');
        return;
    }
    
    registrations.push({
        userId: user.id,
        eventId: eventId,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
    showNotification('Successfully registered for the event!', 'success');
    loadEvents();
    renderCalendar();
}

function renderCalendar() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const userRegistrations = registrations.filter(r => r.userId === getCurrentUser().id).map(r => r.eventId);
    
    const eventDates = mockEvents.filter(e => userRegistrations.includes(e.id)).map(e => {
        const date = new Date(e.date);
        return date.getDate();
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let calendarHTML = `<h3>${monthNames[today.getMonth()]} ${today.getFullYear()}</h3>`;
    calendarHTML += '<div class="calendar-grid">';
    
    // Day names
    dayNames.forEach(day => {
        calendarHTML += `<div style="font-weight: bold; text-align: center; padding: 0.5rem;">${day}</div>`;
    });

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const hasEvent = eventDates.includes(day);
        const isToday = day === today.getDate() && today.getMonth() === new Date().getMonth();
        calendarHTML += `<div class="calendar-day ${hasEvent ? 'has-event' : ''}" ${isToday ? 'style="background-color: #dbeafe; border: 2px solid var(--primary-color);"' : ''}>${day}</div>`;
    }

    calendarHTML += '</div>';
    
    document.getElementById('calendarContainer').innerHTML = calendarHTML;
}

