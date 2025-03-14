// Japanese pattern generator
class JapanesePatterns {
    constructor() {
        this.patterns = [
            this.createSeigaihaPattern(),
            this.createAsanohaPattern(),
            this.createKikkoPattern(),
            this.createSayagataPattern()
        ];
        this.currentPattern = 0;
        this.container = document.querySelector('.japanese-pattern');
        this.initializePattern();
    }

    createSeigaihaPattern() {
        return `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="seigaiha" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M25 0C25 25 0 25 0 25C0 25 25 25 25 50C25 25 50 25 50 25C50 25 25 25 25 0" 
                              fill="none" 
                              stroke="#D64545" 
                              stroke-width="1"/>
                        <path d="M25 0C25 20 5 20 5 20C5 20 25 20 25 40" 
                              fill="none" 
                              stroke="#D64545" 
                              stroke-width="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#seigaiha)"/>
            </svg>
        `;
    }

    createAsanohaPattern() {
        return `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="asanoha" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M20 0L30 10L20 20L10 10zM0 20L10 30L20 20L10 10zM20 20L30 30L40 20L30 10z" 
                              fill="none" 
                              stroke="#1B4B66" 
                              stroke-width="0.5"/>
                        <path d="M20 40L30 30L20 20L10 30zM40 20L30 30L20 20L30 10zM0 20L10 30L20 20L10 10z" 
                              fill="none" 
                              stroke="#1B4B66" 
                              stroke-width="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#asanoha)"/>
            </svg>
        `;
    }

    createKikkoPattern() {
        return `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="kikko" x="0" y="0" width="46" height="80" patternUnits="userSpaceOnUse">
                        <path d="M23,0 L46,13.4 L46,40.1 L23,53.4 L0,40.1 L0,13.4 Z" 
                              fill="none" 
                              stroke="#4E6E58" 
                              stroke-width="0.5"/>
                        <path d="M23,26.7 L46,40.1 L46,66.8 L23,80.1 L0,66.8 L0,40.1 Z" 
                              fill="none" 
                              stroke="#4E6E58" 
                              stroke-width="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#kikko)"/>
            </svg>
        `;
    }

    createSayagataPattern() {
        return `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="sayagata" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M0 0L20 0L20 20L0 20zM40 0L20 0L20 20L40 20z" 
                              fill="none" 
                              stroke="#E8B62E" 
                              stroke-width="0.5"/>
                        <path d="M10 10L30 10M20 0L20 20" 
                              fill="none" 
                              stroke="#E8B62E" 
                              stroke-width="0.5"/>
                        <path d="M0 20L20 20L20 40L0 40zM40 20L20 20L20 40L40 40z" 
                              fill="none" 
                              stroke="#E8B62E" 
                              stroke-width="0.5"/>
                        <path d="M10 30L30 30M20 20L20 40" 
                              fill="none" 
                              stroke="#E8B62E" 
                              stroke-width="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sayagata)"/>
            </svg>
        `;
    }

    initializePattern() {
        if (this.container) {
            this.container.innerHTML = this.patterns[this.currentPattern];
            this.container.style.opacity = '0.07';
            this.startPatternRotation();
            this.addPatternOverlay();
        }
    }

    startPatternRotation() {
        setInterval(() => {
            this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
            this.container.style.opacity = '0';
            
            setTimeout(() => {
                this.container.innerHTML = this.patterns[this.currentPattern];
                this.container.style.opacity = '0.07';
            }, 1000);
        }, 30000); // Change pattern every 30 seconds
    }

    addPatternOverlay() {
        // Add a subtle overlay to the header
        const header = document.querySelector('header');
        const overlay = document.createElement('div');
        overlay.className = 'header-pattern';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.1;
            pointer-events: none;
            background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(this.createSeigaihaPattern())}');
        `;
        header.style.position = 'relative';
        header.appendChild(overlay);
    }
}

// Add Japanese-style decorative elements
class JapaneseDecorations {
    constructor() {
        this.addCornerDecorations();
        this.addCardDecorations();
    }

    addCornerDecorations() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const corner = document.createElement('div');
            corner.className = 'card-corner';
            corner.style.cssText = `
                position: absolute;
                top: 0;
                right: 0;
                width: 30px;
                height: 30px;
                border-top: 2px solid var(--primary);
                border-right: 2px solid var(--primary);
                opacity: 0.3;
            `;
            card.appendChild(corner);

            const cornerBottom = corner.cloneNode();
            cornerBottom.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 30px;
                height: 30px;
                border-bottom: 2px solid var(--primary);
                border-left: 2px solid var(--primary);
                opacity: 0.3;
            `;
            card.appendChild(cornerBottom);
        });
    }

    addCardDecorations() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            
            const decoration = document.createElement('div');
            decoration.className = 'stat-decoration';
            decoration.style.cssText = `
                position: absolute;
                top: -20px;
                right: -20px;
                width: 100px;
                height: 100px;
                background: var(--primary);
                opacity: 0.05;
                transform: rotate(45deg);
            `;
            card.appendChild(decoration);
        });
    }
}

// Initialize patterns and decorations when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const patterns = new JapanesePatterns();
    const decorations = new JapaneseDecorations();
}); 
