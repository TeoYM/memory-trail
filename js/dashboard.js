// ===== Memory Trail Dashboard =====

class MemoryTrailDashboard {
    constructor() {
        this.user = this.getCurrentUser();
        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }
        this.totalActivities = 4;
        this.gameIds = [
            'kiosk1-guess-the-era',
            'kiosk2-rebuilding-np',
            'kiosk3-np-trivia',
            'kiosk4-time-capsule'
        ];
        this.initDashboard();
        this.initEventListeners();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    initDashboard() {
        // Populate user info
        document.getElementById('userName').textContent = this.user.fullName.split(' ')[0];
        document.getElementById('userTrailId').textContent = this.user.trailId;
        document.getElementById('userPoints').textContent = `${this.user.points || 0} pts`;
        document.getElementById('cardDisplayName').textContent = this.user.fullName;
        document.getElementById('cardDisplayId').textContent = this.user.trailId;

        // Stats
        document.getElementById('quizzesCompleted').textContent = this.user.completedQuizzes?.length || 0;
        document.getElementById('gamesPlayed').textContent = this.user.completedGames?.length || 0;

        // Update card display
        this.updateCardDisplay();

        // Update progress
        this.updateProgress();

        // Generate QR
        this.generateQR();

        // Update activity
        this.updateActivity();

        // Update kiosk badges
        this.updateKioskBadges();
    }

    updateCardDisplay() {
        const cardElement = document.getElementById('currentCard');
        const versionLabel = document.getElementById('cardVersionLabel');
        
        // Ensure cardVersion is at least 1
        const version = this.user.cardVersion || 1;
        
        cardElement.classList.remove('card-v1', 'card-v2', 'card-v3', 'card-v4');
        cardElement.classList.add(`card-v${version}`);
        versionLabel.textContent = `Version ${version}`;
        
        const versionColors = {
            1: '#6b7280',
            2: '#10b981',
            3: '#f59e0b',
            4: '#8B5CF6'
        };
        versionLabel.style.background = versionColors[version];
    }

    updateProgress() {
        const currentVersion = this.user.cardVersion || 1;
        const completed = this.user.completedGames?.length || 0;
        const total = this.totalActivities;
        const progress = (completed / total) * 100;

        document.getElementById('upgradeProgress').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('currentPoints').textContent = `${completed}/${total} activities completed`;
        
        if (currentVersion >= 4) {
            document.getElementById('nextUpgrade').textContent = '🏆 Maximum level reached!';
        } else {
            document.getElementById('nextUpgrade').textContent = `Complete ${total - completed} more to upgrade!`;
        }
    }

    generateQR() {
        const container = document.getElementById('dashboardQR');
        container.innerHTML = '';
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: JSON.stringify({
                    trailId: this.user.trailId,
                    username: this.user.username,
                    type: 'memory-trail-user'
                }),
                width: 180,
                height: 180,
                colorDark: '#1f2937',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            container.innerHTML = '<p style="color: #ef4444;">QR Code failed to load</p>';
        }
    }

    updateActivity() {
        const registrationTime = document.getElementById('registrationTime');
        const regDate = new Date(this.user.registeredAt);
        registrationTime.textContent = this.formatTimeAgo(regDate);

        // Add completed activities to the list
        const activityContainer = document.getElementById('activityContainer');
        const completedGames = this.user.completedGames || [];
        
        const gameNames = {
            'kiosk1-guess-the-era': { name: 'Guess the Era', icon: '📷' },
            'kiosk2-rebuilding-np': { name: 'Rebuilding NP', icon: '🧩' },
            'kiosk3-np-trivia': { name: 'NP Trivia', icon: '🎯' },
            'kiosk4-time-capsule': { name: 'Time Capsule', icon: '💌' }
        };

        completedGames.forEach(gameId => {
            const game = gameNames[gameId];
            if (game) {
                const activityHTML = `
                    <div class="activity-item">
                        <div class="activity-icon">${game.icon}</div>
                        <div class="activity-details">
                            <div class="activity-title">${game.name} Completed</div>
                            <div class="activity-time">Activity completed ✓</div>
                        </div>
                    </div>
                `;
                activityContainer.insertAdjacentHTML('afterbegin', activityHTML);
            }
        });
    }

    updateKioskBadges() {
        const completedGames = this.user.completedGames || [];
        
        if (completedGames.includes('kiosk1-guess-the-era')) {
            document.getElementById('k1Badge').style.display = 'inline';
        }
        if (completedGames.includes('kiosk2-rebuilding-np')) {
            document.getElementById('k2Badge').style.display = 'inline';
        }
        if (completedGames.includes('kiosk3-np-trivia')) {
            document.getElementById('k3Badge').style.display = 'inline';
        }
        if (completedGames.includes('kiosk4-time-capsule')) {
            document.getElementById('k4Badge').style.display = 'inline';
        }
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    initEventListeners() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('kioskUser');
            window.location.href = 'index.html';
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new MemoryTrailDashboard();
});

// Export for use in other files
window.MemoryTrailDashboard = MemoryTrailDashboard;