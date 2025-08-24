/**
 * API Service Module
 * Service xử lý tất cả HTTP requests đến API và content management
 */

import { API, APP_CONFIG } from "../constants/index.js";

class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.API.BASE_URL;
    this.timeout = APP_CONFIG.API.TIMEOUT;
    this.retryAttempts = APP_CONFIG.API.RETRY_ATTEMPTS;
    
    // Content data storage
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
      console.error("Error initializing API service:", error);
    }
  }

  // ===== REQUEST METHODS =====

  /**
   * Thực hiện HTTP request
   */
  async _makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...this._getAuthHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return await this._handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this._handleError(error);
    }
  }

  /**
   * Xử lý response từ API
   */
  async _handleResponse(response) {
    if (!response.ok) {
      const errorData = await this._parseErrorResponse(response);
      throw this._createApiError(response.status, errorData);
    }

    try {
      const data = await response.json();
      return {
        success: true,
        data: data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      return {
        success: true,
        data: null,
        status: response.status,
        headers: response.headers,
      };
    }
  }

  /**
   * Parse error response
   */
  async _parseErrorResponse(response) {
    try {
      return await response.json();
    } catch {
      return {
        message: response.statusText || "Unknown error",
        status: response.status,
      };
    }
  }

  /**
   * Tạo API error object
   */
  _createApiError(status, data) {
    const error = new Error(data.message || "API Error");
    error.status = status;
    error.data = data;
    error.isApiError = true;
    return error;
  }

  /**
   * Xử lý error
   */
  _handleError(error) {
    if (error.name === "AbortError") {
      error.message = "Request timeout";
      error.status = 408;
    } else if (error.isApiError) {
      return error;
    } else {
      error.message = "Network error";
      error.status = 0;
    }
    return error;
  }

  /**
   * Lấy auth headers - Tự động thêm token nếu có
   */
  _getAuthHeaders() {
    const token = this._getAuthToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Lấy auth token từ localStorage
   */
  _getAuthToken() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

    // Kiểm tra token hợp lệ
    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      token.trim() === ""
    ) {
      console.warn("Invalid or missing auth token");
      return null;
    }

    return token;
  }

  /**
   * Kiểm tra có token không
   */
  _hasAuthToken() {
    return !!this._getAuthToken();
  }

  // ===== PUBLIC HTTP METHODS =====

  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this._makeRequest(fullUrl, {
      method: "GET",
    });
  }

  async post(url, data = {}) {
    return this._makeRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(url, data = {}) {
    return this._makeRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(url) {
    return this._makeRequest(url, {
      method: "DELETE",
    });
  }

  // ===== AUTHENTICATION API =====

  /**
   * Đăng ký tài khoản
   */
  async register(userData) {
    return this.post(this.baseURL + API.AUTH.REGISTER, userData);
  }

  /**
   * Đăng nhập
   */
  async login(credentials) {
    return this.post(this.baseURL + API.AUTH.LOGIN, credentials);
  }

  // ===== USER API =====

  /**
   * Lấy thông tin user hiện tại - Cần authentication
   */
  async getProfile() {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }
    return this.get(this.baseURL + API.USER.PROFILE);
  }

  // ===== PLAYLISTS API (Today's biggest hits) =====

  /**
   * Lấy tất cả playlists từ API
   */
  async getAllPlaylists(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${this.baseURL + API.PLAYLISTS.GET_ALL}?${params}`);
  }

  /**
   * Lấy All Tracks của Playlist theo Playlist ID
   */
  async getPlaylistAllTracksById(id) {
    return this.get(
      `${this.baseURL + API.PLAYLISTS.GET_ALL_TRACKS_BY_ID}/${id}/tracks`
    );
  }

  // ===== ARTISTS API (Popular artists) =====

  /**
   * Lấy tất cả artists
   */
  async getAllArtists(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${this.baseURL + API.ARTISTS.GET_ALL}?${params}`);
  }

  /**
   * Lấy Popular Tracks của Artist theo Artist ID
   */
  async getArtistAllTracksById(id) {
    return this.get(
      `${this.baseURL + API.ARTISTS.GET_ALL_TRACKS_BY_ID}/${id}/tracks/popular`
    );
  }

  /**
   * Lấy liked tracks của user hiện tại - Cần authentication
   */
  async getLikedTracks(limit = 50, offset = 0) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${this.baseURL + API.AUTH.GET_LIKED_TRACKS}?${params}`);
  }

  /**
   * Lấy followed playlists của user hiện tại - Cần authentication
   */
  async getFollowedPlaylists(limit = 50, offset = 0) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(
      `${this.baseURL + API.AUTH.GET_FOLLOWED_PLAYLISTS}?${params}`
    );
  }

  /**
   * Lấy followed artists của user hiện tại - Cần authentication
   */
  async getFollowedArtists(limit = 50, offset = 0) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(
      `${this.baseURL + API.AUTH.GET_FOLLOWED_ARTISTS}?${params}`
    );
  }

  /**
   * Follow playlist - Cần authentication
   */
  async followPlaylist(playlistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.post(`${this.baseURL}/playlists/${playlistId}/follow`);
  }

  /**
   * Unfollow playlist - Cần authentication
   */
  async unfollowPlaylist(playlistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.delete(`${this.baseURL}/playlists/${playlistId}/follow`);
  }

  /**
   * Follow artist - Cần authentication
   */
  async followArtist(artistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.post(`${this.baseURL}/artists/${artistId}/follow`);
  }

  /**
   * Unfollow artist - Cần authentication
   */
  async unfollowArtist(artistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.delete(`${this.baseURL}/artists/${artistId}/follow`);
  }

  /**
   * Like track - Cần authentication
   */
  async likeTrack(trackId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.post(`${this.baseURL}/tracks/${trackId}/like`);
  }

  /**
   * Unlike track - Cần authentication
   */
  async unlikeTrack(trackId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.delete(`${this.baseURL}/tracks/${trackId}/like`);
  }

  // ===== CONTENT MANAGEMENT METHODS =====

  /**
   * Load tất cả dữ liệu content
   */
  async _loadContentData() {
    try {
      this.isLoading = true;

      // Load song song cả hai API
      const [playlistsResponse, artistsResponse] = await Promise.all([
        this._loadAllPlaylistsWithTracks(),
        this._loadPopularArtistsWithTracks(),
      ]);

      this.todaysHits = playlistsResponse;
      this.popularArtists = artistsResponse;

      console.log("Content data loaded successfully");
      console.log(`- Today's biggest hits: ${this.todaysHits.length} items`);
      console.log(`- Popular artists: ${this.popularArtists.length} items`);
    } catch (error) {
      console.error("Error loading content data:", error);
      this.todaysHits = [];
      this.popularArtists = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load "Today's biggest hits" với tracks - API Playlists/Get All Playlists
   */
  async _loadAllPlaylistsWithTracks() {
    try {
      const response = await this.getAllPlaylists(20, 0);

      if (response.success) {
        // API trả về { playlists: [...] }
        const playlists = response.data.playlists || response.data || [];

        // Gọi song song lấy tracks cho từng playlist
        await Promise.all(
          playlists.map(async (playlist) => {
            try {
              const resTracks = await this.getPlaylistAllTracksById(playlist.id);
              playlist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi khi lấy tracks playlist ${playlist.id}:`, err);
              playlist.tracks = [];
            }
          })
        );

        console.log("Today's biggest hits loaded:", playlists);
        return playlists;
      } else {
        console.error("Failed to load Today's biggest hits");
        return [];
      }
    } catch (error) {
      console.error("Error loading Today's biggest hits:", error);
      return [];
    }
  }

  /**
   * Load "Popular artists" với tracks - API Artists/Get All Artists
   */
  async _loadPopularArtistsWithTracks() {
    try {
      const response = await this.getAllArtists(20, 0);

      if (response.success) {
        // API trả về { artists: [...] } thay vì trực tiếp array
        const artists = response.data.artists || response.data || [];

        // gọi song song lấy tracks cho từng artist
        await Promise.all(
          artists.map(async (artist) => {
            try {
              const resTracks = await this.getArtistAllTracksById(artist.id);
              artist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi khi lấy tracks cho artist ${artist.id}:`, err);
              artist.tracks = [];
            }
          })
        );
        console.log("Popular artists loaded:", artists);
        return artists;
      } else {
        console.error("Failed to load Popular artists");
        return [];
      }
    } catch (error) {
      console.error("Error loading Popular artists:", error);
      return [];
    }
  }

  /**
   * Load library data với tracks
   */
  async loadLibraryData() {
    try {
      if (!this._hasAuthToken()) {
        throw new Error("Authentication required");
      }

      // Load song song cả 3 API
      const [likedTracksRes, followedPlaylistsRes, followedArtistsRes] =
        await Promise.all([
          this.getLikedTracks(),
          this.getFollowedPlaylists(),
          this.getFollowedArtists(),
        ]);

      const result = {
        likedTracks: null,
        followedPlaylists: [],
        followedArtists: [],
      };

      // Xử lý liked tracks
      if (likedTracksRes.success) {
        const tracks = likedTracksRes.data.tracks || likedTracksRes.data || [];
        result.likedTracks = {
          name: "Liked Songs",
          tracks,
        };
      }

      // Xử lý followed playlists
      if (followedPlaylistsRes.success) {
        const playlists =
          followedPlaylistsRes.data.playlists ||
          followedPlaylistsRes.data ||
          [];

        // Gọi song song lấy tracks cho từng playlist
        await Promise.all(
          playlists.map(async (playlist) => {
            try {
              const resTracks = await this.getPlaylistAllTracksById(playlist.id);
              playlist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(
                `Lỗi khi lấy tracks playlist ${playlist.id}:`,
                err
              );
              playlist.tracks = [];
            }
          })
        );
        result.followedPlaylists = playlists;
      }

      // Xử lý followed artists
      if (followedArtistsRes.success) {
        const artists =
          followedArtistsRes.data.artists || followedArtistsRes.data || [];

        // Gọi song song lấy tracks cho từng artist
        await Promise.all(
          artists.map(async (artist) => {
            try {
              const resTracks = await this.getArtistAllTracksById(artist.id);
              artist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi khi lấy tracks artist ${artist.id}:`, err);
              artist.tracks = [];
            }
          })
        );
        result.followedArtists = artists;
      }

      console.log("Library data loaded successfully:", result);
      return result;
    } catch (error) {
      console.error("Error loading library data:", error);
      throw error;
    }
  }

  // ===== PUBLIC CONTENT METHODS =====

  /**
   * Refresh dữ liệu content
   */
  async refreshContentData() {
    await this._loadContentData();
  }

  /**
   * Lấy dữ liệu "Today's biggest hits" đã được cache
   */
  getCachedPlaylists() {
    return this.todaysHits;
  }

  /**
   * Lấy dữ liệu "Popular artists" đã được cache
   */
  getCachedArtists() {
    return this.popularArtists;
  }
}

// Export singleton instance
export const apiService = new ApiService();
