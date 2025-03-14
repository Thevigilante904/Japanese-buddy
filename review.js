class ReviewSession {
    constructor(words) {
        this.words = words;
        this.currentIndex = 0;
        this.results = [];
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

    showCurrentWord() {
        if (this.session.isComplete()) {
            this.completeSession();
            return;
        }

        const word = this.session.getCurrentWord();
        const card = document.querySelector('.review-card');
        const currentWordNum = document.getElementById('current-word');
        
        card.classList.remove('revealed');
        card.querySelector('.japanese').textContent = word.japanese;
        card.querySelector('.reading').textContent = word.reading;
        card.querySelector('.meaning').textContent = word.meaning;
        
        currentWordNum.textContent = this.session.currentIndex + 1;
        
        document.getElementById('reveal-btn').style.display = 'block';
        document.querySelector('.review-buttons').style.display = 'none';
    }

    revealAnswer() {
        document.querySelector('.review-card').classList.add('revealed');
        document.getElementById('reveal-btn').style.display = 'none';
        document.querySelector('.review-buttons').style.display = 'flex';
    }

    handleAnswer(isCorrect) {
        const word = this.session.getCurrentWord();
        this.vocabManager.reviewWord(word.id, isCorrect);
        this.session.recordResult(isCorrect);
        this.showCurrentWord();
    }

    completeSession() {
        const stats = this.session.getStats();
        alert(`Review session complete!\nAccuracy: ${stats.accuracy}%\nCorrect: ${stats.correct}/${stats.total}`);
        document.getElementById('review-modal').style.display = 'none';
        this.session = null;
        updateUI(); // Update main UI stats
    }

    closeSession() {
        if (this.session && !this.session.isComplete()) {
            if (confirm('Are you sure you want to end this review session?')) {
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
