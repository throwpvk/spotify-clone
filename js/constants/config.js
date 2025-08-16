/**
 * Application Configuration Constants
 * Cấu hình chung cho ứng dụng Spotify Clone
 */

export const APP_CONFIG = {
  // Thông tin ứng dụng
  APP_NAME: "Spotify Clone",
  VERSION: "1.0.0",
  DESCRIPTION: "Ứng dụng nghe nhạc trực tuyến",

  // API Configuration
  API: {
    BASE_URL: "https://spotify.f8team.dev/api",
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  },

  // Storage Keys - Cho việc lưu trữ authentication
  STORAGE_KEYS: {
    AUTH_TOKEN: "spotify_auth_token",
    USER_DATA: "spotify_user_data",
    REFRESH_TOKEN: "spotify_refresh_token",
  },

  // Validation Rules
  VALIDATION: {
    // Email validation
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // Password validation - tối thiểu 6 ký tự, bao gồm chữ hoa, thường và số
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
    PASSWORD_MIN_LENGTH: 6,

    // Username validation
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,

    // Display name validation
    DISPLAY_NAME_MIN_LENGTH: 2,
    DISPLAY_NAME_MAX_LENGTH: 50,

    // Bio validation
    BIO_MAX_LENGTH: 500,
  },

  // Default Values
  DEFAULTS: {
    USER_BIO: "Người dùng Spotify Clone",
    USER_COUNTRY: "VN",
    PLAYLIST_NAME: "My Playlist",
    PLAYLIST_DESCRIPTION: "Playlist của tôi",
    PLAYLIST_IMAGE: "default-playlist.jpg",
  },

  // Toast Configuration
  TOAST: {
    DURATION: 3000, // 3 seconds
    POSITION: "top-right",
  },

  // Modal Configuration
  MODAL: {
    ANIMATION_DURATION: 300, // milliseconds
    BACKDROP_OPACITY: 0.5,
  },
};
