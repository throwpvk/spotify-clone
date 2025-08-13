/**
 * Artist Module
 * Module xử lý tất cả logic liên quan đến artist
 */

import { apiService } from "./api.js";
import { API_ENDPOINTS } from "../constants/api.js";
import { MESSAGES } from "../constants/messages.js";

class ArtistService {
  constructor() {
    this.artists = [];
    this.currentArtist = null;
    this.followedArtists = [];
    this._init();
  }

  /**
   * Khởi tạo service
   */
  _init() {
    this._loadAllArtists();
    this._loadFollowedArtists();
  }

  /**
   * Load tất cả artists từ API
   */
  async _loadAllArtists() {
    try {
      // TODO: Load tất cả Artists
      const response = await apiService.get(API_ENDPOINTS.ARTISTS.GET_ALL);
      this.artists = response.data || [];
    } catch (error) {
      console.error("Error loading artists:", error);
    }
  }

  /**
   * Load artists đã follow từ API
   */
  async _loadFollowedArtists() {
    try {
      // TODO: Load dữ liệu artists đã follow từ API
      const response = await apiService.get(API_ENDPOINTS.ARTISTS.GET_ALL);
      this.followedArtists = response.data || [];
    } catch (error) {
      console.error("Error loading followed artists:", error);
    }
  }

  /**
   * Follow artist theo ID
   */
  async followArtist(artistId) {
    try {
      // TODO: follow Artist
    } catch (error) {
      console.error("Error following artist:", error);
      throw error;
    }
  }
  /**
   * Unfollow artist theo ID
   */
  async unfollowArtist(artistId) {
    try {
      // TODO: bỏ follow Artist
    } catch (error) {
      console.error("Error unfollowing artist:", error);
      throw error;
    }
  }

  /**
   * Lấy artist theo ID
   */
  getArtistById(artistId) {
    return this.artists.find((artist) => artist.id === artistId);
  }

  /**
   * Lấy tất cả artists
   */
  getAllArtists() {
    return this.artists;
  }

  /**
   * Lấy followed artists
   */
  getFollowedArtists() {
    return this.followedArtists;
  }
}

// Export instance singleton
export const artistService = new ArtistService();
export default artistService;
