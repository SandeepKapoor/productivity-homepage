// DOM Elements
const clockElement = document.getElementById('clock');
const dateElement = document.getElementById('date');
const weatherSection = document.getElementById('weather-section');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchEngines = document.querySelectorAll('.search-engine');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const clearTodosBtn = document.getElementById('clear-todos');
const notesTextarea = document.getElementById('notes-textarea');
const clearNotesBtn = document.getElementById('clear-notes');
const timerDisplay = document.getElementById('timer-display');
const timerLabel = document.getElementById('timer-label');
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const presetBtns = document.querySelectorAll('.preset-btn');
const notification = document.getElementById('notification');

// Global Variables
let currentSearchEngine = 'google';
let timerInterval;
let timerRunning = false;
let currentTime = 25 * 60; // 25 minutes in seconds
let originalTime = 25 * 60;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    updateDate();
    loadTodos();
    loadNotes();
    setupEventListeners();
    setInterval(updateClock, 1000);
    setInterval(updateDate, 60000); // Update date every minute
});

// Clock and Date Functions
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    clockElement.textContent = timeString;
}

function updateDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    dateElement.textContent = dateString;
}

// Weather Functions (Mock data - replace with real API)
function updateWeather() {
    // Mock weather data - replace with real API call
    const mockWeather = {
        temperature: Math.floor(Math.random() * 30) + 50, // 50-80°F
        location: 'San Francisco, CA',
        icon: 'fa-sun'
    };
    
    const weatherInfo = weatherSection.querySelector('.weather-info');
    weatherInfo.innerHTML = `
        <i class="weather-icon fas ${mockWeather.icon}"></i>
        <div class="weather-details">
            <div class="temperature">${mockWeather.temperature}°F</div>
            <div class="location">${mockWeather.location}</div>
        </div>
    `;
}

// Search Functions
function setupSearchEngine() {
    searchEngines.forEach(btn => {
        btn.addEventListener('click', function() {
            searchEngines.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSearchEngine = this.dataset.engine;
        });
    });
}

function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    let searchUrl;
    switch (currentSearchEngine) {
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'duckduckgo':
            searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            break;
        default:
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    window.open(searchUrl, '_blank');
    searchInput.value = '';
}

// Todo List Functions
function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos.forEach(todo => addTodoToList(todo.text, todo.completed, todo.id));
}

function saveTodos() {
    const todoItems = todoList.querySelectorAll('.todo-item');
    const todos = Array.from(todoItems).map(item => ({
        id: item.dataset.id,
        text: item.querySelector('.todo-text').textContent,
        completed: item.classList.contains('completed')
    }));
    localStorage.setItem('todos', JSON.stringify(todos));
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const id = Date.now().toString();
    addTodoToList(text, false, id);
    todoInput.value = '';
    saveTodos();
    showNotification('Task added!', 'success');
}

function addTodoToList(text, completed, id) {
    const li = document.createElement('li');
    li.className = `todo-item ${completed ? 'completed' : ''}`;
    li.dataset.id = id;
    
    li.innerHTML = `
        <div class="todo-content">
            <input type="checkbox" class="todo-checkbox" ${completed ? 'checked' : ''}>
            <span class="todo-text">${text}</span>
        </div>
        <button class="delete-todo">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    const checkbox = li.querySelector('.todo-checkbox');
    const deleteBtn = li.querySelector('.delete-todo');
    
    checkbox.addEventListener('change', function() {
        li.classList.toggle('completed', this.checked);
        saveTodos();
    });
    
    deleteBtn.addEventListener('click', function() {
        li.remove();
        saveTodos();
        showNotification('Task deleted!', 'info');
    });
    
    todoList.appendChild(li);
}

function clearAllTodos() {
    if (todoList.children.length === 0) return;
    
    if (confirm('Are you sure you want to clear all tasks?')) {
        todoList.innerHTML = '';
        saveTodos();
        showNotification('All tasks cleared!', 'info');
    }
}

// Notes Functions
function loadNotes() {
    const savedNotes = localStorage.getItem('notes') || '';
    notesTextarea.value = savedNotes;
}

function saveNotes() {
    localStorage.setItem('notes', notesTextarea.value);
}

function clearNotes() {
    if (!notesTextarea.value.trim()) return;
    
    if (confirm('Are you sure you want to clear all notes?')) {
        notesTextarea.value = '';
        saveNotes();
        showNotification('Notes cleared!', 'info');
    }
}

// Timer Functions
function setupTimer() {
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            presetBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const minutes = parseInt(this.dataset.time);
            currentTime = minutes * 60;
            originalTime = currentTime;
            updateTimerDisplay();
            
            // Update timer label
            if (minutes === 25) timerLabel.textContent = 'Pomodoro';
            else if (minutes === 45) timerLabel.textContent = 'Long Focus';
            else if (minutes === 60) timerLabel.textContent = 'Deep Work';
        });
    });
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    
    timerInterval = setInterval(() => {
        currentTime--;
        updateTimerDisplay();
        
        if (currentTime <= 0) {
            clearInterval(timerInterval);
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerRunning) return;
    
    clearInterval(timerInterval);
    timerRunning = false;
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    currentTime = originalTime;
    updateTimerDisplay();
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
}

function timerComplete() {
    timerRunning = false;
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    
    // Play notification sound (if supported)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play();
    } catch (e) {
        // Fallback for browsers that don't support audio
    }
    
    showNotification('Timer completed! Take a break.', 'success');
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer Complete!', {
            body: 'Great job! Time to take a break.',
            icon: '/favicon.ico'
        });
    }
}

// Notification Functions
function showNotification(message, type = 'info') {
    const notificationContent = notification.querySelector('.notification-content');
    const notificationText = notification.querySelector('.notification-text');
    const notificationIcon = notification.querySelector('.notification-icon');
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notificationIcon.className = `notification-icon ${icons[type] || icons.info}`;
    notificationText.textContent = message;
    
    // Add type class for styling
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Search
    setupSearchEngine();
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    // Todo List
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    clearTodosBtn.addEventListener('click', clearAllTodos);
    
    // Notes
    notesTextarea.addEventListener('input', saveNotes);
    clearNotesBtn.addEventListener('click', clearNotes);
    
    // Timer
    setupTimer();
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Ctrl/Cmd + N to focus notes
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        notesTextarea.focus();
    }
    
    // Ctrl/Cmd + T to focus todo input
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        todoInput.focus();
    }
});

// Initialize weather (update every 30 minutes)
updateWeather();
setInterval(updateWeather, 30 * 60 * 1000);

// Export functions for potential external use
window.ProductivityHomepage = {
    addTodo,
    clearAllTodos,
    startTimer,
    pauseTimer,
    resetTimer,
    showNotification
};
