/**
 * Authentication Module
 * Module xử lý tất cả logic liên quan đến authentication
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';
import { APP_CONFIG } from '../constants/config.js';
import { MESSAGES } from '../constants/messages.js';
import { uiService } from './ui.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    /**
     * Khởi tạo service
     */
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    /**
     * Kiểm tra trạng thái authentication
     */
    checkAuthStatus() {
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);

        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUIForAuthenticatedUser();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        } else {
            this.updateUIForUnauthenticatedUser();
        }
    }

    /**
     * Thiết lập event listeners
     */
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // User avatar click
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }
    }

    /**
     * Validation cho form đăng ký
     */
    validateRegistration(data) {
        const errors = [];

        if (!data.email || !APP_CONFIG.VALIDATION.EMAIL_REGEX.test(data.email)) {
            errors.push(MESSAGES.ERROR.INVALID_EMAIL);
        }

        if (!data.password || data.password.length < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
            errors.push(MESSAGES.ERROR.PASSWORD_TOO_SHORT);
        }

        if (!data.username || data.username.length < APP_CONFIG.VALIDATION.USERNAME_MIN_LENGTH) {
            errors.push('Tên người dùng phải có ít nhất 3 ký tự');
        }

        return errors;
    }

    /**
     * Validation cho form đăng nhập
     */
    validateLogin(data) {
        const errors = [];

        if (!data.email || !APP_CONFIG.VALIDATION.EMAIL_REGEX.test(data.email)) {
            errors.push(MESSAGES.ERROR.INVALID_EMAIL);
        }

        if (!data.password) {
            errors.push('Vui lòng nhập mật khẩu');
        }

        return errors;
    }

    /**
     * Đăng ký tài khoản mới
     */
    async register(userData) {
        try {
            // Validation
            const validationErrors = this.validateRegistration(userData);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }

            // Gọi API đăng ký
            const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData, {
                includeAuth: false
            });

            // Lưu thông tin user và token
            this.currentUser = response.user;
            this.isAuthenticated = true;
            this.saveUserData(response);

            // Hiển thị thông báo thành công
            uiService.showToast(MESSAGES.SUCCESS.REGISTER, 'success');
            
            // Tự động đăng nhập sau khi đăng ký
            await this.login({
                email: userData.email,
                password: userData.password
            });

            return response;

        } catch (error) {
            uiService.showToast(error.message, 'error');
            throw error;
        }
    }

    /**
     * Đăng nhập
     */
    async login(credentials) {
        try {
            // Validation
            const validationErrors = this.validateLogin(credentials);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }

            // Gọi API đăng nhập
            const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials, {
                includeAuth: false
            });

            // Lưu thông tin user và token
            this.currentUser = response.user;
            this.isAuthenticated = true;
            this.saveUserData(response);

            // Hiển thị thông báo thành công
            uiService.showToast(MESSAGES.SUCCESS.LOGIN, 'success');

            // Cập nhật UI
            this.updateUIForAuthenticatedUser();

            return response;

        } catch (error) {
            uiService.showToast(error.message, 'error');
            throw error;
        }
    }

    /**
     * Đăng xuất
     */
    async logout() {
        try {
            // Gọi API đăng xuất
            if (this.isAuthenticated) {
                await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Xóa dữ liệu local
            this.clearUserData();
            
            // Cập nhật trạng thái
            this.currentUser = null;
            this.isAuthenticated = false;

            // Cập nhật UI
            this.updateUIForUnauthenticatedUser();

            // Hiển thị thông báo
            uiService.showToast(MESSAGES.SUCCESS.LOGOUT, 'success');

            // Chuyển về trang chủ
            this.redirectToHome();
        }
    }

    /**
     * Lưu thông tin user vào localStorage
     */
    saveUserData(response) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    }

    /**
     * Xóa thông tin user khỏi localStorage
     */
    clearUserData() {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    }

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
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (userAvatar && this.currentUser?.avatar) {
            userAvatar.src = this.currentUser.avatar;
        }
        
        if (userName && this.currentUser?.displayName) {
            userName.textContent = this.currentUser.displayName;
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
     * Chuyển về trang chủ
     */
    redirectToHome() {
        // Có thể sử dụng router hoặc reload page
        window.location.reload();
    }

    /**
     * Kiểm tra user có đăng nhập không
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Lấy thông tin user hiện tại
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Export instance singleton
export const authService = new AuthService();
export default authService; 