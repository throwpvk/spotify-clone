/**
 * Library Module
 * Xử lý render library items
 */

class Library {
  constructor() {
    this.likedTracks = [];
    this.followedPlaylists = [];
    this.followedArtists = [];
  }

  /**
   * Render library
   */
  async renderLibrary() {
    try {
      if (window.spotifyApp && window.spotifyApp.getService) {
        const authService = window.spotifyApp.getService("auth");

        // Chỉ render nếu user đã đăng nhập
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
   * Load library data
   */
  async _loadLibraryData() {
    try {
      if (window.spotifyApp && window.spotifyApp.getService) {
        const apiService = window.spotifyApp.getService("api");

        if (apiService) {
          // Load library data
          const libraryData = await apiService.loadLibraryData();

          this.likedTracks = libraryData.likedTracks;
          this.followedPlaylists = libraryData.followedPlaylists;
          this.followedArtists = libraryData.followedArtists;
        }
      }
    } catch (error) {
      console.error("Lỗi load library:", error);
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

    // Xóa nội dung cũ
    libraryContent.innerHTML = "";

    // Render Liked Songs (hiển thị đầu tiên)
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

    const trackCount = this.likedTracks.tracks.length;

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

    // Thêm click event
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
    const trackCount = playlist.total_tracks || playlist.tracks?.length || 0;

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
        <div class="item-subtitle">Playlist • ${
          trackCount > 0 ? `${trackCount} songs` : ""
        }</div>
      </div>
    `;

    // Thêm click event
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

    // Thêm click event
    artistItem.addEventListener("click", () => {
      this._handleArtistClick(artist);
    });

    return artistItem;
  }

  /**
   * Xử lý click vào Liked Songs
   */
  _handleLikedSongsClick() {
    // Cập nhật active state
    this._updateActiveState("liked");

    // Hiển thị toast
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
    // Cập nhật active state
    this._updateActiveState("playlist", playlist.id);

    // Hiển thị toast
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      const home = window.spotifyApp.getService("home");
      if (uiService) {
        uiService.showToast(`Open ${playlist.name || playlist.title}`, "info");
      }
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
    // Cập nhật active state
    this._updateActiveState("artist", artist.id);

    // Hiển thị toast
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

  /**
   * Thiết lập follow button events cho library
   */
  _setupLibraryFollowButtonEvents() {
    const followBtn = document.querySelector(
      ".library-btn.add, .library-btn.remove"
    ); // Select cả add và remove
    if (!followBtn) return;

    followBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const id = followBtn.getAttribute("data-id");
      const type = followBtn.getAttribute("data-type");

      if (!id || !type) return;

      try {
        const apiService = window.spotifyApp.getService("api");
        const uiService = window.spotifyApp.getService("ui");

        if (!apiService) return;

        // Disable button trong lúc xử lý
        followBtn.disabled = true;
        followBtn.style.opacity = "0.5";

        let isFollowed;
        if (type === "playlist") {
          isFollowed = await apiService.togglePlaylistFollow(id);
        } else if (type === "artist") {
          isFollowed = await apiService.toggleArtistFollow(id);
        }

        // Cập nhật UI
        this._updateLibraryFollowButtonUI(followBtn, isFollowed);

        // Refresh library để cập nhật lại
        await this.refreshLibrary();

        // Hiển thị toast
        if (uiService) {
          const message = isFollowed
            ? "Added to Library"
            : "Removed from Library";
          uiService.showToast(message, "success");
        }
      } catch (error) {
        console.error("Lỗi follow/unfollow:", error);

        // Hiển thị toast lỗi
        const uiService = window.spotifyApp.getService("ui");
        if (uiService) {
          uiService.showToast("Có lỗi xảy ra", "error");
        }
      } finally {
        // Enable button
        followBtn.disabled = false;
        followBtn.style.opacity = "1";
      }
    });
  }

  /**
   * Cập nhật UI của follow button trong library
   */
  _updateLibraryFollowButtonUI(button, isFollowed) {
    const icon = button.querySelector("i");

    if (isFollowed) {
      // Đã follow - hiển thị dấu check
      icon.className = "fa-solid fa-circle-check";
      button.setAttribute("data-label", "Remove from Library");
      button.classList.remove("add");
      button.classList.add("remove");
    } else {
      // Chưa follow - hiển thị dấu plus
      icon.className = "fa-solid fa-circle-plus";
      button.setAttribute("data-label", "Add to Library");
      button.classList.remove("remove");
      button.classList.add("add");
    }
  }

  /**
   * Cập nhật active state cho library items
   */
  _updateActiveState(type, id = null) {
    const libraryItems = document.querySelectorAll(".library-item");

    // Xóa active class từ tất cả items
    libraryItems.forEach((item) => {
      item.classList.remove("active");
    });

    // Thêm active class cho item được click
    if (type === "liked") {
      const likedItem = document.querySelector(
        '.library-item[data-type="liked"]'
      );
      if (likedItem) {
        likedItem.classList.add("active");
      }
    } else if (type === "playlist" && id) {
      const playlistItem = document.querySelector(
        `.library-item[data-type="playlist"][data-id="${id}"]`
      );
      if (playlistItem) {
        playlistItem.classList.add("active");
      }
    } else if (type === "artist" && id) {
      const artistItem = document.querySelector(
        `.library-item[data-type="artist"][data-id="${id}"]`
      );
      if (artistItem) {
        artistItem.classList.add("active");
      }
    }
  }

  /**
   * Xóa item khỏi library khi unfollow
   */
  async _removeFromLibrary(id, type) {
    try {
      // Refresh library data từ server để đảm bảo đồng bộ
      await this._loadLibraryData();
      this._renderLibraryItems();
    } catch (error) {
      console.error("Lỗi xóa khỏi library:", error);
    }
  }

  _setupContextMenu() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.setupContextMenu();
      }
    }
  }

  /**
   * Refresh library data
   */
  async refreshLibrary() {
    await this._loadLibraryData();
    this._renderLibraryItems();

    // Áp dụng lại chế độ lọc hiện tại sau khi refresh
    this._applyCurrentFilter();
  }

  /**
   * Áp dụng chế độ lọc hiện tại
   */
  _applyCurrentFilter() {
    const playlistTab = document.querySelector(".tab-playlist");
    const artistTab = document.querySelector(".tab-artist");
    const libraryContent = document.querySelector(".library-content");

    if (!playlistTab || !artistTab || !libraryContent) return;

    // Kiểm tra trạng thái hiện tại của các tab
    const isPlaylistActive = playlistTab.classList.contains("active");
    const isArtistActive = artistTab.classList.contains("active");

    const items = libraryContent.querySelectorAll(".library-item");

    items.forEach((item) => {
      const type = item.dataset.type?.toLowerCase() || "";

      if (isPlaylistActive) {
        // Chỉ hiển thị playlist và liked
        item.style.display =
          type === "playlist" || type === "liked" ? "" : "none";
      } else if (isArtistActive) {
        // Chỉ hiển thị artist
        item.style.display = type === "artist" ? "" : "none";
      } else {
        // Hiển thị tất cả
        item.style.display = "";
      }
    });
  }

  /**
   * Setup follow button events cho library
   */
  setupLibraryFollowButtonEvents() {
    this._setupLibraryFollowButtonEvents();
  }
}

export const library = new Library();
export default library;
