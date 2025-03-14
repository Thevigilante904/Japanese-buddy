// Japanese pattern generator
class JapanesePatterns {
    constructor() {
        this.patterns = [
            this.createSeigaihaPattern(),
            this.createAsanohaPattern(),
            this.createShippouPattern()
        ];
        this.currentPattern = 0;
        this.container = document.querySelector('.japanese-pattern');
        this.initializePattern();
    }

    createSeigaihaPattern() {
        return `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="seigaiha" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M0 0C0 50 50 50 50 0C50 50 100 50 100 0C100 50 150 50 150 0" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="1"/>
                        <path d="M-50 50C-50 100 0 100 0 50C0 100 50 100 50 50C50 100 100 100 100 50" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#seigaiha)"/>
            </svg>
        `;
    }

    createAsanohaPattern() {
        return `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="asanoha" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M50 0L75 25L50 50L25 25zM0 50L25 75L50 50L25 25zM50 50L75 75L100 50L75 25z" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#asanoha)"/>
            </svg>
        `;
    }

    createShippouPattern() {
        return `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="shippou" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor"/>
                        <circle cx="0" cy="50" r="25" fill="none" stroke="currentColor"/>
                        <circle cx="100" cy="50" r="25" fill="none" stroke="currentColor"/>
                        <circle cx="50" cy="0" r="25" fill="none" stroke="currentColor"/>
                        <circle cx="50" cy="100" r="25" fill="none" stroke="currentColor"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#shippou)"/>
            </svg>
        `;
    }

    initializePattern() {
        if (this.container) {
            this.container.innerHTML = this.patterns[this.currentPattern];
            this.startPatternRotation();
        }
    }

    startPatternRotation() {
        setInterval(() => {
            this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
            this.container.innerHTML = this.patterns[this.currentPattern];
            
            // Add fade transition
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.container.style.opacity = '0.03';
            }, 1000);
        }, 30000); // Change pattern every 30 seconds
    }
}

// Initialize patterns when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const patterns = new JapanesePatterns();
}); 
