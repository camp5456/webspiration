// State management
let cardsData = null;
let completedCards = new Set();
let currentCategory = 'all';

// DOM elements
const cardsContainer = document.getElementById('cards-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const randomCardBtn = document.getElementById('random-card-btn');
const modal = document.getElementById('card-modal');
const modalContent = document.getElementById('modal-card-content');
const closeModal = document.querySelector('.close');
const encouragementElement = document.getElementById('encouragement-message');
const progressFill = document.getElementById('progress-fill');
const completedCount = document.getElementById('completed-count');
const resetProgressBtn = document.getElementById('reset-progress-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Load cards data
    await loadCardsData();

    // Setup event listeners
    setupEventListeners();

    // Load completed cards from localStorage
    loadCompletedCards();

    // Show random encouragement message
    showEncouragementMessage();

    // Update category counts dynamically
    updateCategoryCounts();

    // Show all cards by default
    renderCards('all');
    updateProgress();
}

async function loadCardsData() {
    try {
        const response = await fetch('cards.json');
        cardsData = await response.json();
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

function setupEventListeners() {
    // Category buttons
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterByCategory(category);
            
            // Update active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Random card button
    randomCardBtn.addEventListener('click', showRandomCard);
    
    // Modal close
    closeModal.addEventListener('click', closeCardModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCardModal();
        }
    });

    // Reset progress button
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', handleResetProgress);
    }
}


function loadCompletedCards() {
    const saved = localStorage.getItem('websiteMaintenanceDeckCompleted');
    if (saved) {
        completedCards = new Set(JSON.parse(saved));
    }
}

function saveCompletedCards() {
    localStorage.setItem('websiteMaintenanceDeckCompleted', JSON.stringify([...completedCards]));
}

function showEncouragementMessage() {
    if (!cardsData || !cardsData.encouragement) return;
    
    const messages = cardsData.encouragement;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    if (encouragementElement) {
        encouragementElement.textContent = randomMessage;
    }
}

function getAllCards() {
    if (!cardsData || !cardsData.cards) return [];

    return cardsData.cards;
}

function updateCategoryCounts() {
    if (!cardsData || !cardsData.cards) return;

    const allCards = cardsData.cards;
    const categoryMap = {
        'all': allCards.length,
        'flows': allCards.filter(c => c.category === 'Workflows').length,
        'performance': allCards.filter(c => c.category === 'Performance').length,
        'content': allCards.filter(c => c.category === 'Content').length,
        'accessibility': allCards.filter(c => c.category === 'Usability/Accessibility').length
    };

    // Update button counts
    categoryButtons.forEach(btn => {
        const category = btn.dataset.category;
        const countSpan = btn.querySelector('.category-count');
        if (countSpan && categoryMap[category]) {
            countSpan.textContent = `(${categoryMap[category]})`;
        }
    });

    // Update progress tracker total
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        const completedSpan = document.getElementById('completed-count');
        if (completedSpan) {
            progressText.innerHTML = `<span id="completed-count">${completedSpan.textContent}</span> / ${allCards.length} tasks completed`;
        }
    }
}

function filterByCategory(category) {
    currentCategory = category;
    renderCards(category);
}

function renderCards(category) {
    if (!cardsData) return;

    let cards = [];

    if (category === 'all') {
        cards = getAllCards();
    } else {
        // Filter cards by category field
        const categoryMap = {
            'flows': 'Workflows',
            'performance': 'Performance',
            'content': 'Content',
            'accessibility': 'Usability/Accessibility'
        };
        const categoryName = categoryMap[category];
        cards = cardsData.cards.filter(card => card.category === categoryName);
    }

    cardsContainer.innerHTML = '';

    // Add random card element first (only for 'all' category)
    if (category === 'all') {
        const randomCard = createRandomCardElement();
        cardsContainer.appendChild(randomCard);
    }

    cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsContainer.appendChild(cardElement);
    });
}

function createRandomCardElement() {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card random-card';

    cardDiv.innerHTML = `
        <div class="card-front">
            <div class="random-card-icon">🎲</div>
            <h3>Surprise me with a random task</h3>
        </div>
    `;

    cardDiv.addEventListener('click', showRandomCard);

    return cardDiv;
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card task-card';

    // Add data-category attribute for color coding
    cardDiv.dataset.category = card.category.toLowerCase();

    const isCompleted = completedCards.has(card.id);

    if (isCompleted) {
        cardDiv.classList.add('completed');
    }

    cardDiv.innerHTML = `
        <div class="card-front">
            <input type="checkbox" class="card-checkbox" ${isCompleted ? 'checked' : ''} data-card-id="${card.id}">
            <span class="card-category">${card.category}</span>
            <h3>${card.title}</h3>
            <span class="card-time">⏱ ${card.time}</span>
        </div>
    `;

    // Handle checkbox clicks (prevent modal from opening)
    const checkbox = cardDiv.querySelector('.card-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCardComplete(card.id);
    });

    // Handle card clicks (open modal)
    cardDiv.addEventListener('click', () => openCardModal(card));

    return cardDiv;
}

function openCardModal(card) {
    const isCompleted = completedCards.has(card.id);

    // Add category data attribute to modal content
    modalContent.dataset.category = card.category.toLowerCase();

    // Get random encouragement message
    const encouragementMessages = cardsData.encouragement || [];
    const randomEncouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)] || 'Your website deserves a little love today.';

    modalContent.innerHTML = `
        <div class="modal-header-text">Website Maintenance Task</div>
        <div class="modal-divider"></div>
        <span class="card-category">${card.category}</span>
        <h2 class="modal-title">${card.title}</h2>
        <p class="card-time">⏱ ${card.time}</p>

        <div class="modal-content-box">
            <div class="modal-section">
                <h4>Why It's Important</h4>
                <p>${card.why}</p>
            </div>
            <div class="modal-section-divider"></div>
            <div class="modal-section">
                <h4>Quick Steps:</h4>
                ${formatHowTo(card.how)}
            </div>
            ${card.stuck ? `
            <div class="modal-section-divider"></div>
            <div class="modal-section">
                <h4>Stuck?</h4>
                <p>${card.stuck}</p>
            </div>
            ` : ''}
        </div>

        <div class="modal-encouragement">
            <span>${randomEncouragement}</span>
            <span class="sparkle">✨</span>
        </div>

        <button class="complete-btn ${isCompleted ? 'completed' : ''}" data-card-id="${card.id}">
            ${isCompleted ? '✓ Completed - Click to Mark Incomplete' : 'Mark as Complete'}
        </button>
    `;

    // Add event listener to complete button
    const completeBtn = modalContent.querySelector('.complete-btn');
    completeBtn.addEventListener('click', () => toggleCardComplete(card.id));

    modal.style.display = 'block';
}

function formatHowTo(howToText) {
    const steps = howToText.split('\n');
    return `<ol>${steps.map(step => `<li>${step.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
}

function formatHowToForCard(howToText) {
    const steps = howToText.split('\n');
    return `<ol class="card-steps">${steps.map(step => `<li>${step.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
}

function closeCardModal() {
    modal.style.display = 'none';
}

function toggleCardComplete(cardId) {
    if (completedCards.has(cardId)) {
        completedCards.delete(cardId);
    } else {
        completedCards.add(cardId);
    }
    
    saveCompletedCards();
    updateProgress();
    renderCards(currentCategory);
    closeCardModal();
    
    // Show new encouragement message
    showEncouragementMessage();
}

function updateProgress() {
    const total = getAllCards().length;
    const completed = completedCards.size;
    const percentage = (completed / total) * 100;
    
    if (completedCount) {
        completedCount.textContent = completed;
    }
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

function showRandomCard() {
    const allCards = getAllCards();

    // Filter out completed cards for random selection
    const incompleteCards = allCards.filter(card => !completedCards.has(card.id));

    // If all cards are completed, show any random card
    const cardsToChooseFrom = incompleteCards.length > 0 ? incompleteCards : allCards;

    if (cardsToChooseFrom.length === 0) return;

    const randomCard = cardsToChooseFrom[Math.floor(Math.random() * cardsToChooseFrom.length)];
    openCardModal(randomCard);
}

function handleResetProgress() {
    const confirmed = confirm('Are you sure you want to reset all progress? This will mark all cards as incomplete.');

    if (confirmed) {
        // Clear completed cards
        completedCards.clear();

        // Clear localStorage
        localStorage.removeItem('websiteMaintenanceDeckCompleted');

        // Update UI
        updateProgress();
        renderCards(currentCategory);

        alert('All progress has been reset!');
    }
}

// Demo card now uses static modal design - no flip functionality needed
