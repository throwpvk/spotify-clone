/**
 * Main Application Entry Point
 */

import { authService } from "./modules/auth.js";
import { uiService } from "./modules/ui.js";
import { apiService } from "./modules/api.js";
import { home } from "./modules/home.js";
import { library } from "./modules/library.js";
import { authUI } from "./modules/auth-ui.js";
import { contentService } from "./modules/content.js";

class SpotifyApp {
  constructor() {
    this.services = new Map();
    this._init();
  }

  /**
   * Khởi tạo ứng dụng
   */
  _init() {
    try {
      // Đăng ký các services
      this.services.set("auth", authService);
      this.services.set("ui", uiService);
      this.services.set("api", apiService);
      this.services.set("home", home);
      this.services.set("library", library);
      this.services.set("authUI", authUI);
      this.services.set("content", contentService);

      console.log("Spotify Clone App initialized successfully!");
    } catch (error) {
      console.error("Error initializing Spotify App:", error);
    }
  }

  /**
   * Lấy service theo tên
   */
  getService(serviceName) {
    return this.services.get(serviceName);
  }
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  window.spotifyApp = new SpotifyApp();
});
