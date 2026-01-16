document.addEventListener('DOMContentLoaded', function() {
    const requiredElements = [
        'registrationForm',
        'loginForm', 
        'registrationSection',
        'loginSection',
        'successModal',
        'showLoginBtn',
        'showRegisterBtn',
        'downloadQR',
        'goToDashboard',
        'fullName',
        'email'
    ];
    let missingElements = [];
    requiredElements.forEach(function(id) {
        if (!document.getElementById(id)) {
            missingElements.push(id);
        }
    });
    if (missingElements.length > 0) {
        console.error('Missing elements:', missingElements);
        return;
    }
    new MemoryTrailRegistration();
});

class MemoryTrailRegistration {
    constructor() {
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.registrationForm = document.getElementById('registrationForm');
        this.loginForm = document.getElementById('loginForm');
        this.registrationSection = document.getElementById('registrationSection');
        this.loginSection = document.getElementById('loginSection');
        this.successModal = document.getElementById('successModal');
        this.showLoginBtn = document.getElementById('showLoginBtn');
        this.showRegisterBtn = document.getElementById('showRegisterBtn');
        this.downloadQRBtn = document.getElementById('downloadQR');
        this.goToDashboardBtn = document.getElementById('goToDashboard');
        this.displayName = document.getElementById('displayName');
        this.displayTrailId = document.getElementById('displayTrailId');
        this.displayUsername = document.getElementById('displayUsername');
        this.cardName = document.getElementById('cardName');
        this.cardId = document.getElementById('cardId');
        this.qrcodeContainer = document.getElementById('qrcode');
    }

    initEventListeners() {
        var self = this;
        this.registrationForm.addEventListener('submit', function(e) {
            self.handleRegistration(e);
        });
        this.loginForm.addEventListener('submit', function(e) {
            self.handleLogin(e);
        });
        this.showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            self.toggleForms('login');
        });
        this.showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            self.toggleForms('register');
        });
        this.downloadQRBtn.addEventListener('click', function() {
            self.downloadQRCode();
        });
        this.goToDashboardBtn.addEventListener('click', function() {
            self.goToDashboard();
        });
    }

    handleRegistration(e) {
        e.preventDefault();
        var self = this;
        var submitBtn = document.getElementById('registerBtn');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating Account...';
        try {
            var fullName = document.getElementById('fullName').value.trim();
            var email = document.getElementById('email').value.trim().toLowerCase();
            if (!fullName || fullName.length < 2) throw new Error('Please enter your full name.');
            if (!email || !this.isValidEmail(email)) throw new Error('Please enter a valid email address.');
            if (this.checkDuplicate(email)) throw new Error('This email is already registered.');
            var trailId = this.generateTrailId();
            var username = this.generateUsername(fullName);
            var user = {
                fullName: fullName,
                email: email,
                trailId: trailId,
                username: username,
                cardVersion: 1,
                points: 0,
                completedQuizzes: [],
                completedGames: [],
                achievements: [],
                registeredAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
            this.saveUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showSuccessModal(user);
        } catch (error) {
            this.showToast(error.message, 'error');
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Create My Account';
        }
    }

    handleLogin(e) {
        e.preventDefault();
        var loginId = document.getElementById('loginId').value.trim().toUpperCase();
        if (!loginId) {
            this.showToast('Please enter your Trail ID', 'error');
            return;
        }
        var user = this.findUserByTrailId(loginId);
        if (user) {
            user.lastActive = new Date().toISOString();
            this.updateUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            this.showToast('Trail ID not found. Please check and try again.', 'error');
        }
    }

    generateTrailId() {
        var prefix = 'MT';
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var id = '';
        for (var i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        var fullId = prefix + '-' + id;
        var users = this.getAllUsers();
        var existingIds = users.map(function(u) { return u.trailId; });
        if (existingIds.includes(fullId)) {
            return this.generateTrailId();
        }
        return fullId;
    }

    generateUsername(fullName) {
        var namePart = fullName
            .toLowerCase()
            .split(' ')[0]
            .replace(/[^a-z]/g, '')
            .substring(0, 8);
        var randomNum = Math.floor(Math.random() * 9000) + 1000;
        return namePart + randomNum;
    }

    isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    checkDuplicate(email) {
        var users = this.getAllUsers();
        return users.some(function(u) { return u.email === email; });
    }

    getAllUsers() {
        try {
            var users = localStorage.getItem('memoryTrailUsers');
            return users ? JSON.parse(users) : [];
        } catch (e) {
            return [];
        }
    }

    saveUser(user) {
        var users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('memoryTrailUsers', JSON.stringify(users));
    }

    updateUser(updatedUser) {
        var users = this.getAllUsers();
        var index = -1;
        for (var i = 0; i < users.length; i++) {
            if (users[i].trailId === updatedUser.trailId) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('memoryTrailUsers', JSON.stringify(users));
        }
    }

    findUserByTrailId(trailId) {
        var users = this.getAllUsers();
        for (var i = 0; i < users.length; i++) {
            if (users[i].trailId === trailId) {
                return users[i];
            }
        }
        return null;
    }

    toggleForms(show) {
        if (show === 'login') {
            this.registrationSection.style.display = 'none';
            this.loginSection.style.display = 'block';
        } else {
            this.registrationSection.style.display = 'block';
            this.loginSection.style.display = 'none';
        }
    }

    showSuccessModal(user) {
        this.displayName.textContent = user.fullName;
        this.displayTrailId.textContent = user.trailId;
        this.displayUsername.textContent = user.username;
        this.cardName.textContent = user.fullName;
        this.cardId.textContent = user.trailId;
        this.qrcodeContainer.innerHTML = '';
        if (typeof QRCode === 'undefined') {
            this.qrcodeContainer.innerHTML = '<p style="color: red;">QR Code library failed to load</p>';
        } else {
            new QRCode(this.qrcodeContainer, {
                text: JSON.stringify({
                    trailId: user.trailId,
                    username: user.username,
                    type: 'memory-trail-user'
                }),
                width: 180,
                height: 180,
                colorDark: '#1f2937',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        this.successModal.classList.add('active');
        var submitBtn = document.getElementById('registerBtn');
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Create My Account';
    }

    downloadQRCode() {
        var qrCanvas = this.qrcodeContainer.querySelector('canvas');
        if (qrCanvas) {
            var link = document.createElement('a');
            link.download = 'memory-trail-qr-' + this.displayTrailId.textContent + '.png';
            link.href = qrCanvas.toDataURL('image/png');
            link.click();
            this.showToast('QR Code downloaded!', 'success');
        } else {
            this.showToast('QR Code not ready yet', 'error');
        }
    }

    goToDashboard() {
        window.location.href = 'dashboard.html';
    }

    showToast(message, type) {
        type = type || 'info';
        var container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function() {
            toast.remove();
        }, 3000);
    }
}