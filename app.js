// Constants
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90, 180]; // Spaced repetition intervals in days

// Initialize Kuroshiro
let kuroshiro = null;

async function initializeKuroshiro() {
    kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuroshiroAnalyzer());
}

async function getRomaji(text) {
    if (!kuroshiro) {
        return 'Loading...';
    }
    try {
        return await kuroshiro.convert(text, { to: 'romaji', mode: 'spaced' });
    } catch (error) {
        console.error('Error converting to romaji:', error);
        return text;
    }
}

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
        const word = this.vocabulary.find(w => w.id === id);
        if (!word) return;

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
        
        this.updateStreak();
        this.saveData();
    }

    getWordsForReview() {
        const now = new Date();
        return this.vocabulary.filter(word => 
            !word.nextReview || word.nextReview <= now
        );
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = this.stats.lastStudy ? new Date(this.stats.lastStudy).toDateString() : null;

        if (lastStudy === today) return;

        if (lastStudy) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastStudy === yesterday.toDateString()) {
                this.stats.streak++;
            } else {
                this.stats.streak = 1;
            }
        } else {
            this.stats.streak = 1;
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

    saveData() {
        localStorage.setItem('vocabulary', JSON.stringify(this.vocabulary));
        localStorage.setItem('stats', JSON.stringify(this.stats));
    }

    loadData() {
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
        }

        if (savedStats) {
            this.stats = JSON.parse(savedStats);
            this.stats.lastStudy = this.stats.lastStudy ? new Date(this.stats.lastStudy) : null;
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
    updateVocabularyTable();
    updateStats();
    updateCategories();
    updateReviewSection();
}

async function updateVocabularyTable() {
    const vocabList = document.getElementById('vocab-list');
    vocabList.innerHTML = '';

    for (const word of vocabManager.vocabulary) {
        const row = document.createElement('tr');
        const japaneseRomaji = await getRomaji(word.japanese);
        const readingRomaji = await getRomaji(word.reading);
        
        row.innerHTML = `
            <td>
                <div class="japanese-text">
                    ${word.japanese}
                    <span class="romaji">${japaneseRomaji}</span>
                </div>
            </td>
            <td>
                <div class="japanese-text">
                    ${word.reading}
                    <span class="romaji">${readingRomaji}</span>
                </div>
            </td>
            <td>${word.meaning}</td>
            <td><span class="tag">${word.category}</span></td>
            <td>
                <div class="progress-container" style="height: 10px;">
                    <div class="progress-bar" style="width: ${word.mastery}%; 
                         background-color: ${getMasteryColor(word.mastery)};">
                    </div>
                </div>
            </td>
            <td>
                <button class="edit-btn" data-id="${word.id}">Edit</button>
                <button class="delete-btn" data-id="${word.id}">Delete</button>
                <button class="review-btn" data-id="${word.id}">Review</button>
            </td>
        `;
        vocabList.appendChild(row);
    }

    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditWord);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteWord);
    });

    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', handleReviewWord);
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
    document.getElementById('review-count').textContent = reviewWords.length;
}

// Event handlers
async function handleAddWord(event) {
    event.preventDefault();
    
    const japanese = document.getElementById('japanese').value;
    const reading = document.getElementById('reading').value;
    
    // Get romaji for both Japanese and reading
    const japaneseRomaji = await getRomaji(japanese);
    const readingRomaji = await getRomaji(reading);
    
    const word = vocabManager.addWord(
        japanese,
        reading,
        document.getElementById('meaning').value,
        document.getElementById('category').value,
        document.getElementById('notes').value
    );

    document.getElementById('add-word-modal').style.display = 'none';
    document.getElementById('add-word-form').reset();
    updateUI();
}

function handleEditWord(event) {
    const id = parseInt(event.target.dataset.id);
    const word = vocabManager.vocabulary.find(w => w.id === id);
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
        vocabManager.updateWord(id, {
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
        const id = parseInt(event.target.dataset.id);
        vocabManager.deleteWord(id);
        updateUI();
    }
}

function handleReviewWord(event) {
    const id = parseInt(event.target.dataset.id);
    const word = vocabManager.vocabulary.find(w => w.id === id);
    if (!word) return;

    const isCorrect = confirm(`Do you know the meaning of ${word.japanese} (${word.reading})?`);
    vocabManager.reviewWord(id, isCorrect);
    updateUI();
}

// Helper functions
function getMasteryColor(mastery) {
    if (mastery < 30) return '#ff6384'; // Red
    if (mastery < 70) return '#ffcd56'; // Yellow
    return '#4bc0c0'; // Green
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Kuroshiro first
    try {
        await initializeKuroshiro();
        console.log('Kuroshiro initialized successfully');
    } catch (error) {
        console.error('Error initializing Kuroshiro:', error);
    }

    // Set up event listeners
    document.getElementById('add-word-form').addEventListener('submit', handleAddWord);
    
    // Fix search functionality
    document.getElementById('search').addEventListener('input', (e) => {
        const query = e.target.value;
        const filteredWords = vocabManager.searchWords(query);
        vocabManager.vocabulary = filteredWords;
        updateVocabularyTable();
        vocabManager.loadData(); // Restore original data after search
    });

    // Add Japanese input field handlers
    const japaneseInput = document.getElementById('japanese');
    const readingInput = document.getElementById('reading');

    japaneseInput.addEventListener('input', async () => {
        const romajiPreview = document.createElement('div');
        romajiPreview.className = 'romaji';
        romajiPreview.textContent = 'Converting...';
        japaneseInput.parentNode.appendChild(romajiPreview);
        
        const romaji = await getRomaji(japaneseInput.value);
        romajiPreview.textContent = romaji;
    });

    readingInput.addEventListener('input', async () => {
        const romajiPreview = document.createElement('div');
        romajiPreview.className = 'romaji';
        romajiPreview.textContent = 'Converting...';
        readingInput.parentNode.appendChild(romajiPreview);
        
        const romaji = await getRomaji(readingInput.value);
        romajiPreview.textContent = romaji;
    });

    // Add export/import handlers
    document.getElementById('export-btn').addEventListener('click', () => {
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
    });

    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'flex';
    });

    document.getElementById('import-confirm').addEventListener('click', () => {
        const importData = document.getElementById('import-data').value;
        try {
            if (vocabManager.importData(importData)) {
                alert('Data imported successfully!');
                document.getElementById('import-modal').style.display = 'none';
                document.getElementById('import-data').value = '';
                updateUI();
            } else {
                alert('Invalid data format. Please check your import data.');
            }
        } catch (e) {
            alert('Error importing data. Please check the format and try again.');
        }
    });

    // Add reset progress handler
    document.getElementById('reset-progress-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This will clear all mastery levels and review history, but keep your vocabulary words. This action cannot be undone.')) {
            vocabManager.resetProgress();
            updateUI();
            alert('Progress has been reset successfully.');
        }
    });

    // Add modal close handlers
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
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
    document.getElementById('accuracy-rate').textContent = 
        `${Math.round((vocabManager.stats.correctReviews / Math.max(1, vocabManager.stats.totalReviews)) * 100)}%`;

    // Initial UI update
    updateUI();
}); 
