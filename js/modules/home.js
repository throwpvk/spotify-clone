/**
 * Home Service Module
 * Service xử lý tất cả logic liên quan đến trang Home
 */

import { apiService } from "./api.js";
import { MESSAGES } from "../constants/messages.js";

class HomeService {
  constructor() {
    this.todaysHits = [];
    this.popularArtists = [];
    this.isLoading = false;
    this._init();
  }

  /**
   * Khởi tạo service
   */
  async _init() {
    try {
      await this._loadHomeData();
    } catch (error) {
      console.error("Error initializing home service:", error);
    }
  }

  /**
   * Load tất cả dữ liệu cho trang Home
   */
  async _loadHomeData() {
    try {
      this.isLoading = true;

      // Load song song cả hai API
      const [playlistsResponse, artistsResponse] = await Promise.all([
        this._loadTodaysHits(),
        this._loadPopularArtists(),
      ]);

      console.log("Home data loaded successfully");
      console.log(`- Today's biggest hits: ${this.todaysHits.length} items`);
      console.log(`- Popular artists: ${this.popularArtists.length} items`);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load "Today's biggest hits" - API Playlists/Get All Playlists
   */
  async _loadTodaysHits() {
    try {
      const response = await apiService.getAllPlaylists(20, 0);

      if (response.success) {
        // API trả về { playlists: [...] } thay vì trực tiếp array
        this.todaysHits = response.data.playlists || response.data || [];
        console.log(
          `Loaded ${this.todaysHits.length} playlists for Today's biggest hits`
        );
      } else {
        console.error("Failed to load Today's biggest hits");
        this.todaysHits = [];
      }
    } catch (error) {
      console.error("Error loading Today's biggest hits:", error);
      this.todaysHits = [];
    }
  }

  /**
   * Load "Popular artists" - API Artists/Get All Artists
   */
  async _loadPopularArtists() {
    try {
      const response = await apiService.getAllArtists(20, 0);

      if (response.success) {
        // API trả về { artists: [...] } thay vì trực tiếp array
        this.popularArtists = response.data.artists || response.data || [];
        console.log(
          `Loaded ${this.popularArtists.length} artists for Popular artists`
        );
      } else {
        console.error("Failed to load Popular artists");
        this.popularArtists = [];
      }
    } catch (error) {
      console.error("Error loading Popular artists:", error);
      this.popularArtists = [];
    }
  }

  /**
   * Refresh dữ liệu trang Home
   */
  async refreshHomeData() {
    await this._loadHomeData();
  }

  // ===== PUBLIC METHODS =====

  /**
   * Lấy dữ liệu "Today's biggest hits"
   */
  getTodaysHits() {
    return this.todaysHits;
  }

  /**
   * Lấy dữ liệu "Popular artists"
   */
  getPopularArtists() {
    return this.popularArtists;
  }

  /**
   * Kiểm tra đang loading
   */
  getIsLoading() {
    return this.isLoading;
  }

  /**
   * Lấy tổng số items
   */
  getTotalItems() {
    return this.todaysHits.length + this.popularArtists.length;
  }
}

// Export singleton instance
export const homeService = new HomeService();
