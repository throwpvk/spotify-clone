/**
 * Content Service Module
 * Service xử lý tất cả logic liên quan đến content (playlists, artists, tracks)
 */

import { apiService } from "./api.js";
import { MESSAGES } from "../constants/messages.js";

class ContentService {
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
      await this._loadContentData();
    } catch (error) {
      console.error("Error initializing content service:", error);
    }
  }

  /**
   * Load tất cả dữ liệu content
   */
  async _loadContentData() {
    try {
      this.isLoading = true;

      // Load song song cả hai API
      const [playlistsResponse, artistsResponse] = await Promise.all([
        this._loadAllPlaylists(),
        this._loadPopularArtists(),
      ]);

      console.log("Content data loaded successfully");
      console.log(`- Today's biggest hits: ${this.todaysHits.length} items`);
      console.log(`- Popular artists: ${this.popularArtists.length} items`);
    } catch (error) {
      console.error("Error loading content data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load "Today's biggest hits" - API Playlists/Get All Playlists
   */
  async _loadAllPlaylists() {
    try {
      const response = await apiService.getAllPlaylists(20, 0);

      if (response.success) {
        // API trả về { playlists: [...] }
        this.todaysHits = response.data.playlists || response.data || [];

        // Gọi song song lấy tracks cho từng playlist
        await Promise.all(
          this.todaysHits.map(async (playlist) => {
            try {
              const resTracks = await apiService.getPlaylistAllTracksById(
                playlist.id
              );
              playlist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi khi lấy tracks playlist ${playlist.id}:`, err);
              playlist.tracks = [];
            }
          })
        );

        console.log(this.todaysHits);
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

        // gọi song song lấy tracks cho từng artist
        await Promise.all(
          this.popularArtists.map(async (artist) => {
            try {
              const resTracks = await apiService.getArtistAllTracksById(
                artist.id
              );
              artist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi khi lấy tracks cho artist ${artist.id}:`, err);
              artist.tracks = [];
            }
          })
        );
        console.log(this.popularArtists);
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
   * Refresh dữ liệu content
   */
  async refreshContentData() {
    await this._loadContentData();
  }

  // ===== PUBLIC METHODS =====

  /**
   * Lấy dữ liệu "Today's biggest hits"
   */
  getAllPlaylists() {
    return this.todaysHits;
  }

  /**
   * Lấy dữ liệu "Popular artists"
   */
  getPopularArtists() {
    return this.popularArtists;
  }
}

// Export singleton instance
export const contentService = new ContentService();
