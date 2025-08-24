/**
 * Home Module
 * Module xử lý việc render Home page và navigation
 */

class Home {
  constructor() {
    this._init();
  }

  /**
   * Khởi tạo renderer
   */
  _init() {
    // Render Home page sau khi DOM đã sẵn sàng
    setTimeout(() => {
      this.renderHomePage();
    }, 2000); // Delay 2 giây để đảm bảo các service khác đã khởi tạo

    // TODO: fix để không cần delay 2 giây

    // Thiết lập common events
    this._setupCommonEvents();
  }

  /**
   * Render toàn bộ trang Home
   */
  renderHomePage() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const apiService = window.spotifyApp.getService("api");
      if (apiService) {
        // Render Today's biggest hits
        const allPlaylists = apiService.getCachedPlaylists();
        this.renderAllPlaylist(allPlaylists);

        // Render Popular artists
        const popularArtists = apiService.getCachedArtists();
        this.renderPopularArtists(popularArtists);
      }
    }
  }

  /**
   * Render "Today's biggest hits" section
   */
  renderAllPlaylist(playlists) {
    const container = document.querySelector(".hits-grid");
    if (!container) {
      console.warn("Today's hits container (.hits-grid) not found");
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Validate playlists là array
    if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
      container.innerHTML = '<p class="no-data">Không có dữ liệu</p>';
      return;
    }

    // Create container for cards
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "hits-grid-container";

    // Render each playlist
    playlists.forEach((playlist) => {
      const playlistCard = this._createPlaylistCard(playlist);
      cardsContainer.appendChild(playlistCard);
    });

    // Add cards container to main container
    container.appendChild(cardsContainer);

    // Create navigation buttons
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

    // Setup navigation
    this._setupHomeNavigation();
  }

  /**
   * Render "Popular artists" section
   */
  renderPopularArtists(artists) {
    const container = document.querySelector(".artists-grid");
    if (!container) {
      console.warn("Popular artists container (.artists-grid) not found");
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Validate artists là array
    if (!artists || !Array.isArray(artists) || artists.length === 0) {
      container.innerHTML = '<p class="no-data">Không có dữ liệu</p>';
      return;
    }

    // Create container for cards
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "artists-grid-container";

    // Render each artist
    artists.forEach((artist) => {
      const artistCard = this._createArtistCard(artist);
      cardsContainer.appendChild(artistCard);
    });

    // Add cards container to main container
    container.appendChild(cardsContainer);

    // Create navigation buttons
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

    // Setup navigation
    this._setupHomeNavigation();
  }

  /**
   * Tạo playlist card element
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

    // Add click event
    card.addEventListener("click", () => {
      this._handlePlaylistClick(playlist);
    });

    return card;
  }

  /**
   * Tạo artist card element
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

    // Add click event
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
   * Xử lý click vào playlist
   */
  _handlePlaylistClick(playlist) {
    console.log("Playlist clicked:", playlist);
    this.setDetailContent(playlist);
    this.hideHome();

    // Hiển thị toast thông báo
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.showToast(`Open ${playlist.name || playlist.title}`, "info");
      }
    }
  }

  /**
   * Xử lý click vào artist
   */
  _handleArtistClick(artist) {
    console.log("Artist clicked:", artist);
    this.setDetailContent(artist);
    this.hideHome();

    // Hiển thị toast thông báo
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
          <div class="track-duration">${durationStr}</div>
          <button data-label="tooltip" class="track-menu-btn">
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
                  ? `<button data-label="Add To Library" class="btn library-btn add">
                      <i class="fa-solid fa-circle-plus"></i>
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
  }

  /**
   * Thiết lập navigation cho Home page
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
   * Thiết lập carousel navigation cho một container
   */
  _setupCarouselNavigation(container, prevBtn, nextBtn, cardWidth, gap) {
    if (!container || !prevBtn || !nextBtn) return () => {}; // nếu thiếu phần tử thì bỏ qua

    let currentPosition = 0;
    const totalCards = container.children.length;
    let resizeTimeout;
    const scrollStep = 3;

    // Tính số card hiển thị được trong khung
    const calculateVisibleCards = () => {
      if (!container.parentElement) return 1;
      const containerWidth = container.parentElement.offsetWidth || 0;
      return Math.max(1, Math.floor(containerWidth / (cardWidth + gap)));
    };

    let visibleCards = calculateVisibleCards();
    let maxPosition = Math.max(0, totalCards - visibleCards);

    // Cập nhật trạng thái nút prev/next
    const updateButtonStates = () => {
      const shouldShowNav = totalCards > visibleCards; // chỉ hiện khi có nhiều card hơn khung
      prevBtn.style.display =
        shouldShowNav && currentPosition > 0 ? "block" : "none";
      nextBtn.style.display =
        shouldShowNav && currentPosition < maxPosition ? "block" : "none";
    };

    // Di chuyển tới vị trí mới
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

    // Xử lý khi resize (debounce)
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

        // Tạm bỏ transition để reposition nhanh
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
   * Thiết lập common events
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
}

export const home = new Home();
export default home;
