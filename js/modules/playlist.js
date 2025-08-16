/**
 * Playlist Service Module
 * Service xử lý tất cả logic liên quan đến playlists
 */

import { apiService } from "./api.js";
import { authService } from "./auth.js";
import { MESSAGES } from "../constants/messages.js";

class PlaylistService {
  constructor() {
    this.playlists = [];
    this.myPlaylists = [];
    this.isLoading = false;
    this._init();
  }

  /**
   * Khởi tạo service
   */
  async _init() {
    try {
      // Load public playlists trước
      await this._loadAllPlaylists();

      // Load user-specific playlists nếu đã đăng nhập
      if (authService.isUserAuthenticated()) {
        await this._loadMyPlaylists();
      }
    } catch (error) {
      console.error("Error initializing playlist service:", error);
    }
  }

  /**
   * Load tất cả playlists (Today's biggest hits)
   */
  async _loadAllPlaylists() {
    try {
      this.isLoading = true;
      const response = await apiService.getAllPlaylists(20, 0);

      if (response.success) {
        this.playlists = response.data || [];
        console.log(`Loaded ${this.playlists.length} public playlists`);
      }
    } catch (error) {
      console.error("Error loading public playlists:", error);
      this.playlists = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load playlists của user hiện tại - Cần authentication
   */
  async _loadMyPlaylists() {
    try {
      if (!authService.isUserAuthenticated()) {
        console.log("User not authenticated, skipping my playlists load");
        return;
      }

      this.isLoading = true;
      const response = await apiService.getMyPlaylists(20, 0);

      if (response.success) {
        this.myPlaylists = response.data || [];
        console.log(`Loaded ${this.myPlaylists.length} user playlists`);
      }
    } catch (error) {
      console.error("Error loading my playlists:", error);
      this.myPlaylists = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Refresh playlists
   */
  async refreshPlaylists() {
    await this._loadAllPlaylists();
    if (authService.isUserAuthenticated()) {
      await this._loadMyPlaylists();
    }
  }

  // ===== PUBLIC METHODS =====

  /**
   * Lấy playlist theo ID
   */
  getPlaylistById(id) {
    // Tìm trong tất cả danh sách
    let playlist = this.playlists.find((playlist) => playlist.id === id);
    if (!playlist) {
      playlist = this.myPlaylists.find((playlist) => playlist.id === id);
    }
    return playlist;
  }

  /**
   * Lấy tất cả playlists (public)
   */
  getAllPlaylists() {
    return this.playlists;
  }

  /**
   * Lấy playlists của user hiện tại
   */
  getMyPlaylists() {
    return this.myPlaylists;
  }

  /**
   * Kiểm tra đang loading
   */
  getIsLoading() {
    return this.isLoading;
  }

  /**
   * Lấy tổng số playlists
   */
  getTotalPlaylistsCount() {
    return this.playlists.length + this.myPlaylists.length;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  _isUserAuthenticated() {
    return authService.isUserAuthenticated();
  }
}

// Export singleton instance
export const playlistService = new PlaylistService();
