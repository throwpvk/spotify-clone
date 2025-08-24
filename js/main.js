import { authService } from "./modules/auth.js";
import { uiService } from "./modules/ui.js";
import { apiService } from "./modules/api.js";
import { home } from "./modules/home.js";
import { library } from "./modules/library.js";
import { authUI } from "./modules/auth-ui.js";

class SpotifyApp {
  constructor() {
    this.services = new Map();
    this._init();
  }

  /**
   * Khởi tạo app
   */
  _init() {
    try {
      // Đăng ký services
      this.services.set("auth", authService);
      this.services.set("ui", uiService);
      this.services.set("api", apiService);
      this.services.set("home", home);
      this.services.set("library", library);
      this.services.set("authUI", authUI);
    } catch (error) {
      console.error("Lỗi khởi tạo app:", error);
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
document.addEventListener("DOMContentLoaded", async () => {
  window.spotifyApp = new SpotifyApp();
  
  // Load content data (không cần auth)
  await window.spotifyApp.getService("api").loadContentData();
  
  // Kiểm tra auth trước khi load library
  const authService = window.spotifyApp.getService("auth");
  if (authService && authService.isUserAuthenticated()) {
    await window.spotifyApp.getService("api").loadLibraryData();
  }
  
  window.spotifyApp.getService("home").renderHomePage();
});
