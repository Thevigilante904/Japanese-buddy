class ReviewSession {
    constructor(words) {
        this.words = this.shuffleArray(words);
        this.currentIndex = 0;
        this.results = [];
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    getCurrentWord() {
        return this.words[this.currentIndex];
    }

    isComplete() {
        return this.currentIndex >= this.words.length;
    }

    recordResult(isCorrect) {
        this.results.push({
            word: this.getCurrentWord(),
            isCorrect: isCorrect,
            timestamp: new Date()
        });
        this.currentIndex++;
    }

    getStats() {
        const total = this.results.length;
        const correct = this.results.filter(r => r.isCorrect).length;
        return {
            total,
            correct,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
        };
    }
}

// Review session UI handler
class ReviewUI {
    constructor(vocabManager) {
        this.vocabManager = vocabManager;
        this.session = null;
        this.isAnswerRevealed = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = document.getElementById('review-modal');
        const startBtn = document.getElementById('start-review');
        const revealBtn = document.getElementById('reveal-btn');
        const closeBtn = modal.querySelector('.close');
        const correctBtn = modal.querySelector('.correct');
        const incorrectBtn = modal.querySelector('.incorrect');

        startBtn.addEventListener('click', () => this.startSession());
        revealBtn.addEventListener('click', () => this.revealAnswer());
        closeBtn.addEventListener('click', () => this.closeSession());
        correctBtn.addEventListener('click', () => this.handleAnswer(true));
        incorrectBtn.addEventListener('click', () => this.handleAnswer(false));

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.session || !modal.style.display || modal.style.display === 'none') return;

            switch(e.key.toLowerCase()) {
                case ' ':
                case 'enter':
                    e.preventDefault();
                    if (!this.isAnswerRevealed) {
                        this.revealAnswer();
                    }
                    break;
                case 'arrowleft':
                case '1':
                    if (this.isAnswerRevealed) {
                        this.handleAnswer(false);
                    }
                    break;
                case 'arrowright':
                case '2':
                    if (this.isAnswerRevealed) {
                        this.handleAnswer(true);
                    }
                    break;
                case 'escape':
                    this.closeSession();
                    break;
            }
        });
    }

    startSession() {
        const wordsToReview = this.vocabManager.getWordsForReview();
        if (wordsToReview.length === 0) {
            alert('No words to review at this time!');
            return;
        }

        this.session = new ReviewSession(wordsToReview);
        document.getElementById('review-modal').style.display = 'flex';
        document.getElementById('total-words-review').textContent = wordsToReview.length;
        this.showCurrentWord();
    }

    async showCurrentWord() {
        if (this.session.isComplete()) {
            this.completeSession();
            return;
        }

        const word = this.session.getCurrentWord();
        const card = document.querySelector('.review-card');
        const currentWordNum = document.getElementById('current-word');
        
        this.isAnswerRevealed = false;
        card.classList.remove('revealed');
        
        // Update Japanese text with romaji
        const japaneseContainer = card.querySelector('.japanese-text');
        const japaneseRomaji = await getRomaji(word.japanese);
        japaneseContainer.innerHTML = `
            <div class="japanese">${word.japanese}</div>
            <span class="romaji">${japaneseRomaji}</span>
        `;

        // Update reading with romaji
        const readingContainer = card.querySelector('.reading-container');
        const readingRomaji = await getRomaji(word.reading);
        readingContainer.innerHTML = `
            <div class="reading">${word.reading}</div>
            <span class="romaji">${readingRomaji}</span>
        `;
        
        card.querySelector('.meaning').textContent = word.meaning;
        currentWordNum.textContent = this.session.currentIndex + 1;
        
        document.getElementById('reveal-btn').style.display = 'block';
        document.querySelector('.review-buttons').style.display = 'none';

        // Add keyboard shortcut hints
        document.getElementById('reveal-btn').textContent = 'Reveal Answer (Space/Enter)';
        document.querySelector('.correct').textContent = 'Correct (→/2)';
        document.querySelector('.incorrect').textContent = 'Incorrect (←/1)';
    }

    revealAnswer() {
        this.isAnswerRevealed = true;
        document.querySelector('.review-card').classList.add('revealed');
        document.getElementById('reveal-btn').style.display = 'none';
        document.querySelector('.review-buttons').style.display = 'flex';
    }

    handleAnswer(isCorrect) {
        if (!this.isAnswerRevealed) return;
        
        const word = this.session.getCurrentWord();
        this.vocabManager.reviewWord(word.id, isCorrect);
        this.session.recordResult(isCorrect);
        this.showCurrentWord();
    }

    completeSession() {
        const stats = this.session.getStats();
        const message = `Review session complete!\n\n` +
                       `Accuracy: ${stats.accuracy}%\n` +
                       `Correct: ${stats.correct}/${stats.total}\n\n` +
                       `Keep up the good work! 頑張って!`;
        
        alert(message);
        document.getElementById('review-modal').style.display = 'none';
        this.session = null;
        updateUI(); // Update main UI stats
    }

    closeSession() {
        if (this.session && !this.session.isComplete()) {
            if (confirm('Are you sure you want to end this review session? (Esc)')) {
                document.getElementById('review-modal').style.display = 'none';
                this.session = null;
            }
        } else {
            document.getElementById('review-modal').style.display = 'none';
            this.session = null;
        }
    }
}

// Initialize review system
document.addEventListener('DOMContentLoaded', () => {
    const reviewUI = new ReviewUI(vocabManager);
}); 
