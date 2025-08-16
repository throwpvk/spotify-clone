/**
 * API Service Module
 * Service xử lý tất cả HTTP requests đến API
 */

import { API_ENDPOINTS, APP_CONFIG } from "../constants/index.js";

class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.API.BASE_URL;
    this.timeout = APP_CONFIG.API.TIMEOUT;
    this.retryAttempts = APP_CONFIG.API.RETRY_ATTEMPTS;
  }

  // ===== CORE REQUEST METHODS =====

  /**
   * Thực hiện HTTP request
   */
  async _makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...this._getAuthHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return await this._handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this._handleError(error);
    }
  }

  /**
   * Xử lý response từ API
   */
  async _handleResponse(response) {
    if (!response.ok) {
      const errorData = await this._parseErrorResponse(response);
      throw this._createApiError(response.status, errorData);
    }

    try {
      const data = await response.json();
      return {
        success: true,
        data: data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      return {
        success: true,
        data: null,
        status: response.status,
        headers: response.headers,
      };
    }
  }

  /**
   * Parse error response
   */
  async _parseErrorResponse(response) {
    try {
      return await response.json();
    } catch {
      return {
        message: response.statusText || "Unknown error",
        status: response.status,
      };
    }
  }

  /**
   * Tạo API error object
   */
  _createApiError(status, data) {
    const error = new Error(data.message || "API Error");
    error.status = status;
    error.data = data;
    error.isApiError = true;
    return error;
  }

  /**
   * Xử lý error
   */
  _handleError(error) {
    if (error.name === "AbortError") {
      error.message = "Request timeout";
      error.status = 408;
    } else if (error.isApiError) {
      return error;
    } else {
      error.message = "Network error";
      error.status = 0;
    }
    return error;
  }

  /**
   * Lấy auth headers - Tự động thêm token nếu có
   */
  _getAuthHeaders() {
    const token = this._getAuthToken();

    if (token) {
      console.log(
        "Adding auth header with token:",
        `${token.substring(0, 20)}...`
      );
      return { Authorization: `Bearer ${token}` };
    }

    return {};
  }

  /**
   * Lấy auth token từ localStorage
   */
  _getAuthToken() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

    // Kiểm tra token hợp lệ
    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      token.trim() === ""
    ) {
      console.warn("Invalid or missing auth token");
      return null;
    }

    return token;
  }

  /**
   * Kiểm tra có token không
   */
  _hasAuthToken() {
    return !!this._getAuthToken();
  }

  // ===== PUBLIC HTTP METHODS =====

  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this._makeRequest(fullUrl, {
      method: "GET",
    });
  }

  async post(url, data = {}) {
    return this._makeRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(url, data = {}) {
    return this._makeRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(url) {
    return this._makeRequest(url, {
      method: "DELETE",
    });
  }

  // ===== AUTHENTICATION API =====

  /**
   * Đăng ký tài khoản
   */
  async register(userData) {
    return this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  /**
   * Đăng nhập
   */
  async login(credentials) {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  // ===== USER API =====

  /**
   * Lấy thông tin user hiện tại - Cần authentication
   */
  async getProfile() {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }
    return this.get(API_ENDPOINTS.USER.PROFILE);
  }

  // ===== PLAYLISTS API (Today's biggest hits) =====

  /**
   * Lấy tất cả playlists
   */
  async getAllPlaylists(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${API_ENDPOINTS.PLAYLISTS.GET_ALL}?${params}`);
  }

  /**
   * Lấy playlist theo ID
   */
  async getPlaylistById(id) {
    return this.get(`${API_ENDPOINTS.PLAYLISTS.GET_BY_ID}/${id}`);
  }

  /**
   * Lấy playlists của user hiện tại - Cần authentication
   */
  async getMyPlaylists(limit = 20, offset = 0) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${API_ENDPOINTS.ME.PLAYLISTS}?${params}`);
  }

  // ===== ARTISTS API (Popular artists) =====

  /**
   * Lấy tất cả artists
   */
  async getAllArtists(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${API_ENDPOINTS.ARTISTS.GET_ALL}?${params}`);
  }

  /**
   * Lấy artist theo ID
   */
  async getArtistById(id) {
    return this.get(`${API_ENDPOINTS.ARTISTS.GET_BY_ID}/${id}`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
