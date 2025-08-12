/**
 * UI Module
 * Module xử lý tất cả các component UI như modal, toast, tooltip
 */

import { APP_CONFIG } from '../constants/config.js';
import { MESSAGES } from '../constants/messages.js';

class UIService {
    constructor() {
        this.activeModals = new Set();
        this.activeTooltips = new Set();
        this.toastQueue = [];
        this.isShowingToast = false;
        this.init();
    }

    /**
     * Khởi tạo service
     */
    init() {
        this.setupGlobalEventListeners();
        this.createToastContainer();
        this.disableContextMenu();
        this.disableUserSelect();
    }

    /**
     * Thiết lập global event listeners
     */
    setupGlobalEventListeners() {
        // Close modals khi click outside
        document.addEventListener('click', (e) => {
            this.activeModals.forEach(modal => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Close modals với Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.activeModals.forEach(modal => {
                    this.closeModal(modal);
                });
            }
        });

        // Close tooltips khi click outside
        document.addEventListener('click', () => {
            this.hideAllTooltips();
        });
    }

    /**
     * Vô hiệu hóa context menu
     */
    disableContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Vô hiệu hóa user select
     */
    disableUserSelect() {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
    }

    /**
     * Modal Management
     */
    
    /**
     * Mở modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            this.activeModals.add(modal);
            document.body.style.overflow = 'hidden';
            
            // Focus vào input đầu tiên
            const firstInput = modal.querySelector('input, textarea, button');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    /**
     * Đóng modal
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            this.activeModals.delete(modal);
            
            // Kiểm tra nếu không còn modal nào
            if (this.activeModals.size === 0) {
                document.body.style.overflow = 'auto';
            }
        }
    }

    /**
     * Đóng modal theo ID
     */
    closeModalById(modalId) {
        const modal = document.getElementById(modalId);
        this.closeModal(modal);
    }

    /**
     * Toast Management
     */
    
    /**
     * Tạo toast container
     */
    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    /**
     * Hiển thị toast message
     */
    showToast(message, type = 'info', duration = APP_CONFIG.TOAST_DURATION) {
        const toast = this.createToastElement(message, type);
        this.toastQueue.push({ toast, duration });
        
        if (!this.isShowingToast) {
            this.processToastQueue();
        }
    }

    /**
     * Tạo toast element
     */
    createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon ${icon}"></i>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return toast;
    }

    /**
     * Lấy icon cho toast
     */
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Xử lý toast queue
     */
    async processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.isShowingToast = false;
            return;
        }

        this.isShowingToast = true;
        const { toast, duration } = this.toastQueue.shift();
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Animation in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
                this.processToastQueue();
            }, 300);
        }, duration);
    }

    /**
     * Tooltip Management
     */
    
    /**
     * Tạo tooltip
     */
    createTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.setAttribute('data-position', position);
        
        document.body.appendChild(tooltip);
        this.activeTooltips.add(tooltip);
        
        // Position tooltip
        this.positionTooltip(tooltip, element, position);
        
        return tooltip;
    }

    /**
     * Định vị tooltip
     */
    positionTooltip(tooltip, element, position) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = elementRect.top - tooltipRect.height - 8;
                left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = elementRect.bottom + 8;
                left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
                left = elementRect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
                left = elementRect.right + 8;
                break;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    /**
     * Hiển thị tooltip
     */
    showTooltip(element, text, position = 'top') {
        // Ẩn tất cả tooltip hiện tại
        this.hideAllTooltips();
        
        // Tạo tooltip mới
        const tooltip = this.createTooltip(element, text, position);
        
        // Tự động ẩn sau delay
        setTimeout(() => {
            this.hideTooltip(tooltip);
        }, APP_CONFIG.TOOLTIP_DELAY);
    }

    /**
     * Ẩn tooltip
     */
    hideTooltip(tooltip) {
        if (tooltip && tooltip.parentElement) {
            tooltip.remove();
            this.activeTooltips.delete(tooltip);
        }
    }

    /**
     * Ẩn tất cả tooltip
     */
    hideAllTooltips() {
        this.activeTooltips.forEach(tooltip => {
            this.hideTooltip(tooltip);
        });
    }

    /**
     * Loading Management
     */
    
    /**
     * Hiển thị loading
     */
    showLoading(container, message = MESSAGES.INFO.LOADING) {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        
        container.appendChild(loading);
        return loading;
    }

    /**
     * Ẩn loading
     */
    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentElement) {
            loadingElement.remove();
        }
    }

    /**
     * Form Management
     */
    
    /**
     * Reset form
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    /**
     * Validate form
     */
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return { isValid: false, errors: [] };
        
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        const errors = [];
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                errors.push(`${input.name || input.placeholder} là bắt buộc`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Error Management
     */
    
    /**
     * Hiển thị error
     */
    showError(message, container = null) {
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            container.appendChild(errorDiv);
            
            // Tự động xóa sau 5 giây
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 5000);
        } else {
            this.showToast(message, 'error');
        }
    }

    /**
     * Clear errors
     */
    clearErrors(container) {
        const errors = container.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
    }
}

// Export instance singleton
export const uiService = new UIService();
export default uiService; 