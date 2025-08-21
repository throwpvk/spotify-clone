/**
 * Main Application Entry Point
 */

import { contentService } from "./modules/content.js";
import { authService } from "./modules/auth.js";
import { uiService } from "./modules/ui.js";
import { apiService } from "./modules/api.js";
import { homeRenderer } from "./modules/home-renderer.js";
import { authUI } from "./modules/auth-ui.js";
import { libraryRenderer } from "./modules/library-renderer.js";

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
      this.services.set("content", contentService);
      this.services.set("auth", authService);
      this.services.set("ui", uiService);
      this.services.set("api", apiService);
      this.services.set("homeRenderer", homeRenderer);
      this.services.set("authUI", authUI);
      this.services.set("libraryRenderer", libraryRenderer);

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

  /**
   * Lấy tất cả services
   */
  // getAllServices() {
  //   return Object.fromEntries(this.services);
  // }
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  window.spotifyApp = new SpotifyApp();
});
