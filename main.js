// Variables globales
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let currentReminder = null;

// Funcionalidad del Modal
function toggleMenu() {
    const modal = document.getElementById('notesModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('notesModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Funcionalidad del popup de recordatorio
function toggleReminderPopup() {
    const popup = document.getElementById('reminderPopup');
    const checkbox = document.getElementById('reminder-toggle');
    
    if (checkbox.checked) {
        const dateInput = document.getElementById('reminder-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
        
        const timeInput = document.getElementById('reminder-time');
        const now = new Date();
        now.setHours(now.getHours() + 1);
        timeInput.value = now.toTimeString().slice(0, 5);
        
        popup.style.display = 'flex';
    } else {
        currentReminder = null;
    }
}

function setReminder() {
    const date = document.getElementById('reminder-date').value;
    const time = document.getElementById('reminder-time').value;
    
    if (date && time) {
        const reminderDate = new Date(`${date}T${time}`);
        if (reminderDate > new Date()) {
            currentReminder = reminderDate.getTime();
            closeReminderPopup();
        } else {
            alert('Por favor, selecciona una fecha y hora futura');
        }
    } else {
        alert('Por favor, completa ambos campos');
    }
}

function cancelReminder() {
    document.getElementById('reminder-toggle').checked = false;
    currentReminder = null;
    closeReminderPopup();
}

function closeReminderPopup() {
    document.getElementById('reminderPopup').style.display = 'none';
}

// Funcionalidad de la calculadora
let display = document.getElementById('calc-display');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        const operation = display.value;
        const result = eval(operation);
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid operation');
        }
        display.value = result;
        display.classList.remove('error');
        addToHistory(operation, result);
    } catch (error) {
        display.value = 'Error';
        display.classList.add('error');
        setTimeout(() => {
            display.classList.remove('error');
            clearDisplay();
        }, 1500);
    }
}

// Historial de operaciones
function addToHistory(operation, result) {
    history.unshift({
        operation,
        result,
        timestamp: new Date().toLocaleString()
    });
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('calcHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item">
                <span class="history-operation">${item.operation} =</span>
                <span class="history-result">${item.result}</span>
                <small class="history-timestamp">${item.timestamp}</small>
                <button class="history-use-btn" onclick="useHistory(${index})">Usar</button>
            </div>
        `).join('');
    }
}

function useHistory(index) {
    if (history[index]) {
        display.value = history[index].operation;
    }
}

function clearHistory() {
    if (confirm('¿Estás seguro de querer borrar todo el historial?')) {
        history = [];
        localStorage.removeItem('calcHistory');
        renderHistory();
    }
}

function toggleHistory() {
    const historyPopup = document.getElementById('historyPopup');
    historyPopup.style.display = historyPopup.style.display === 'flex' ? 'none' : 'flex';
}

// Funcionalidad de notas
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    checkReminders();
}

function addNote() {
    const noteText = document.getElementById('new-note').value.trim();
    if (noteText) {
        notes.push({
            text: noteText,
            date: new Date().toLocaleString(),
            reminder: currentReminder,
            notified: false
        });
        document.getElementById('new-note').value = '';
        currentReminder = null;
        document.getElementById('reminder-toggle').checked = false;
        saveNotes();
    }
}

function deleteNote(index) {
    if (confirm('¿Estás seguro de querer eliminar esta nota?')) {
        notes.splice(index, 1);
        saveNotes();
    }
}

function renderNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = notes.map((note, index) => `
        <div class="note ${note.reminder ? 'note-reminder' : ''}">
            <button class="delete-note" onclick="deleteNote(${index})">×</button>
            <p>${note.text}</p>
            <small>${note.date}</small>
            ${note.reminder ? `
                <div class="reminder-info">
                    ⏰ Recordatorio: ${new Date(note.reminder).toLocaleString()}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function checkReminders() {
    const now = Date.now();
    notes.forEach((note, index) => {
        if (note.reminder && !note.notified && note.reminder <= now) {
            showNotification(note.text);
            notes[index].notified = true;
            saveNotes();
        }
    });
}

function showNotification(text) {
    if (Notification.permission === 'granted') {
        new Notification('Recordatorio de nota', {
            body: text,
            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFASURBVHgB7ZbBDcIwDEVzQAfoAN0AMgIbdAPoBpANoCNAN4CO0BFgA9iADchHvqo4kqGx/1j5kpNYerL8EwXGGGOMMcYYY4wxk5EAHIAF2IDjJj5xL8c+Q4l6wA1YgZxJ5n0c+4Qc9YAXsGbyRdzDsXcU0QN4A3smX8Q9HHtFjmrAB3hm8kXcw7FX5GgGfIBXJl/EPRx7RY5qwBd4Z/JF3MOxV+SoBvyAdyZfxD0ce0WOasAfeGfyRdzDsVfkqAbcgHcmX8Q9HHtFjmrAA3hn8kXcw7FX5GgG3IBPJl/EPRx7RY5mwBV4ZfJF3MOxV+SoBvyBdyZfxD0ce0WOasADeGXyRdzDsVfkqAY8gHcmX8Q9HHtFjmrAC/hk8kXcw7FX5GgG3IF3Jl/EPRx7RY5qwA14ZfJF3MOxV+SoBtyBRyZfxD0ce0WOasANeGfyRdzDsVfkqAbcgHcmX8Q9HHtFjmrADXhn8kXcw7FX5KgG3IBPJl/EPRx7RY5qwB/wDx+XHw3yF5S+AAAAAElFTkSuQmCC'
        });
    }
}

// Registro del Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
            })
            .catch(err => {
                console.log('Error al registrar ServiceWorker:', err);
            });
    });
}

// Solicitar permiso para notificaciones
function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permiso para notificaciones concedido');
            }
        });
    }
}

// Event Listeners
window.addEventListener('click', (event) => {
    const modal = document.getElementById('notesModal');
    const popup = document.getElementById('reminderPopup');
    const historyPopup = document.getElementById('historyPopup');
    
    if (event.target === modal) {
        closeModal();
    }
    if (event.target === popup) {
        cancelReminder();
    }
    if (event.target === historyPopup) {
        toggleHistory();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('reminderPopup').style.display === 'flex') {
            cancelReminder();
        } else if (document.getElementById('notesModal').style.display === 'block') {
            closeModal();
        } else if (document.getElementById('historyPopup').style.display === 'flex') {
            toggleHistory();
        }
    }
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderNotes();
    checkReminders();
    clearDisplay();
    renderHistory();
    setInterval(checkReminders, 60000);
    requestNotificationPermission();
    
    window.addEventListener('appinstalled', () => {
        console.log('Aplicación instalada con éxito');
    });
});