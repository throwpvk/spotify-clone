/**
 * Home Module
 * Xử lý render Home page và navigation
 */

class Home {
  constructor() {
    this._init();
  }

  /**
   * Khởi tạo
   */
  _init() {
    // Thiết lập events
    this._setupCommonEvents();
  }

  /**
   * Render Home page
   */
  renderHomePage() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const apiService = window.spotifyApp.getService("api");
      if (apiService) {
        // Render Today's hits
        const allPlaylists = apiService.getCachedPlaylists();
        this.renderAllPlaylist(allPlaylists);

        // Render Popular artists
        const popularArtists = apiService.getCachedArtists();
        this.renderPopularArtists(popularArtists);
      }
    }
  }

  /**
   * Render Today's hits
   */
  renderAllPlaylist(playlists) {
    const container = document.querySelector(".hits-grid");
    if (!container) {
      console.warn("Today's hits container (.hits-grid) not found");
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Kiểm tra playlists
    if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
      container.innerHTML = '<p class="no-data">Không có dữ liệu</p>';
      return;
    }

    // Tạo container cho cards
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "hits-grid-container";

    // Render từng playlist
    playlists.forEach((playlist) => {
      const playlistCard = this._createPlaylistCard(playlist);
      cardsContainer.appendChild(playlistCard);
    });

    // Thêm cards vào container
    container.appendChild(cardsContainer);

    // Tạo nút navigation
    const prevBtn = document.createElement("button");
    prevBtn.className = "hits-nav-btn prev";
    prevBtn.id = "hitsPrevBtn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const nextBtn = document.createElement("button");
    nextBtn.className = "hits-nav-btn next";
    nextBtn.id = "hitsNextBtn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    // Thiết lập navigation
    this._setupHomeNavigation();
  }

  /**
   * Render Popular artists
   */
  renderPopularArtists(artists) {
    const container = document.querySelector(".artists-grid");
    if (!container) {
      console.warn("Popular artists container (.artists-grid) not found");
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Kiểm tra artists
    if (!artists || !Array.isArray(artists) || artists.length === 0) {
      container.innerHTML = '<p class="no-data">Không có dữ liệu</p>';
      return;
    }

    // Tạo container cho cards
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "artists-grid-container";

    // Render từng artist
    artists.forEach((artist) => {
      const artistCard = this._createArtistCard(artist);
      cardsContainer.appendChild(artistCard);
    });

    // Thêm cards vào container
    container.appendChild(cardsContainer);

    // Tạo nút navigation
    const prevBtn = document.createElement("button");
    prevBtn.className = "artists-nav-btn prev";
    prevBtn.id = "artistsPrevBtn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const nextBtn = document.createElement("button");
    nextBtn.className = "artists-nav-btn next";
    nextBtn.id = "artistsNextBtn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    // Thiết lập navigation
    this._setupHomeNavigation();
  }

  /**
   * Tạo playlist card
   */
  _createPlaylistCard(playlist) {
    const card = document.createElement("div");
    card.className = "hit-card";
    card.setAttribute("data-playlist-id", playlist.id);

    const imageUrl =
      playlist.image_url ||
      playlist.cover_image ||
      "placeholder.svg?height=160&width=160";
    const title = playlist.name || playlist.title || "Unknown Playlist";
    const artist =
      playlist.artist_name || playlist.owner_name || "Unknown Artist";

    card.innerHTML = `
      <div class="hit-card-cover">
        <img src="${imageUrl}" alt="${title}" onerror="this.src='placeholder.svg?height=160&width=160'">
        <button data-label="tooltip" class="hit-play-btn">
          <i class="fas fa-play"></i>
        </button>
      </div>
      <div class="hit-card-info">
        <h3 class="hit-card-title">${title}</h3>
        <p class="hit-card-artist">${artist}</p>
      </div>
    `;

    // Thêm click event
    card.addEventListener("click", () => {
      this._handlePlaylistClick(playlist);
    });

    return card;
  }

  /**
   * Tạo artist card
   */
  _createArtistCard(artist) {
    const card = document.createElement("div");
    card.className = "artist-card";
    card.setAttribute("data-artist-id", artist.id);

    const imageUrl =
      artist.image_url ||
      artist.avatar_url ||
      "placeholder.svg?height=160&width=160";
    const name = artist.name || artist.display_name || "Unknown Artist";

    card.innerHTML = `
      <div class="artist-card-cover">
        <img src="${imageUrl}" alt="${name}" onerror="this.src='placeholder.svg?height=160&width=160'">
        <button data-label="tooltip" class="artist-play-btn">
          <i class="fas fa-play"></i>
        </button>
      </div>
      <div class="artist-card-info">
        <h3 class="artist-card-name">${name}</h3>
        <p class="artist-card-type">Artist</p>
      </div>
    `;

    // Thêm click event
    card.addEventListener("click", () => {
      this._handleArtistClick(artist);
    });

    return card;
  }

  /**
   * Hiển thị home
   */
  _showHome() {
    const homeContainer = document.querySelector(".home-container");
    homeContainer.classList.remove("hide");
  }

  /**
   * Ẩn home
   */
  hideHome() {
    const homeContainer = document.querySelector(".home-container");
    homeContainer.classList.add("hide");
  }

  /**
   * Xử lý click playlist
   */
  _handlePlaylistClick(playlist) {
    this.setDetailContent(playlist);
    this.hideHome();

    // Hiển thị toast
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.showToast(`Open ${playlist.name || playlist.title}`, "info");
      }
    }
  }

  /**
   * Xử lý click artist
   */
  _handleArtistClick(artist) {
    this.setDetailContent(artist);
    this.hideHome();

    // Hiển thị toast
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.showToast(
          `Open ${artist.name || artist.display_name}`,
          "info"
        );
      }
    }
  }

  /**
   * Thiết lập detail content
   */
  setDetailContent(data) {
    const detailContainer = document.querySelector(".detail-container");

    // Kiểm tra follow status
    const apiService = window.spotifyApp.getService("api");
    const isPlaylist = !data.is_verified;
    const isFollowed = apiService
      ? isPlaylist
        ? apiService.isPlaylistFollowed(data.id)
        : apiService.isArtistFollowed(data.id)
      : false;

    const tracksHtml = (tracks) =>
      tracks
        .map((track, index) => {
          const isPlaylist = !!track.track_title;

          const trackId = isPlaylist ? track.track_id : track.id;
          const title = isPlaylist ? track.track_title : track.title;
          const image = isPlaylist
            ? track.track_image_url || track.album_cover_image_url
            : track.image_url || track.album_cover;
          const playCount = isPlaylist
            ? track.track_play_count
            : track.play_count;
          const duration = isPlaylist ? track.track_duration : track.duration;
          const isTrackLiked = apiService.isTrackLiked(trackId);

          // format duration mm:ss
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const durationStr = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;

          // format playCount với dấu phẩy
          const playCountStr = playCount?.toLocaleString() || "0";

          return `
            <div class="track-item" data-id="${trackId}">
              <div class="track-number">${index + 1}</div>
              <div class="track-image">
                <img src="${
                  image || "./assets/images/track-img.jpg?height=40&width=40"
                }" onerror="this.src='./assets/images/track-img.jpg?height=40&width=40'"/>
              </div>
              <div class="track-info">
                <div class="track-name">${title}</div>
              </div>
              <div class="track-plays">${playCountStr}</div>
              ${
                isTrackLiked
                  ? `
                  <button class="track-like-btn" data-id="${trackId}" data-type="unlike-action">
                    <i class="fa-solid fa-heart"></i>
                  </button>`
                  : `
                  <button class="track-like-btn" data-id="${trackId}" data-type="like-action">
                    <i class="fa-regular fa-heart"></i>
                  </button>`
              }
              <div class="track-duration">${durationStr}</div>
              <button class="track-menu-btn">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
        `;
        })
        .join("");

    const html = `
    <!-- Artist Hero Section -->
            <section class="artist-hero">
              <div class="hero-background">
                <img
                  src=${
                    data.background_image_url
                      ? data.background_image_url
                      : "./assets/images/playlist-hero.jpg"
                  }
                  alt="background"
                  class="hero-image"
                />
                <div class="hero-overlay"></div>
              </div>
              <div class="hero-content">
                ${
                  data.is_verified && data.is_verified === true
                    ? `<div class="verified-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>Verified Artist</span>
                  </div>`
                    : ""
                }
                <h1 class="artist-name">${data.name}</h1>
                <p class="monthly-listeners">${
                  data.monthly_listeners
                    ? data.monthly_listeners.toLocaleString("en-US") +
                      " monthly listeners"
                    : ""
                }</p>
              </div>
            </section>

            <!-- Artist Controls -->
            <section class="artist-controls" data-type="${
              !data.is_verified ? "playlist" : "artist"
            }" data-id="${data.id}">
              <button data-label="tooltip" class="play-btn-large">
                <i class="fas fa-play"></i>
              </button>
              ${
                data.name !== "Liked Songs"
                  ? `<button data-label="${
                      isFollowed ? "Remove from Library" : "Add to Library"
                    }" class="btn library-btn ${
                      isFollowed ? "remove" : "add"
                    }" data-id="${data.id}" data-type="${
                      !data.is_verified ? "playlist" : "artist"
                    }">
                      <i class="fa-solid ${
                        isFollowed ? "fa-circle-check" : "fa-circle-plus"
                      }"></i>
                    </button>`
                  : ""
              }
            </section>

            <!-- Popular Tracks -->
            <section class="popular-section">
              <h2 class="section-title">${
                data.name === "Liked Songs" ? "Liked Songs" : "Popular"
              }</h2>
              <div class="track-list">
                ${tracksHtml(data.tracks)}
              </div>
            </section>
    `;
    detailContainer.innerHTML = html;

    // Thiết lập follow button events
    this._setupFollowButtonEvents();
    this._setupLikeButtonEvents();
  }

  /**
   * Thiết lập navigation
   */
  _setupHomeNavigation() {
    // Hits navigation
    const hitsPrevBtn = document.getElementById("hitsPrevBtn");
    const hitsNextBtn = document.getElementById("hitsNextBtn");
    const hitsContainer = document.querySelector(".hits-grid-container");

    if (hitsPrevBtn && hitsNextBtn && hitsContainer) {
      this._setupCarouselNavigation(
        hitsContainer,
        hitsPrevBtn,
        hitsNextBtn,
        200,
        16
      );
    }

    // Artists navigation
    const artistsPrevBtn = document.getElementById("artistsPrevBtn");
    const artistsNextBtn = document.getElementById("artistsNextBtn");
    const artistsContainer = document.querySelector(".artists-grid-container");

    if (artistsPrevBtn && artistsNextBtn && artistsContainer) {
      this._setupCarouselNavigation(
        artistsContainer,
        artistsPrevBtn,
        artistsNextBtn,
        180,
        16
      );
    }
  }

  /**
   * Thiết lập carousel navigation
   */
  _setupCarouselNavigation(container, prevBtn, nextBtn, cardWidth, gap) {
    if (!container || !prevBtn || !nextBtn) return () => {}; // bỏ qua nếu thiếu phần tử

    let currentPosition = 0;
    const totalCards = container.children.length;
    let resizeTimeout;
    const scrollStep = 3;

    // Tính số card hiển thị
    const calculateVisibleCards = () => {
      if (!container.parentElement) return 1;
      const containerWidth = container.parentElement.offsetWidth || 0;
      return Math.max(1, Math.floor(containerWidth / (cardWidth + gap)));
    };

    let visibleCards = calculateVisibleCards();
    let maxPosition = Math.max(0, totalCards - visibleCards);

    // Cập nhật trạng thái nút
    const updateButtonStates = () => {
      const shouldShowNav = totalCards > visibleCards; // chỉ hiện khi có nhiều card
      prevBtn.style.display =
        shouldShowNav && currentPosition > 0 ? "block" : "none";
      nextBtn.style.display =
        shouldShowNav && currentPosition < maxPosition ? "block" : "none";
    };

    // Di chuyển tới vị trí
    const moveToPosition = (position) => {
      currentPosition = Math.max(0, Math.min(position, maxPosition));
      const translateX = -currentPosition * (cardWidth + gap);

      container.style.transition =
        "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
      container.style.transform = `translateX(${translateX}px)`;

      updateButtonStates();
    };

    // Nút prev
    prevBtn.addEventListener("click", () => {
      if (currentPosition > 0) {
        moveToPosition(currentPosition - scrollStep);
      }
    });

    // Nút next
    nextBtn.addEventListener("click", () => {
      if (currentPosition < maxPosition) {
        moveToPosition(currentPosition + scrollStep);
      }
    });

    // Trạng thái ban đầu
    updateButtonStates();

    // Xử lý resize (debounce)
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newVisibleCards = calculateVisibleCards();
        const newMaxPosition = Math.max(0, totalCards - newVisibleCards);

        visibleCards = newVisibleCards;
        maxPosition = newMaxPosition;

        if (currentPosition > newMaxPosition) {
          currentPosition = newMaxPosition;
        }

        // Bỏ transition để reposition nhanh
        container.style.transition = "none";
        moveToPosition(currentPosition);

        // Khôi phục transition
        setTimeout(() => {
          container.style.transition =
            "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        }, 10);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }

  /**
   * Thiết lập events
   */
  _setupCommonEvents() {
    const logo = document.querySelector(".logo > i");
    const homeBtn = document.querySelector(".home-btn");

    if (logo) {
      logo.addEventListener("click", () => this._showHome());
    }

    if (homeBtn) {
      homeBtn.addEventListener("click", () => this._showHome());
    }
  }

  /**
   * Thiết lập follow button events
   */
  _setupFollowButtonEvents() {
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
        this._updateFollowButtonUI(followBtn, isFollowed);

        // Refresh library để cập nhật lại
        const library = window.spotifyApp.getService("library");
        if (library) {
          await library.refreshLibrary();
        }

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

  _setupLikeButtonEvents() {
    const likeBtns = document.querySelectorAll(".track-like-btn");

    likeBtns.forEach((likeBtn) => {
      likeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = likeBtn.getAttribute("data-id");
        const type = likeBtn.getAttribute("data-type");
        if (!id || !type) return;

        try {
          const apiService = window.spotifyApp.getService("api");
          const uiService = window.spotifyApp.getService("ui");

          if (!apiService) return;

          // Disable button trong lúc xử lý
          likeBtn.disabled = true;
          likeBtn.style.opacity = "0.5";

          let isLiked;
          if (type === "like-action") {
            await apiService.likeTrack(id);
            isLiked = true;
          } else if (type === "unlike-action") {
            await apiService.unlikeTrack(id);
            isLiked = false;
          }

          if (isLiked) {
            likeBtn.querySelector("i").className = "fa-solid fa-heart";
            likeBtn.setAttribute("data-type", "unlike-action");
          } else {
            likeBtn.querySelector("i").className = "fa-regular fa-heart";
            likeBtn.setAttribute("data-type", "like-action");
          }

          // Refresh library
          const library = window.spotifyApp.getService("library");
          if (library) {
            await library.refreshLibrary();
          }

          // Toast kết quả
          if (uiService) {
            const message = isLiked
              ? "Added to Liked Songs"
              : "Removed from Liked Songs";
            uiService.showToast(message, "success");
          }
        } catch (error) {
          console.error("Lỗi like/unlike:", error);
          const uiService = window.spotifyApp.getService("ui");
          if (uiService) {
            uiService.showToast("Có lỗi xảy ra", "error");
          }
        } finally {
          likeBtn.disabled = false;
          likeBtn.style.opacity = "1";
        }
      });
    });
  }

  /**
   * Cập nhật UI của follow button
   */
  _updateFollowButtonUI(button, isFollowed) {
    const icon = button.querySelector("i");
    const label = button.getAttribute("data-label");

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
}

export const home = new Home();
export default home;
