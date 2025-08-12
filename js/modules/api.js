/**
 * API Module
 * Module chính xử lý tất cả HTTP requests đến server
 */

import { API_BASE_URL, API_ENDPOINTS, HTTP_METHODS } from '../constants/api.js';
import { APP_CONFIG } from '../constants/config.js';
import { MESSAGES } from '../constants/messages.js';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = APP_CONFIG.API_TIMEOUT;
        this.maxRetries = APP_CONFIG.MAX_RETRY_ATTEMPTS;
    }

    /**
     * Lấy auth token từ localStorage
     */
    getAuthToken() {
        return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Tạo headers cho request
     */
    createHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * Xử lý response từ API
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Thực hiện HTTP request với retry logic
     */
    async makeRequest(endpoint, options = {}, retryCount = 0) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                method: options.method || HTTP_METHODS.GET,
                headers: this.createHeaders(options.includeAuth !== false),
                ...options
            };

            // Xử lý body
            if (options.body && typeof options.body === 'object') {
                config.body = JSON.stringify(options.body);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return await this.handleResponse(response);

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(MESSAGES.ERROR.NETWORK_ERROR);
            }

            if (retryCount < this.maxRetries) {
                console.log(`Retry attempt ${retryCount + 1} for ${endpoint}`);
                return this.makeRequest(endpoint, options, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.makeRequest(endpoint, { ...options, method: HTTP_METHODS.GET });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}, options = {}) {
        return this.makeRequest(endpoint, { 
            ...options, 
            method: HTTP_METHODS.POST, 
            body: data 
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}, options = {}) {
        return this.makeRequest(endpoint, { 
            ...options, 
            method: HTTP_METHODS.PUT, 
            body: data 
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.makeRequest(endpoint, { ...options, method: HTTP_METHODS.DELETE });
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            method: HTTP_METHODS.POST,
            headers: this.createHeaders(options.includeAuth !== false),
            body: formData,
            ...options
        };

        // Không set Content-Type cho FormData
        delete config.headers['Content-Type'];

        return this.makeRequest(endpoint, config);
    }
}

// Export instance singleton
export const apiService = new ApiService();
export default apiService; 