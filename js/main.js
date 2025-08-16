/**
 * Main Application Entry Point
 */

import { uiService } from "./modules/ui.js";
import { authService } from "./modules/auth.js";
import { playlistService } from "./modules/playlist.js";
import { homeService } from "./modules/home.js";

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
      // Khởi tạo các services cần thiết
      this.services.set("ui", uiService);
      this.services.set("auth", authService);
      this.services.set("playlist", playlistService);
      this.services.set("home", homeService);

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
  getAllServices() {
    return Object.fromEntries(this.services);
  }
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  window.spotifyApp = new SpotifyApp();
});
