/**
 * API Service
 * Xử lý HTTP requests và quản lý content
 */

import { API, APP_CONFIG } from "../constants/index.js";

class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.API.BASE_URL;
    this.timeout = APP_CONFIG.API.TIMEOUT;
    this.retryAttempts = APP_CONFIG.API.RETRY_ATTEMPTS;

    // Lưu trữ dữ liệu content
    this.todaysHits = [];
    this.popularArtists = [];
    this.isLoading = false;

    // Lưu trữ follow status
    this.likedTrackIds = new Set();
    this.followedPlaylistIds = new Set();
    this.followedArtistIds = new Set();
  }

  /**
   * Gửi HTTP request
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
   * Xử lý response
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
   * Parse lỗi response
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
   * Tạo lỗi API
   */
  _createApiError(status, data) {
    const error = new Error(data.message || "API Error");
    error.status = status;
    error.data = data;
    error.isApiError = true;
    return error;
  }

  /**
   * Xử lý lỗi
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
   * Lấy auth headers
   */
  _getAuthHeaders() {
    const token = this._getAuthToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Lấy auth token
   */
  _getAuthToken() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

    // Kiểm tra token
    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      token.trim() === ""
    ) {
      console.warn("Token không hợp lệ");
      return null;
    }

    return token;
  }

  /**
   * Kiểm tra token
   */
  _hasAuthToken() {
    return !!this._getAuthToken();
  }

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

  /**
   * Lấy thông tin user
   */
  async getProfile() {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }
    return this.get(this.baseURL + API.USER.PROFILE);
  }

  /**
   * Lấy tất cả playlists
   */
  async getAllPlaylists(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.get(`${this.baseURL + API.PLAYLISTS.GET_ALL}?${params}`);
  }

  /**
   * Lấy tracks của playlist
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
   * Lấy tracks của artist
   */
  async getArtistAllTracksById(id) {
    return this.get(
      `${this.baseURL + API.ARTISTS.GET_ALL_TRACKS_BY_ID}/${id}/tracks/popular`
    );
  }

  /**
   * Lấy liked tracks
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
   * Lấy followed playlists
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
   * Lấy followed artists
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
   * Follow playlist
   */
  async followPlaylist(playlistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    try {
      return await this.post(`${this.baseURL}/playlists/${playlistId}/follow`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unfollow playlist
   */
  async unfollowPlaylist(playlistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.delete(`${this.baseURL}/playlists/${playlistId}/follow`);
  }

  /**
   * Follow artist
   */
  async followArtist(artistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.post(`${this.baseURL}/artists/${artistId}/follow`);
  }

  /**
   * Unfollow artist
   */
  async unfollowArtist(artistId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.delete(`${this.baseURL}/artists/${artistId}/follow`);
  }

  /**
   * Like track
   */
  async likeTrack(trackId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.post(`${this.baseURL}/tracks/${trackId}/like`);
  }

  /**
   * Unlike track
   */
  async unlikeTrack(trackId) {
    if (!this._hasAuthToken()) {
      throw new Error("Authentication required");
    }

    return this.delete(`${this.baseURL}/tracks/${trackId}/like`);
  }

  /**
   * Load dữ liệu content
   */
  async loadContentData() {
    try {
      this.isLoading = true;

      // Load song song 2 API
      const [playlistsResponse, artistsResponse] = await Promise.all([
        this._loadAllPlaylistsWithTracks(),
        this._loadPopularArtistsWithTracks(),
      ]);

      this.todaysHits = playlistsResponse;
      this.popularArtists = artistsResponse;

      // Cập nhật follow status nếu user đã đăng nhập
      if (this._hasAuthToken()) {
        await this._updateFollowStatus();
      }
    } catch (error) {
      console.error("Lỗi load content:", error);
      this.todaysHits = [];
      this.popularArtists = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load Today's hits với tracks
   */
  async _loadAllPlaylistsWithTracks() {
    try {
      const response = await this.getAllPlaylists(20, 0);

      if (response.success) {
        // API trả về { playlists: [...] }
        const playlists = response.data.playlists || response.data || [];

        // Lấy tracks cho từng playlist
        await Promise.all(
          playlists.map(async (playlist) => {
            try {
              const resTracks = await this.getPlaylistAllTracksById(
                playlist.id
              );
              playlist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi lấy tracks playlist ${playlist.id}:`, err);
              playlist.tracks = [];
            }
          })
        );
        return playlists;
      } else {
        console.error("Lỗi load Today's hits");
        return [];
      }
    } catch (error) {
      console.error("Lỗi load Today's hits:", error);
      return [];
    }
  }

  /**
   * Load Popular artists với tracks
   */
  async _loadPopularArtistsWithTracks() {
    try {
      const response = await this.getAllArtists(20, 0);

      if (response.success) {
        // API trả về { artists: [...] }
        const artists = response.data.artists || response.data || [];

        // Lấy tracks cho từng artist
        await Promise.all(
          artists.map(async (artist) => {
            try {
              const resTracks = await this.getArtistAllTracksById(artist.id);
              artist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi lấy tracks artist ${artist.id}:`, err);
              artist.tracks = [];
            }
          })
        );
        return artists;
      } else {
        console.error("Lỗi load Popular artists");
        return [];
      }
    } catch (error) {
      console.error("Lỗi load Popular artists:", error);
      return [];
    }
  }

  /**
   * Load library data
   */
  async loadLibraryData() {
    try {
      if (!this._hasAuthToken()) {
        throw new Error("Authentication required");
      }

      // Load song song 3 API
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

        tracks.forEach((track) => {
          this.likedTrackIds.add(track.id);
        });
      }

      // Xử lý followed playlists
      if (followedPlaylistsRes.success) {
        const playlists =
          followedPlaylistsRes.data.playlists ||
          followedPlaylistsRes.data ||
          [];

        // Cập nhật follow status
        playlists.forEach((playlist) => {
          this.followedPlaylistIds.add(playlist.id);
        });

        // Lấy tracks cho từng playlist
        await Promise.all(
          playlists.map(async (playlist) => {
            try {
              const resTracks = await this.getPlaylistAllTracksById(
                playlist.id
              );
              playlist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi lấy tracks playlist ${playlist.id}:`, err);
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

        // Cập nhật follow status
        artists.forEach((artist) => {
          this.followedArtistIds.add(artist.id);
        });

        // Lấy tracks cho từng artist
        await Promise.all(
          artists.map(async (artist) => {
            try {
              const resTracks = await this.getArtistAllTracksById(artist.id);
              artist.tracks = resTracks.success
                ? resTracks.data.tracks || resTracks.data || []
                : [];
            } catch (err) {
              console.error(`Lỗi lấy tracks artist ${artist.id}:`, err);
              artist.tracks = [];
            }
          })
        );
        result.followedArtists = artists;
      }

      return result;
    } catch (error) {
      console.error("Lỗi load library:", error);
      throw error;
    }
  }

  /**
   * Refresh content
   */
  async refreshContentData() {
    await this.loadContentData();
  }

  /**
   * Refresh library
   */
  async refreshLibraryData() {
    await this.loadLibraryData();
  }

  /**
   * Lấy Today's hits đã cache
   */
  getCachedPlaylists() {
    return this.todaysHits;
  }

  /**
   * Lấy Popular artists đã cache
   */
  getCachedArtists() {
    return this.popularArtists;
  }

  // ===== FOLLOW STATUS METHODS =====

  /**
   * Cập nhật follow status
   */
  async _updateFollowStatus() {
    try {
      if (!this._hasAuthToken()) return;

      const [likedTracksRes, followedPlaylistsRes, followedArtistsRes] =
        await Promise.all([
          this.getLikedTracks(),
          this.getFollowedPlaylists(),
          this.getFollowedArtists(),
        ]);

      // Reset follow status
      this.likedTrackIds.clear();
      this.followedPlaylistIds.clear();
      this.followedArtistIds.clear();

      // Xử lý liked tracks
      if (likedTracksRes.success) {
        const tracks = likedTracksRes.data.tracks || likedTracksRes.data || [];
        tracks.forEach((track) => {
          this.likedTrackIds.add(track.id);
        });
      }

      // Cập nhật playlist follow status
      if (followedPlaylistsRes.success) {
        const playlists =
          followedPlaylistsRes.data.playlists ||
          followedPlaylistsRes.data ||
          [];
        playlists.forEach((playlist) => {
          this.followedPlaylistIds.add(playlist.id);
        });
      }

      // Cập nhật artist follow status
      if (followedArtistsRes.success) {
        const artists =
          followedArtistsRes.data.artists || followedArtistsRes.data || [];
        artists.forEach((artist) => {
          this.followedArtistIds.add(artist.id);
        });
      }
    } catch (error) {
      console.error("Lỗi cập nhật follow status:", error);
    }
  }

  /**
   * Kiểm tra track đã được like chưa
   */
  isTrackLiked(trackId) {
    return this.likedTrackIds.has(trackId);
  }

  /**
   * Kiểm tra playlist đã được follow chưa
   */
  isPlaylistFollowed(playlistId) {
    return this.followedPlaylistIds.has(playlistId);
  }

  /**
   * Kiểm tra artist đã được follow chưa
   */
  isArtistFollowed(artistId) {
    return this.followedArtistIds.has(artistId);
  }

  /**
   * Follow/Unfollow playlist
   */
  async togglePlaylistFollow(playlistId) {
    try {
      if (!this._hasAuthToken()) {
        throw new Error("Authentication required");
      }

      const isFollowed = this.isPlaylistFollowed(playlistId);

      if (isFollowed) {
        // Unfollow playlist
        await this.unfollowPlaylist(playlistId);
        this.followedPlaylistIds.delete(playlistId);
      } else {
        // Follow playlist
        await this.followPlaylist(playlistId);
        this.followedPlaylistIds.add(playlistId);
      }

      return !isFollowed; // Trả về trạng thái mới
    } catch (error) {
      console.error("Lỗi toggle playlist follow:", error);
      throw error;
    }
  }

  /**
   * Follow/Unfollow artist
   */
  async toggleArtistFollow(artistId) {
    try {
      if (!this._hasAuthToken()) {
        throw new Error("Authentication required");
      }

      const isFollowed = this.isArtistFollowed(artistId);

      if (isFollowed) {
        // Unfollow artist
        await this.unfollowArtist(artistId);
        this.followedArtistIds.delete(artistId);
      } else {
        // Follow artist
        await this.followArtist(artistId);
        this.followedArtistIds.add(artistId);
      }
      return !isFollowed; // Trả về trạng thái mới
    } catch (error) {
      console.error("Lỗi toggle artist follow:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
