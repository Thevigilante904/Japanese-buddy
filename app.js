// Constants
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90, 180]; // Spaced repetition intervals in days

// Add these variables at the top of the file, after the constants
let currentReviewWord = null;
let isReviewInProgress = false;
let currentReviewWords = [];
let currentReviewIndex = 0;

// Data structures
class VocabularyItem {
    constructor(japanese, reading, meaning, category, notes = '') {
        this.id = Date.now();
        this.japanese = japanese;
        this.reading = reading;
        this.meaning = meaning;
        this.category = category;
        this.notes = notes;
        this.mastery = 0;
        this.dateAdded = new Date();
        this.lastReviewed = null;
        this.nextReview = new Date();
        this.reviewLevel = 0;
    }
}

class VocabularyManager {
    constructor() {
        this.vocabulary = [];
        this.stats = {
            streak: 0,
            lastStudy: null,
            totalReviews: 0,
            correctReviews: 0
        };
        this.loadData();
    }

    addWord(japanese, reading, meaning, category, notes) {
        const word = new VocabularyItem(japanese, reading, meaning, category, notes);
        this.vocabulary.push(word);
        this.saveData();
        return word;
    }

    deleteWord(id) {
        this.vocabulary = this.vocabulary.filter(word => word.id !== id);
        this.saveData();
    }

    updateWord(id, updates) {
        const word = this.vocabulary.find(w => w.id === id);
        if (word) {
            Object.assign(word, updates);
            this.saveData();
        }
    }

    reviewWord(id, isCorrect) {
        console.log('Reviewing word with ID:', id, 'Correct:', isCorrect);
        const word = this.vocabulary.find(w => w.id === id);
        if (!word) {
            console.error('Word not found for review:', id);
            return;
        }

        this.stats.totalReviews++;
        if (isCorrect) {
            this.stats.correctReviews++;
            word.mastery = Math.min(100, word.mastery + 10);
            word.reviewLevel = Math.min(word.reviewLevel + 1, REVIEW_INTERVALS.length - 1);
        } else {
            word.mastery = Math.max(0, word.mastery - 5);
            word.reviewLevel = Math.max(0, word.reviewLevel - 1);
        }

        word.lastReviewed = new Date();
        word.nextReview = new Date();
        word.nextReview.setDate(word.nextReview.getDate() + REVIEW_INTERVALS[word.reviewLevel]);
        
        console.log('Updated word:', word);
        this.updateStreak();
        this.saveData();
    }

    getWordsForReview() {
        const now = new Date();
        const reviewWords = this.vocabulary.filter(word => 
            !word.nextReview || new Date(word.nextReview) <= now
        );
        console.log('Found words for review:', reviewWords.length);
        console.log('Review words:', reviewWords);
        return reviewWords;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = this.stats.lastStudy ? new Date(this.stats.lastStudy).toDateString() : null;

        if (lastStudy === today) {
            console.log('Already studied today, keeping current streak');
            return;
        }

        if (lastStudy) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastStudy === yesterday.toDateString()) {
                this.stats.streak++;
                console.log('Continued streak:', this.stats.streak);
            } else {
                this.stats.streak = 1;
                console.log('Reset streak to 1');
            }
        } else {
            this.stats.streak = 1;
            console.log('Started new streak');
        }

        this.stats.lastStudy = new Date();
        this.saveData();
    }

    searchWords(query) {
        query = query.toLowerCase();
        return this.vocabulary.filter(word =>
            word.japanese.toLowerCase().includes(query) ||
            word.reading.toLowerCase().includes(query) ||
            word.meaning.toLowerCase().includes(query)
        );
    }

    getCategoryStats() {
        return this.vocabulary.reduce((stats, word) => {
            stats[word.category] = (stats[word.category] || 0) + 1;
            return stats;
        }, {});
    }

    getMasteryStats() {
        const total = this.vocabulary.length;
        if (total === 0) return 0;
        const totalMastery = this.vocabulary.reduce((sum, word) => sum + word.mastery, 0);
        return Math.round(totalMastery / total);
    }

    loadData() {
        try {
            const savedVocab = localStorage.getItem('vocabulary');
            const savedStats = localStorage.getItem('stats');

            if (savedVocab) {
                this.vocabulary = JSON.parse(savedVocab);
                // Convert date strings back to Date objects
                this.vocabulary.forEach(word => {
                    word.dateAdded = new Date(word.dateAdded);
                    word.lastReviewed = word.lastReviewed ? new Date(word.lastReviewed) : null;
                    word.nextReview = word.nextReview ? new Date(word.nextReview) : new Date();
                });
                console.log('Loaded vocabulary:', this.vocabulary.length, 'words');
            }

            if (savedStats) {
                this.stats = JSON.parse(savedStats);
                this.stats.lastStudy = this.stats.lastStudy ? new Date(this.stats.lastStudy) : null;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // Initialize with empty data if there's an error
            this.vocabulary = [];
            this.stats = {
                streak: 0,
                lastStudy: null,
                totalReviews: 0,
                correctReviews: 0
            };
        }
    }

    saveData() {
        try {
            localStorage.setItem('vocabulary', JSON.stringify(this.vocabulary));
            localStorage.setItem('stats', JSON.stringify(this.stats));
            console.log('Saved vocabulary:', this.vocabulary.length, 'words');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    exportData() {
        return JSON.stringify({
            vocabulary: this.vocabulary,
            stats: this.stats
        }, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.vocabulary && data.stats) {
                this.vocabulary = data.vocabulary;
                this.stats = data.stats;
                this.saveData();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    resetProgress() {
        // Keep the words but reset their progress
        this.vocabulary = this.vocabulary.map(word => ({
            ...word,
            mastery: 0,
            lastReviewed: null,
            nextReview: new Date(),
            reviewLevel: 0
        }));

        // Reset stats
        this.stats = {
            streak: 0,
            lastStudy: null,
            totalReviews: 0,
            correctReviews: 0
        };

        this.saveData();
    }
}

// Initialize vocabulary manager
const vocabManager = new VocabularyManager();

// UI update functions
function updateUI() {
    console.log('Updating UI with', vocabManager.vocabulary.length, 'words');
    updateVocabularyTable();
    updateStats();
    updateCategories();
    updateReviewSection();
}

function updateVocabularyTable() {
    const vocabList = document.getElementById('vocab-list');
    const tableContainer = document.querySelector('.table-container');
    
    // Clear existing content
    vocabList.innerHTML = '';
    
    // Remove existing mobile list if it exists
    const existingMobileList = tableContainer.querySelector('.mobile-vocab-list');
    if (existingMobileList) {
        existingMobileList.remove();
    }

    if (vocabManager.vocabulary.length === 0) {
        vocabList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No vocabulary words yet. Add your first word!</td></tr>';
        return;
    }

    // Create desktop table rows
    vocabManager.vocabulary.forEach((word, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="japanese-text">
                    <span class="japanese">${word.japanese}</span>
                    <span class="romaji">${wanakana.toRomaji(word.japanese)}</span>
                </div>
            </td>
            <td>${word.reading}</td>
            <td>${word.meaning}</td>
            <td>
                <div class="actions-dropdown">
                    <button class="actions-dropdown-btn">Menu</button>
                    <div class="actions-dropdown-content">
                        <button class="edit-btn" data-index="${index}">Edit</button>
                        <button class="delete-btn" data-index="${index}">Delete</button>
                        <button class="review-btn" data-index="${index}">Review</button>
                    </div>
                </div>
            </td>
        `;
        vocabList.appendChild(row);
    });

    // Create mobile list
    const mobileVocabList = document.createElement('div');
    mobileVocabList.className = 'mobile-vocab-list';
    
    vocabManager.vocabulary.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `
            <div class="japanese-text">
                <span class="japanese">${word.japanese}</span>
                <span class="romaji">${wanakana.toRomaji(word.japanese)}</span>
            </div>
            <div class="reading">${word.reading}</div>
            <div class="meaning">${word.meaning}</div>
            <div class="actions-dropdown">
                <button class="actions-dropdown-btn">Menu</button>
                <div class="actions-dropdown-content">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                    <button class="review-btn" data-index="${index}">Review</button>
                </div>
            </div>
        `;
        mobileVocabList.appendChild(card);
    });

    // Add mobile list to the container
    tableContainer.appendChild(mobileVocabList);

    // Add event listeners for dropdowns
    document.querySelectorAll('.actions-dropdown').forEach(dropdown => {
        const btn = dropdown.querySelector('.actions-dropdown-btn');
        const content = dropdown.querySelector('.actions-dropdown-content');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns
            document.querySelectorAll('.actions-dropdown-content.show').forEach(d => {
                if (d !== content) d.classList.remove('show');
            });
            content.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            content.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Add event listeners for action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            handleEditWord(index);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            handleDeleteWord(index);
        });
    });

    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            startReview([vocabManager.vocabulary[index]]);
        });
    });
}

function updateStats() {
    document.getElementById('total-words').textContent = vocabManager.vocabulary.length;
    document.getElementById('study-streak').textContent = vocabManager.stats.streak;
    document.getElementById('mastery-rate').textContent = `${vocabManager.getMasteryStats()}%`;
    
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${vocabManager.getMasteryStats()}%`;
}

function updateCategories() {
    const categoriesList = document.getElementById('categories-list');
    const stats = vocabManager.getCategoryStats();
    
    categoriesList.innerHTML = '';
    Object.entries(stats).forEach(([category, count]) => {
        const li = document.createElement('li');
        li.textContent = `${category}: ${count} words`;
        categoriesList.appendChild(li);
    });
}

function updateReviewSection() {
    const reviewWords = vocabManager.getWordsForReview();
    const reviewCount = document.getElementById('review-count');
    const reviewCard = document.getElementById('review-card');
    const startReviewBtn = document.getElementById('start-review-btn');

    if (reviewCount) {
        reviewCount.textContent = reviewWords.length;
    }

    if (startReviewBtn) {
        startReviewBtn.style.display = isReviewInProgress ? 'none' : 'block';
    }

    if (reviewCard) {
        reviewCard.classList.toggle('show', isReviewInProgress);
    }
}

function showReviewCard(word) {
    const reviewCard = document.getElementById('review-card');
    const meaningElement = reviewCard.querySelector('.meaning');
    const revealButton = document.getElementById('reveal-answer-btn');
    
    // Reset the card state
    meaningElement.classList.add('hidden');
    revealButton.classList.remove('hidden');
    
    // Update card content
    reviewCard.querySelector('.japanese-text').textContent = word.japanese;
    reviewCard.querySelector('.reading').textContent = word.reading;
    meaningElement.textContent = word.meaning;
    
    // Show the card
    reviewCard.style.display = 'block';
}

function startReviewSession() {
    console.log('Starting review session');
    const wordsToReview = vocabManager.getWordsForReview();
    
    if (wordsToReview.length === 0) {
        alert('No words to review at this time!');
        return;
    }
    
    isReviewInProgress = true;
    currentReviewWords = wordsToReview;
    currentReviewIndex = 0;
    
    showReviewCard(currentReviewWords[currentReviewIndex]);
    document.getElementById('start-review-btn').style.display = 'none';
    document.getElementById('review-card').style.display = 'block';
}

function handleReviewResponse(isCorrect) {
    if (!isReviewInProgress || currentReviewIndex >= currentReviewWords.length) return;
    
    const word = currentReviewWords[currentReviewIndex];
    vocabManager.reviewWord(word.id, isCorrect);
    
    currentReviewIndex++;
    
    if (currentReviewIndex < currentReviewWords.length) {
        showReviewCard(currentReviewWords[currentReviewIndex]);
    } else {
        endReviewSession();
    }
    
    updateUI();
}

function endReviewSession() {
    isReviewInProgress = false;
    currentReviewWords = [];
    currentReviewIndex = 0;
    
    document.getElementById('review-card').style.display = 'none';
    document.getElementById('start-review-btn').style.display = 'block';
    
    updateUI();
}

// Event handlers
async function handleAddWord(event) {
    event.preventDefault();
    
    const japanese = document.getElementById('japanese').value;
    const reading = document.getElementById('reading').value;
    const meaning = document.getElementById('meaning').value;
    const category = document.getElementById('category').value;
    const notes = document.getElementById('notes').value;

    if (!japanese || !reading || !meaning || !category) {
        alert('Please fill in all required fields (Japanese, Reading, Meaning, and Category)');
        return;
    }
    
    try {
        const word = vocabManager.addWord(
            japanese,
            reading,
            meaning,
            category,
            notes
        );

        console.log('Added new word:', word);

        // Close modal and reset form
        const modal = document.getElementById('add-word-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.getElementById('add-word-form').reset();
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error('Error adding word:', error);
        alert('Error adding word. Please try again.');
    }
}

function handleEditWord(event) {
    const id = parseInt(event.target.dataset.index);
    const word = vocabManager.vocabulary[id];
    if (!word) return;

    // Populate edit form
    document.getElementById('japanese').value = word.japanese;
    document.getElementById('reading').value = word.reading;
    document.getElementById('meaning').value = word.meaning;
    document.getElementById('category').value = word.category;
    document.getElementById('notes').value = word.notes;

    // Show modal
    const modal = document.getElementById('add-word-modal');
    modal.style.display = 'flex';
    
    // Update form submission handler
    const form = document.getElementById('add-word-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        vocabManager.updateWord(word.id, {
            japanese: document.getElementById('japanese').value,
            reading: document.getElementById('reading').value,
            meaning: document.getElementById('meaning').value,
            category: document.getElementById('category').value,
            notes: document.getElementById('notes').value
        });
        modal.style.display = 'none';
        form.reset();
        form.onsubmit = handleAddWord;
        updateUI();
    };
}

function handleDeleteWord(event) {
    if (confirm('Are you sure you want to delete this word?')) {
        const id = parseInt(event.target.dataset.index);
        vocabManager.deleteWord(vocabManager.vocabulary[id].id);
        updateUI();
    }
}

function handleReviewWord(event) {
    const id = parseInt(event.target.dataset.index);
    const word = vocabManager.vocabulary[id];
    if (!word) return;

    const isCorrect = confirm(`Do you know the meaning of ${word.japanese} (${word.reading})?`);
    vocabManager.reviewWord(word.id, isCorrect);
    updateUI();
}

// Helper functions
function getMasteryColor(mastery) {
    if (mastery < 30) return '#ff6384'; // Red
    if (mastery < 70) return '#ffcd56'; // Yellow
    return '#4bc0c0'; // Green
}

// Function to convert Japanese text to romaji using WanaKana
async function toRomaji(text) {
    // Show loading state
    const loadingText = document.createElement('span');
    loadingText.className = 'loading-romaji';
    loadingText.textContent = 'Loading romaji...';
    
    try {
        // Convert using WanaKana
        const romaji = wanakana.toRomaji(text);
        return romaji;
    } catch (error) {
        console.error('Error converting to romaji:', error);
        return 'Error loading romaji';
    }
}

// Function to update the romaji display for a Japanese text element
async function updateRomaji(japaneseElement) {
    const japaneseText = japaneseElement.textContent;
    
    // Create or get the romaji element
    let romajiElement = japaneseElement.querySelector('.romaji');
    if (!romajiElement) {
        romajiElement = document.createElement('span');
        romajiElement.className = 'romaji';
        japaneseElement.appendChild(romajiElement);
    }
    
    // Show loading state
    romajiElement.textContent = 'Loading romaji...';
    romajiElement.className = 'loading-romaji';
    
    try {
        const romaji = await toRomaji(japaneseText);
        romajiElement.textContent = romaji;
        romajiElement.className = 'romaji'; // Switch back to normal style
    } catch (error) {
        romajiElement.textContent = 'Error loading romaji';
        romajiElement.className = 'romaji error';
    }
}

// Initialize WanaKana for input fields
document.addEventListener('DOMContentLoaded', function() {
    // Initialize WanaKana on the Japanese input field
    const japaneseInput = document.getElementById('japanese');
    if (japaneseInput) {
        wanakana.bind(japaneseInput);
    }

    // Initialize WanaKana on the reading input field
    const readingInput = document.getElementById('reading');
    if (readingInput) {
        wanakana.bind(readingInput);
    }

    // Update romaji for all Japanese text elements
    document.querySelectorAll('.japanese-text').forEach(updateRomaji);
});

// Add these helper functions at the top of the file after the constants
function addClickAndTouchHandler(element, handler) {
    if (!element) return;
    
    // Add both click and touch events
    element.addEventListener('click', handler);
    element.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent double-firing on mobile
        handler(e);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    const addWordBtn = document.getElementById('add-word-btn');
    if (addWordBtn) {
        addWordBtn.addEventListener('click', () => {
            const modal = document.getElementById('add-word-modal');
            if (modal) {
                modal.style.display = 'flex';
                // Reset form when opening modal
                const form = document.getElementById('add-word-form');
                if (form) {
                    form.reset();
                }
            }
        });
    }

    // Set up form submission handler
    const addWordForm = document.getElementById('add-word-form');
    if (addWordForm) {
        console.log('Setting up form submission handler');
        addWordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form submitted');
            
            const japanese = document.getElementById('japanese').value;
            const reading = document.getElementById('reading').value;
            const meaning = document.getElementById('meaning').value;
            const category = 'General'; // Default category
            const notes = document.getElementById('notes').value;

            console.log('Form values:', { japanese, reading, meaning, category, notes });

            if (!japanese || !reading || !meaning) {
                alert('Please fill in all required fields (Japanese, Reading, and Meaning)');
                return;
            }
            
            try {
                const word = vocabManager.addWord(
                    japanese,
                    reading,
                    meaning,
                    category,
                    notes
                );

                console.log('Added new word:', word);

                // Close modal and reset form
                const modal = document.getElementById('add-word-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                event.target.reset();
                
                // Update UI
                updateUI();
            } catch (error) {
                console.error('Error adding word:', error);
                alert('Error adding word. Please try again.');
            }
        });
    }

    // Fix search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const filteredWords = vocabManager.searchWords(query);
            updateVocabularyTable(filteredWords);
        });
    }

    // Add export/import/reset handlers with mobile support
    const exportBtn = document.getElementById('settings-export-btn');
    if (exportBtn) {
        console.log('Setting up export handler');
        addClickAndTouchHandler(exportBtn, () => {
            console.log('Export button clicked');
            try {
                const data = vocabManager.exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'japanese-vocabulary.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('Export completed successfully');
            } catch (error) {
                console.error('Error exporting data:', error);
                alert('Error exporting data. Please try again.');
            }
        });
    } else {
        console.error('Export button not found');
    }

    const importBtn = document.getElementById('settings-import-btn');
    if (importBtn) {
        console.log('Setting up import handler');
        addClickAndTouchHandler(importBtn, () => {
            console.log('Import button clicked');
            const importModal = document.getElementById('import-modal');
            if (importModal) {
                importModal.style.display = 'flex';
            } else {
                console.error('Import modal not found');
            }
        });
    } else {
        console.error('Import button not found');
    }

    const importConfirmBtn = document.getElementById('import-confirm');
    if (importConfirmBtn) {
        console.log('Setting up import confirm handler');
        addClickAndTouchHandler(importConfirmBtn, () => {
            console.log('Import confirm button clicked');
            const importData = document.getElementById('import-data');
            if (importData) {
                try {
                    console.log('Attempting to import data...');
                    if (vocabManager.importData(importData.value)) {
                        console.log('Data imported successfully');
                        alert('Data imported successfully!');
                        const importModal = document.getElementById('import-modal');
                        if (importModal) {
                            importModal.style.display = 'none';
                        }
                        importData.value = '';
                        updateUI();
                    } else {
                        console.error('Invalid data format');
                        alert('Invalid data format. Please check your import data.');
                    }
                } catch (e) {
                    console.error('Error importing data:', e);
                    alert('Error importing data. Please check the format and try again.');
                }
            } else {
                console.error('Import data textarea not found');
            }
        });
    } else {
        console.error('Import confirm button not found');
    }

    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        console.log('Setting up reset progress handler');
        addClickAndTouchHandler(resetBtn, () => {
            console.log('Reset progress button clicked');
            if (confirm('Are you sure you want to reset all progress? This will clear all mastery levels and review history, but keep your vocabulary words. This action cannot be undone.')) {
                try {
                    console.log('Resetting progress...');
                    vocabManager.resetProgress();
                    console.log('Progress reset successfully');
                    updateUI();
                    alert('Progress has been reset successfully.');
                } catch (error) {
                    console.error('Error resetting progress:', error);
                    alert('Error resetting progress. Please try again.');
                }
            }
        });
    } else {
        console.error('Reset progress button not found');
    }

    // Add modal close handlers
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Update accuracy rate
    const accuracyRate = document.getElementById('accuracy-rate');
    if (accuracyRate) {
        accuracyRate.textContent = 
            `${Math.round((vocabManager.stats.correctReviews / Math.max(1, vocabManager.stats.totalReviews)) * 100)}%`;
    }

    // Add review functionality event listeners with mobile support
    const startReviewBtn = document.getElementById('start-review-btn');
    if (startReviewBtn) {
        console.log('Adding click/touch listener to start review button');
        addClickAndTouchHandler(startReviewBtn, () => {
            console.log('Start review button activated');
            startReviewSession();
        });
    } else {
        console.error('Start review button not found');
    }

    const correctBtn = document.querySelector('.correct-btn');
    if (correctBtn) {
        addClickAndTouchHandler(correctBtn, () => {
            console.log('Correct button activated');
            handleReviewResponse(true);
        });
    }

    const incorrectBtn = document.querySelector('.incorrect-btn');
    if (incorrectBtn) {
        addClickAndTouchHandler(incorrectBtn, () => {
            console.log('Incorrect button activated');
            handleReviewResponse(false);
        });
    }

    // Update other button handlers to use the new helper function
    document.querySelectorAll('.edit-btn').forEach(btn => {
        addClickAndTouchHandler(btn, handleEditWord);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        addClickAndTouchHandler(btn, handleDeleteWord);
    });

    document.querySelectorAll('.review-btn').forEach(btn => {
        addClickAndTouchHandler(btn, handleReviewWord);
    });

    // Add touch support for revealing meaning
    const reviewCard = document.getElementById('review-card');
    if (reviewCard) {
        addClickAndTouchHandler(reviewCard, () => {
            if (isReviewInProgress && !reviewCard.classList.contains('revealed')) {
                console.log('Revealing meaning (touch)');
                reviewCard.classList.add('revealed');
            }
        });
    }

    // Add reveal button handler
    const revealButton = document.getElementById('reveal-answer-btn');
    if (revealButton) {
        addClickAndTouchHandler(revealButton, () => {
            if (isReviewInProgress) {
                const meaningElement = document.querySelector('.meaning');
                const revealButton = document.getElementById('reveal-answer-btn');
                
                meaningElement.classList.remove('hidden');
                revealButton.classList.add('hidden');
            }
        });
    }
    
    // Update keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (isReviewInProgress) {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                const meaningElement = document.querySelector('.meaning');
                const revealButton = document.getElementById('reveal-answer-btn');
                
                if (meaningElement.classList.contains('hidden')) {
                    meaningElement.classList.remove('hidden');
                    revealButton.classList.add('hidden');
                }
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                handleReviewResponse(true);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                handleReviewResponse(false);
            } else if (e.code === 'Escape') {
                e.preventDefault();
                endReviewSession();
            }
        }
    });

    // Initial UI update
    updateUI();
}); 
