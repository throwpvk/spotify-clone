/**
 * Application Configuration
 * Chứa các cấu hình chung của ứng dụng
 */

export const APP_CONFIG = {
  // App settings
  APP_NAME: "Spotify Clone",
  VERSION: "1.0.0",

  // UI settings
  TOOLTIP_DELAY: 500, // milliseconds
  TOAST_DURATION: 3000, // milliseconds
  MODAL_ANIMATION_DURATION: 300, // milliseconds

  // API settings
  API_TIMEOUT: 10000, // milliseconds
  MAX_RETRY_ATTEMPTS: 3,

  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
  },

  // Local storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "spotify_clone_auth_token",
    USER_DATA: "spotify_clone_user_data",
  },

  // Default values
  DEFAULTS: {
    PLAYLIST_NAME: "My Playlist",
    PLAYLIST_DESCRIPTION: "Created with Spotify Clone",
    PLAYLIST_IMAGE: "assets/images/default-playlist.png",
  },
};
