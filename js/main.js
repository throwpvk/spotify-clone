/**
 * Main Application Entry Point
 * File chính khởi tạo và điều phối toàn bộ ứng dụng
 */

import { authService } from './modules/auth.js';
import { playlistService } from './modules/playlist.js';
import { uiService } from './modules/ui.js';
import { APP_CONFIG } from './constants/config.js';

class SpotifyCloneApp {
    constructor() {
        this.isInitialized = false;
        this.services = new Map();
        this.init();
    }

    /**
     * Khởi tạo ứng dụng
     */
    async init() {
        try {
            console.log(`🚀 Khởi tạo ${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION}`);
            
            // Khởi tạo các services
            this.initializeServices();
            
            // Thiết lập event listeners
            this.setupEventListeners();
            
            // Khởi tạo UI
            this.initializeUI();
            
            // Load dữ liệu ban đầu
            await this.loadInitialData();
            
            this.isInitialized = true;
            console.log('✅ Ứng dụng đã được khởi tạo thành công');
            
        } catch (error) {
            console.error('❌ Lỗi khởi tạo ứng dụng:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Khởi tạo các services
     */
    initializeServices() {
        // Đăng ký các services
        this.services.set('auth', authService);
        this.services.set('playlist', playlistService);
        this.services.set('ui', uiService);
        
        console.log('📦 Đã khởi tạo các services');
    }

    /**
     * Thiết lập event listeners chính
     */
    setupEventListeners() {
        // Auth modal events
        this.setupAuthModalEvents();
        
        // User menu events
        this.setupUserMenuEvents();
        
        // Global events
        this.setupGlobalEvents();
        
        console.log('🎯 Đã thiết lập event listeners');
    }

    /**
     * Thiết lập auth modal events
     */
    setupAuthModalEvents() {
        const signupBtn = document.querySelector('.signup-btn');
        const loginBtn = document.querySelector('.login-btn');
        const authModal = document.getElementById('authModal');
        const modalClose = document.getElementById('modalClose');
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const showLoginBtn = document.getElementById('showLogin');
        const showSignupBtn = document.getElementById('showSignup');

        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.showSignupForm();
                uiService.openModal('authModal');
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginForm();
                uiService.openModal('authModal');
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                uiService.closeModalById('authModal');
            });
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                this.showLoginForm();
            });
        }

        if (showSignupBtn) {
            showSignupBtn.addEventListener('click', () => {
                this.showSignupForm();
            });
        }

        // Form submit events
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    /**
     * Thiết lập user menu events
     */
    setupUserMenuEvents() {
        const userAvatar = document.getElementById('userAvatar');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userAvatar) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authService.logout();
            });
        }

        // Close dropdown khi click outside
        document.addEventListener('click', () => {
            this.hideUserDropdown();
        });
    }

    /**
     * Thiết lập global events
     */
    setupGlobalEvents() {
        // Escape key để đóng modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Click outside để đóng modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                uiService.closeModal(e.target);
            }
        });
    }

    /**
     * Khởi tạo UI
     */
    initializeUI() {
        // Kiểm tra trạng thái authentication
        if (authService.isUserAuthenticated()) {
            this.updateUIForAuthenticatedUser();
        } else {
            this.updateUIForUnauthenticatedUser();
        }

        // Thiết lập tooltips
        this.setupTooltips();
        
        console.log('🎨 Đã khởi tạo UI');
    }

    /**
     * Load dữ liệu ban đầu
     */
    async loadInitialData() {
        try {
            // Load playlists và artists chỉ khi user đã đăng nhập
            if (authService.isUserAuthenticated()) {
                await Promise.all([
                    playlistService.loadAllPlaylists(),
                    playlistService.loadMyPlaylists()
                ]);
            }
            
            console.log('📊 Đã load dữ liệu ban đầu');
            
        } catch (error) {
            console.error('❌ Lỗi load dữ liệu ban đầu:', error);
        }
    }

    /**
     * Xử lý lỗi khởi tạo
     */
    handleInitializationError(error) {
        // Hiển thị thông báo lỗi cho user
        uiService.showToast('Có lỗi xảy ra khi khởi tạo ứng dụng. Vui lòng refresh trang.', 'error');
        
        // Log lỗi để debug
        console.error('Initialization error details:', error);
    }

    /**
     * Auth Form Management
     */
    
    /**
     * Hiển thị form đăng ký
     */
    showSignupForm() {
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        
        if (signupForm && loginForm) {
            signupForm.style.display = 'block';
            loginForm.style.display = 'none';
        }
    }

    /**
     * Hiển thị form đăng nhập
     */
    showLoginForm() {
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        
        if (signupForm && loginForm) {
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }

    /**
     * Xử lý đăng ký
     */
    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            await authService.register(userData);
            
            // Đóng modal sau khi đăng ký thành công
            uiService.closeModalById('authModal');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            // Error đã được xử lý trong authService
            console.error('Signup error:', error);
        }
    }

    /**
     * Xử lý đăng nhập
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            await authService.login(credentials);
            
            // Đóng modal sau khi đăng nhập thành công
            uiService.closeModalById('authModal');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            // Error đã được xử lý trong authService
            console.error('Login error:', error);
        }
    }

    /**
     * UI Management
     */
    
    /**
     * Cập nhật UI cho user đã đăng nhập
     */
    updateUIForAuthenticatedUser() {
        // Ẩn nút đăng nhập/đăng ký
        const authButtons = document.querySelectorAll('.signup-btn, .login-btn');
        authButtons.forEach(btn => btn.style.display = 'none');

        // Hiển thị user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.style.display = 'flex';
        }

        // Cập nhật avatar và tên
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            
            if (userAvatar && currentUser.avatar) {
                userAvatar.src = currentUser.avatar;
            }
            
            if (userName && currentUser.displayName) {
                userName.textContent = currentUser.displayName;
            }
        }
    }

    /**
     * Cập nhật UI cho user chưa đăng nhập
     */
    updateUIForUnauthenticatedUser() {
        // Hiển thị nút đăng nhập/đăng ký
        const authButtons = document.querySelectorAll('.signup-btn, .login-btn');
        authButtons.forEach(btn => btn.style.display = 'block');

        // Ẩn user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }

    /**
     * Toggle user dropdown
     */
    toggleUserDropdown() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.toggle('show');
        }
    }

    /**
     * Ẩn user dropdown
     */
    hideUserDropdown() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.remove('show');
        }
    }

    /**
     * Thiết lập tooltips
     */
    setupTooltips() {
        // Tooltip cho các button chính
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';
            
            element.addEventListener('mouseenter', () => {
                uiService.showTooltip(element, tooltipText, position);
            });
            
            element.addEventListener('mouseleave', () => {
                uiService.hideAllTooltips();
            });
        });
    }

    /**
     * Đóng tất cả modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            uiService.closeModal(modal);
        });
    }

    /**
     * Utility methods
     */
    
    /**
     * Lấy service theo tên
     */
    getService(name) {
        return this.services.get(name);
    }

    /**
     * Kiểm tra ứng dụng đã được khởi tạo chưa
     */
    isAppInitialized() {
        return this.isInitialized;
    }

    /**
     * Reload ứng dụng
     */
    reload() {
        window.location.reload();
    }
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    // Tạo instance của ứng dụng
    window.spotifyApp = new SpotifyCloneApp();
    
    // Export để có thể truy cập từ console
    window.app = window.spotifyApp;
});

// Export class để có thể sử dụng ở nơi khác
export default SpotifyCloneApp; 