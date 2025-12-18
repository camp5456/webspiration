// Password for accessing the editor (CHANGE THIS!)
const EDITOR_PASSWORD = 'maintenance2025';

// State
let cardsData = null;
let currentCategory = 'all';
let editingCardId = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const editorScreen = document.getElementById('editor-screen');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const cardsList = document.getElementById('cards-list');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const successMessage = document.getElementById('success-message');
const encouragementModal = document.getElementById('encouragement-modal');
const encouragementForm = document.getElementById('encouragement-form');
const encouragementList = document.getElementById('encouragement-list');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Check if already logged in
    checkLoginStatus();
    
    // Load cards data
    await loadCardsData();
    
    // Setup form listener
    editForm.addEventListener('submit', handleSaveCard);

    // Setup encouragement form listener
    encouragementForm.addEventListener('submit', handleSaveEncouragement);

    // Live preview
    setupLivePreview();

    // Allow Enter key on password field
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login();
        }
    });
}

async function loadCardsData() {
    try {
        const response = await fetch('cards.json');
        cardsData = await response.json();
        renderCardsList();
        renderEncouragementList();
    } catch (error) {
        console.error('Error loading cards:', error);
        alert('Error loading cards data. Make sure cards.json is in the same folder.');
    }
}

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('editorLoggedIn');
    if (isLoggedIn === 'true') {
        showEditor();
    }
}

function login() {
    const password = passwordInput.value;
    
    if (password === EDITOR_PASSWORD) {
        sessionStorage.setItem('editorLoggedIn', 'true');
        showEditor();
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Incorrect password';
        passwordInput.value = '';
    }
}

function logout() {
    sessionStorage.removeItem('editorLoggedIn');
    loginScreen.style.display = 'block';
    editorScreen.style.display = 'none';
    passwordInput.value = '';
}

function showEditor() {
    loginScreen.style.display = 'none';
    editorScreen.style.display = 'block';
}

function getAllCards() {
    if (!cardsData) return [];
    
    return [
        ...cardsData.flows,
        ...cardsData.performance,
        ...cardsData.content,
        ...cardsData.accessibility
    ];
}

function filterCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderCardsList();
}

function renderCardsList() {
    if (!cardsData) return;
    
    let cards = [];
    
    if (currentCategory === 'all') {
        cards = getAllCards();
    } else {
        cards = cardsData[currentCategory] || [];
    }
    
    cardsList.innerHTML = '';
    
    cards.forEach(card => {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        cardItem.onclick = () => openEditModal(card);
        
        cardItem.innerHTML = `
            <h3>${card.title}</h3>
            <div class="card-meta">
                <span>📂 ${card.category}</span>
                <span>⏱ ${card.time}</span>
            </div>
        `;
        
        cardsList.appendChild(cardItem);
    });
}

function openEditModal(card) {
    editingCardId = card.id;
    
    // Populate form
    document.getElementById('edit-id').value = card.id;
    document.getElementById('edit-title').value = card.title;
    document.getElementById('edit-category').value = card.category;
    document.getElementById('edit-time').value = card.time;
    document.getElementById('edit-why').value = card.why;
    document.getElementById('edit-how').value = card.how;
    document.getElementById('edit-stuck').value = card.stuck;
    
    // Update preview
    updatePreview();
    
    // Show modal
    editModal.style.display = 'block';
}

function closeModal() {
    editModal.style.display = 'none';
    editForm.reset();
    editingCardId = null;
}

function handleSaveCard(e) {
    e.preventDefault();
    
    const cardId = parseInt(document.getElementById('edit-id').value);
    const updatedCard = {
        id: cardId,
        title: document.getElementById('edit-title').value,
        category: document.getElementById('edit-category').value,
        time: document.getElementById('edit-time').value,
        why: document.getElementById('edit-why').value,
        how: document.getElementById('edit-how').value,
        stuck: document.getElementById('edit-stuck').value
    };
    
    // Find and update the card in the data
    const allCards = getAllCards();
    const cardIndex = allCards.findIndex(c => c.id === cardId);
    
    if (cardIndex !== -1) {
        // Determine which category array to update
        let categoryKey = '';
        if (cardsData.flows.some(c => c.id === cardId)) categoryKey = 'flows';
        else if (cardsData.performance.some(c => c.id === cardId)) categoryKey = 'performance';
        else if (cardsData.content.some(c => c.id === cardId)) categoryKey = 'content';
        else if (cardsData.accessibility.some(c => c.id === cardId)) categoryKey = 'accessibility';
        
        if (categoryKey) {
            const indexInCategory = cardsData[categoryKey].findIndex(c => c.id === cardId);
            cardsData[categoryKey][indexInCategory] = updatedCard;
        }
    }
    
    // Show success message
    showSuccessMessage();
    
    // Re-render cards list
    renderCardsList();
    
    // Close modal
    closeModal();
}

function showSuccessMessage() {
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function setupLivePreview() {
    const fields = ['edit-title', 'edit-category', 'edit-time', 'edit-why', 'edit-how', 'edit-stuck'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updatePreview);
        }
    });
}

function updatePreview() {
    const title = document.getElementById('edit-title').value || 'Task Title';
    const category = document.getElementById('edit-category').value || 'Category';
    const time = document.getElementById('edit-time').value || '10 min';
    const why = document.getElementById('edit-why').value || 'Why it matters...';
    const how = document.getElementById('edit-how').value || 'How to do it...';
    const stuck = document.getElementById('edit-stuck').value || 'Stuck message...';
    
    const previewCard = document.getElementById('preview-card');
    
    // Format how-to steps
    const steps = how.split('\n').filter(s => s.trim()).map(s => s.trim());
    const stepsHTML = steps.length > 0 
        ? `<ol>${steps.map(step => `<li>${step.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`
        : '<p>How to do it...</p>';
    
    // Determine category color
    const categoryColors = {
        'Workflows': '#fed5ce',
        'Performance': '#9ac9e6',
        'Content': '#99e0c9',
        'Usability/Accessibility': '#b99cc1',
        'Flows': '#fed5ce'
    };
    const categoryBg = categoryColors[category] || '#b99cc1';

    previewCard.innerHTML = `
        <div class="modal-header-text">Website Maintenance Task</div>
        <div class="modal-divider"></div>
        <span class="card-category" style="background: ${categoryBg};">${category}</span>
        <h2 class="modal-title">${title}</h2>
        <p class="card-time">⏱ ${time}</p>

        <div class="modal-content-box">
            <div class="modal-section">
                <h4>Quick Steps:</h4>
                ${stepsHTML}
            </div>
            <div class="modal-section-divider"></div>
            <div class="modal-section">
                <h4>Why It's Important</h4>
                <p>${why}</p>
            </div>
        </div>

        <div class="modal-encouragement">
            <span>You're doing great. Seriously.</span>
            <span class="sparkle">✨</span>
        </div>
    `;
}

function downloadJSON() {
    // Create a Blob with the updated JSON data
    const jsonString = JSON.stringify(cardsData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cards.json';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('cards.json downloaded! Replace the old file in your repo and push to GitHub.');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === editModal) {
        closeModal();
    }
    if (event.target === encouragementModal) {
        closeEncouragementModal();
    }
}

// Encouragement Message Functions
function renderEncouragementList() {
    if (!cardsData || !cardsData.encouragement) return;

    encouragementList.innerHTML = '';

    cardsData.encouragement.forEach((message, index) => {
        const messageItem = document.createElement('div');
        messageItem.className = 'card-item';
        messageItem.onclick = () => openEncouragementModal(index);

        messageItem.innerHTML = `
            <h3 style="font-size: 1rem; font-style: italic; color: #6B6967;">"${message}"</h3>
            <div class="card-meta">
                <span>✨ Message ${index + 1}</span>
            </div>
        `;

        encouragementList.appendChild(messageItem);
    });
}

function openEncouragementModal(index) {
    document.getElementById('encouragement-index').value = index;
    document.getElementById('encouragement-text').value = cardsData.encouragement[index];

    encouragementModal.style.display = 'block';

    // Show delete button for existing messages
    const deleteBtn = encouragementForm.querySelector('button[onclick="deleteEncouragementMessage()"]');
    if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
    }
}

function closeEncouragementModal() {
    encouragementModal.style.display = 'none';
    encouragementForm.reset();
}

function handleSaveEncouragement(e) {
    e.preventDefault();

    const index = parseInt(document.getElementById('encouragement-index').value);
    const text = document.getElementById('encouragement-text').value.trim();

    if (index === -1) {
        // Adding new message
        cardsData.encouragement.push(text);
    } else {
        // Updating existing message
        cardsData.encouragement[index] = text;
    }

    showSuccessMessage();
    renderEncouragementList();
    closeEncouragementModal();
}

function addEncouragementMessage() {
    document.getElementById('encouragement-index').value = -1;
    document.getElementById('encouragement-text').value = '';

    encouragementModal.style.display = 'block';

    // Hide delete button for new messages
    const deleteBtn = encouragementForm.querySelector('button[onclick="deleteEncouragementMessage()"]');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
}

function deleteEncouragementMessage() {
    const index = parseInt(document.getElementById('encouragement-index').value);

    if (index === -1) return;

    if (confirm('Are you sure you want to delete this inspiration message?')) {
        cardsData.encouragement.splice(index, 1);
        showSuccessMessage();
        renderEncouragementList();
        closeEncouragementModal();
    }
}
