/**
 * Library Module
 * Module xử lý việc render library items (playlists, artists, liked tracks)
 */

class Library {
  constructor() {
    this.likedTracks = [];
    this.followedPlaylists = [];
    this.followedArtists = [];
  }

  /**
   * Render toàn bộ library
   */
  async renderLibrary() {
    try {
      if (window.spotifyApp && window.spotifyApp.getService) {
        const authService = window.spotifyApp.getService("auth");

        // Chỉ render library nếu user đã đăng nhập
        if (authService && authService.isUserAuthenticated()) {
          await this._loadLibraryData();
          this._renderLibraryItems();
        }
      }
    } catch (error) {
      console.error("Error rendering library:", error);
    }
  }

  /**
   * Load dữ liệu library từ API
   */
  async _loadLibraryData() {
    try {
      if (window.spotifyApp && window.spotifyApp.getService) {
        const apiService = window.spotifyApp.getService("api");

        if (apiService) {
          // Sử dụng API service để load library data
          const libraryData = await apiService.loadLibraryData();
          
          this.likedTracks = libraryData.likedTracks;
          this.followedPlaylists = libraryData.followedPlaylists;
          this.followedArtists = libraryData.followedArtists;

          console.log("Library data loaded successfully");
          console.log(`Liked tracks:`, this.likedTracks);
          console.log(`Followed playlists:`, this.followedPlaylists);
          console.log(`Followed artists:`, this.followedArtists);
        }
      }
    } catch (error) {
      console.error("Error loading library data:", error);
    }
  }

  /**
   * Render library items
   */
  _renderLibraryItems() {
    const libraryContent = document.querySelector(".library-content");
    if (!libraryContent) {
      console.warn("Library content container not found");
      return;
    }

    // Clear existing content
    libraryContent.innerHTML = "";

    // Render Liked Songs (luôn hiển thị đầu tiên)
    this._renderLikedSongs(libraryContent);

    // Render followed playlists
    this.followedPlaylists.forEach((playlist) => {
      const playlistItem = this._createPlaylistItem(playlist);
      libraryContent.appendChild(playlistItem);
    });

    // Render followed artists
    this.followedArtists.forEach((artist) => {
      const artistItem = this._createArtistItem(artist);
      libraryContent.appendChild(artistItem);
    });

    this._setupContextMenu();
  }

  /**
   * Render Liked Songs item
   */
  _renderLikedSongs(container) {
    const likedSongsItem = document.createElement("div");
    likedSongsItem.className = "library-item active";
    likedSongsItem.setAttribute("data-type", "liked");

    const trackCount = this.likedTracks.length;

    likedSongsItem.innerHTML = `
      <div data-label="tooltip" class="item-icon liked-songs">
        <i class="fas fa-heart"></i>
      </div>
      <div class="item-info">
        <div class="item-title">Liked Songs</div>
        <div class="item-subtitle">
          <i class="fas fa-thumbtack"></i>
          Playlist • ${trackCount} songs
        </div>
      </div>
    `;

    // Add click event
    likedSongsItem.addEventListener("click", () => {
      this._handleLikedSongsClick();
    });
    container.appendChild(likedSongsItem);
  }

  /**
   * Tạo playlist item
   */
  _createPlaylistItem(playlist) {
    const playlistItem = document.createElement("div");
    playlistItem.className = "library-item";
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.setAttribute("data-id", playlist.id);

    const imageUrl =
      playlist.image_url ||
      playlist.cover_image ||
      "placeholder.svg?height=48&width=48";
    const title = playlist.name || playlist.title || "Unknown Playlist";
    const owner =
      playlist.owner_name || playlist.artist_name || "Unknown Owner";
    const trackCount = playlist.track_count || playlist.tracks?.length || 0;

    playlistItem.innerHTML = `
      <div data-label="tooltip" class="item-icon">
        <img
          src="${imageUrl}"
          alt="${title}"
          class="item-image"
          onerror="this.src='placeholder.svg?height=48&width=48'"
        />
      </div>
      <div class="item-info">
        <div class="item-title">${title}</div>
        <div class="item-subtitle">Playlist • ${owner}${
      trackCount > 0 ? ` • ${trackCount} songs` : ""
    }</div>
      </div>
    `;

    // Add click event
    playlistItem.addEventListener("click", () => {
      this._handlePlaylistClick(playlist);
    });
    return playlistItem;
  }

  /**
   * Tạo artist item
   */
  _createArtistItem(artist) {
    const artistItem = document.createElement("div");
    artistItem.className = "library-item";
    artistItem.setAttribute("data-type", "artist");
    artistItem.setAttribute("data-id", artist.id);

    const imageUrl =
      artist.image_url ||
      artist.avatar_url ||
      "placeholder.svg?height=48&width=48";
    const name = artist.name || artist.display_name || "Unknown Artist";

    artistItem.innerHTML = `
      <div data-label="tooltip" class="item-icon">
        <img
          src="${imageUrl}"
          alt="${name}"
          class="item-image"
          onerror="this.src='placeholder.svg?height=48&width=48'"
        />
      </div>
      <div class="item-info">
        <div class="item-title">${name}</div>
        <div class="item-subtitle">Artist</div>
      </div>
    `;

    // Add click event
    artistItem.addEventListener("click", () => {
      this._handleArtistClick(artist);
    });

    return artistItem;
  }

  /**
   * Xử lý click vào Liked Songs
   */
  _handleLikedSongsClick() {
    console.log("Liked Songs clicked");

    // Hiển thị toast thông báo
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      const home = window.spotifyApp.getService("home");
      if (uiService) {
        uiService.showToast(
          `Open Liked Songs (${this.likedTracks.length} tracks)`,
          "info"
        );
      }

      if (home) {
        home.setDetailContent(this.likedTracks);
        home.hideHome();
      }
    }
  }

  /**
   * Xử lý click vào playlist
   */
  _handlePlaylistClick(playlist) {
    console.log("Playlist clicked:", playlist);

    // Hiển thị toast thông báo
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      const home = window.spotifyApp.getService("home");
      if (uiService) {
        uiService.showToast(`Open ${playlist.name || playlist.title}`, "info");
      }
      console.log(playlist);
      if (home) {
        home.setDetailContent(playlist);
        home.hideHome();
      }
    }
  }

  /**
   * Xử lý click vào artist
   */
  _handleArtistClick(artist) {
    console.log("Artist clicked:", artist);

    // Hiển thị toast thông báo
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      const home = window.spotifyApp.getService("home");
      if (uiService) {
        uiService.showToast(
          `Open ${artist.name || artist.display_name}`,
          "info"
        );
      }
      if (home) {
        home.setDetailContent(artist);
        home.hideHome();
      }
    }
  }

  _setupContextMenu() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.setupContextMenu();
        console.log("setupContextMenu");
      }
    }
  }

  /**
   * Refresh library data
   */
  async refreshLibrary() {
    await this._loadLibraryData();
    this._renderLibraryItems();
  }
}

export const library = new Library();
export default library;
