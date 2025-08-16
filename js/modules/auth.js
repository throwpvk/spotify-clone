/**
 * Authentication Service Module
 * Service xử lý tất cả logic liên quan đến authentication
 */

import { apiService } from "./api.js";
import { APP_CONFIG } from "../constants/config.js";
import { MESSAGES } from "../constants/messages.js";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this._init();
  }

  /**
   * Khởi tạo service
   */
  async _init() {
    try {
      // Kiểm tra authentication hiện tại
      await this._checkExistingAuth();

      // Lắng nghe thay đổi localStorage để sync giữa các tab
      this._setupStorageListener();

      this.isInitialized = true;
      console.log("Auth service initialized successfully");
    } catch (error) {
      console.error("Error initializing auth service:", error);
    }
  }

  /**
   * Kiểm tra authentication hiện tại
   */
  async _checkExistingAuth() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);

    // Kiểm tra token hợp lệ
    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      token.trim() === ""
    ) {
      console.log("No valid token found, clearing auth data");
      this._clearAuthData();
      return;
    }

    if (token && userData) {
      try {
        // Validate token với server
        await this._validateToken();

        // Parse user data
        this.currentUser = JSON.parse(userData);

        console.log(
          "User session restored:",
          this.currentUser.display_name || this.currentUser.username
        );

        // Cập nhật UI
        this._updateUI();
      } catch (error) {
        console.error("Token validation failed:", error);
        this._clearAuthData();
      }
    } else {
      console.log("No existing session found");
    }
  }

  /**
   * Validate token với server
   */
  async _validateToken() {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        // Token hợp lệ, cập nhật user data nếu cần
        const serverUserData = response.data;
        if (
          serverUserData &&
          JSON.stringify(serverUserData) !==
            localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA)
        ) {
          this.currentUser = serverUserData;
          localStorage.setItem(
            APP_CONFIG.STORAGE_KEYS.USER_DATA,
            JSON.stringify(serverUserData)
          );
        }
      }
    } catch (error) {
      if (error.status === 401) {
        // Token không hợp lệ, clear auth data
        throw new Error("Token expired or invalid");
      }
      throw error;
    }
  }

  /**
   * Lắng nghe thay đổi localStorage
   */
  _setupStorageListener() {
    window.addEventListener("storage", this._handleStorageChange.bind(this));
  }

  /**
   * Xử lý thay đổi localStorage
   */
  _handleStorageChange(e) {
    if (e.key === APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN) {
      if (!e.newValue) {
        // Token bị xóa ở tab khác, logout
        console.log("Token removed in another tab, logging out");
        this._clearAuthData();
        this._updateUI();
      } else if (e.newValue !== e.oldValue) {
        // Token thay đổi, reload user data
        console.log("Token changed in another tab, reloading user data");
        this._checkExistingAuth();
      }
    }
  }

  /**
   * Lưu authentication data
   */
  _saveAuthData(accessToken, refreshToken, user) {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, accessToken);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.USER_DATA,
      JSON.stringify(user)
    );

    console.log("Auth data saved to localStorage");
    console.log(
      "Access token:",
      accessToken ? `${accessToken.substring(0, 20)}...` : "undefined"
    );
    console.log(
      "Refresh token:",
      refreshToken ? `${refreshToken.substring(0, 20)}...` : "undefined"
    );
  }

  /**
   * Xóa authentication data
   */
  _clearAuthData() {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);

    this.currentUser = null;

    console.log("Auth data cleared from localStorage");
  }

  /**
   * Cập nhật UI dựa trên trạng thái authentication
   */
  _updateUI() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        if (this.currentUser) {
          uiService.updateUIForAuthenticatedUser(this.currentUser);
        } else {
          uiService.updateUIForUnauthenticatedUser();
        }
      }
    }
  }

  /**
   * Validate dữ liệu đăng ký
   */
  _validateRegistrationData(userData) {
    const errors = [];

    // Validate username
    if (!userData.username) {
      errors.push("Tên người dùng là bắt buộc");
    } else if (
      userData.username.length < APP_CONFIG.VALIDATION.USERNAME_MIN_LENGTH
    ) {
      errors.push(
        `Tên người dùng phải có ít nhất ${APP_CONFIG.VALIDATION.USERNAME_MIN_LENGTH} ký tự`
      );
    } else if (
      userData.username.length > APP_CONFIG.VALIDATION.USERNAME_MAX_LENGTH
    ) {
      errors.push(
        `Tên người dùng không được quá ${APP_CONFIG.VALIDATION.USERNAME_MAX_LENGTH} ký tự`
      );
    } else if (!APP_CONFIG.VALIDATION.USERNAME_REGEX.test(userData.username)) {
      errors.push("Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới");
    }

    // Validate email
    if (!userData.email) {
      errors.push("Email là bắt buộc");
    } else if (!APP_CONFIG.VALIDATION.EMAIL_REGEX.test(userData.email)) {
      errors.push("Email không hợp lệ");
    }

    // Validate password
    if (!userData.password) {
      errors.push("Mật khẩu là bắt buộc");
    } else if (
      userData.password.length < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH
    ) {
      errors.push(
        `Mật khẩu phải có ít nhất ${APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`
      );
    } else if (!APP_CONFIG.VALIDATION.PASSWORD_REGEX.test(userData.password)) {
      errors.push("Mật khẩu phải bao gồm chữ hoa, chữ thường và số");
    }

    return errors;
  }

  /**
   * Validate dữ liệu đăng nhập
   */
  _validateLoginData(credentials) {
    const errors = [];

    if (!credentials.email) {
      errors.push("Email là bắt buộc");
    } else if (!APP_CONFIG.VALIDATION.EMAIL_REGEX.test(credentials.email)) {
      errors.push("Email không hợp lệ");
    }

    if (!credentials.password) {
      errors.push("Mật khẩu là bắt buộc");
    }

    return errors;
  }

  /**
   * Xử lý API error
   */
  _handleApiError(error) {
    if (error.isApiError && error.data) {
      // Xử lý error từ API
      if (error.status === 400) {
        if (error.data.message) {
          return error.data.message;
        }
        // Xử lý các trường hợp cụ thể
        if (error.data.email && error.data.email.includes("already exists")) {
          return MESSAGES.AUTH.REGISTER_EMAIL_EXISTS;
        }
        if (
          error.data.username &&
          error.data.username.includes("already exists")
        ) {
          return MESSAGES.AUTH.REGISTER_USERNAME_EXISTS;
        }
      } else if (error.status === 401) {
        return MESSAGES.AUTH.LOGIN_INVALID_CREDENTIALS;
      }
    }

    // Fallback error message
    return error.message || "Có lỗi xảy ra";
  }

  // ===== PUBLIC METHODS =====

  /**
   * Đăng ký tài khoản mới
   */
  async register(userData) {
    try {
      // Validation dữ liệu
      const validationErrors = this._validateRegistrationData(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      // Chuẩn bị data cho API
      const apiData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        display_name: userData.display_name || userData.username,
        bio: userData.bio || APP_CONFIG.DEFAULTS.USER_BIO,
        country: userData.country || APP_CONFIG.DEFAULTS.USER_COUNTRY,
      };

      // Gọi API đăng ký
      const response = await apiService.register(apiData);

      if (response.success) {
        // Đăng ký thành công, tự động đăng nhập
        const loginData = {
          email: userData.email,
          password: userData.password,
        };

        await this.login(loginData);

        // Hiển thị toast thành công
        if (window.spotifyApp && window.spotifyApp.getService) {
          const uiService = window.spotifyApp.getService("ui");
          if (uiService) {
            uiService.showToast(MESSAGES.AUTH.REGISTER_SUCCESS, "success");
          }
        }

        return response.data;
      }
    } catch (error) {
      const errorMessage = this._handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Đăng nhập
   */
  async login(credentials) {
    try {
      // Validation dữ liệu
      const validationErrors = this._validateLoginData(credentials);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      // Gọi API đăng nhập
      const response = await apiService.login(credentials);

      if (response.success) {
        // Xử lý response format đúng từ API
        const { access_token, refresh_token, user } = response.data;

        // Lưu authentication data
        this._saveAuthData(access_token, refresh_token, user);
        this.currentUser = user;

        console.log("Login successful:", user.display_name || user.username);

        // Cập nhật UI
        this._updateUI();

        // Hiển thị toast thành công
        if (window.spotifyApp && window.spotifyApp.getService) {
          const uiService = window.spotifyApp.getService("ui");
          if (uiService) {
            uiService.showToast(MESSAGES.AUTH.LOGIN_SUCCESS, "success");
          }
        }

        return user;
      }
    } catch (error) {
      const errorMessage = this._handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Đăng xuất
   */
  logout() {
    // Clear authentication data
    this._clearAuthData();

    console.log("User logged out successfully");

    // Cập nhật UI
    this._updateUI();

    // Hiển thị toast thành công
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.showToast(MESSAGES.AUTH.LOGOUT_SUCCESS, "success");
      }
    }

    // Chuyển về trang chủ
    window.location.href = "/";
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isUserAuthenticated() {
    return (
      !!this.currentUser &&
      !!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
    );
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Lấy auth token
   */
  getAuthToken() {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Kiểm tra service đã khởi tạo chưa
   */
  isInitialized() {
    return this.isInitialized;
  }

  /**
   * Refresh user data từ server
   */
  async refreshUserData() {
    if (this.isUserAuthenticated()) {
      try {
        await this._validateToken();
        return this.currentUser;
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        this.logout();
        throw error;
      }
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
