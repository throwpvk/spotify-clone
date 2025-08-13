/**
 * UI Module
 * Module xử lý tất cả các component UI như modal, toast, tooltip, filter, search
 */

import { APP_CONFIG } from "../constants/config.js";
import { MESSAGES } from "../constants/messages.js";

class UIService {
  constructor() {
    this.activeModals = new Set();
    this.activeTooltips = new Set();
    this.toastQueue = [];
    this.isShowingToast = false;
    this._init();
  }

  /**
   * Khởi tạo service
   */
  _init() {
    this._disableContextMenu();
    this._disableUserSelect();
    this._setupLibraryFilterEvents();
  }

  /**
   * Vô hiệu hóa context menu
   */
  _disableContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  /**
   * Vô hiệu hóa user select
   */
  _disableUserSelect() {
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.mozUserSelect = "none";
    document.body.style.msUserSelect = "none";
  }

  /**
   * Thêm sự kiện lọc
   */
  _setupLibraryFilterEvents() {
    // Lọc playlists/artists
    const playlistTab = document.querySelector(".tab-playlist");
    const artistTab = document.querySelector(".tab-artist");
    const libraryContent = document.querySelector(".library-content");
    const searchLibraryBtn = document.querySelector(".search-library-btn");
    const searchLibraryInput = document.querySelector(".search-library-input");
    const librarySortBtn = document.querySelector(".sort-btn");

    function filterLibrary(hideType) {
      const items = libraryContent.querySelectorAll(".library-item");
      items.forEach((item) => {
        const type = item.dataset.type?.toLowerCase() || "";
        item.style.display = type === hideType.toLowerCase() ? "none" : "";
      });
    }

    playlistTab.addEventListener("click", () => {
      artistTab.classList.remove("active");
      playlistTab.classList.toggle("active");

      if (playlistTab.classList.contains("active")) {
        filterLibrary("artist");
      } else {
        filterLibrary(""); // hiện tất cả
      }
    });

    artistTab.addEventListener("click", () => {
      playlistTab.classList.remove("active");
      artistTab.classList.toggle("active");

      if (artistTab.classList.contains("active")) {
        filterLibrary("playlist");
      } else {
        filterLibrary(""); // hiện tất cả
      }
    });

    searchLibraryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      searchLibraryBtn.classList.add("active");
      searchLibraryInput.focus();
    });

    document.addEventListener("click", (e) => {
      if (
        !searchLibraryBtn.contains(e.target) &&
        !searchLibraryInput.contains(e.target)
      ) {
        searchLibraryBtn.classList.remove("active");
        searchLibraryInput.value = "";
        if (playlistTab.classList.contains("active")) {
          filterLibrary("artist");
        } else if (artistTab.classList.contains("active")) {
          filterLibrary("playlist");
        } else {
          filterLibrary(""); // hiện tất cả
        }
      }
    });

    // Sự kiện nhập vào ô tìm kiếm lọc
    searchLibraryInput.addEventListener("input", () => {
      const keyword = searchLibraryInput.value.trim().toLowerCase();

      const items = libraryContent.querySelectorAll(".library-item");

      // Xác định trạng thái hiện tại
      const isPlaylistActive = playlistTab.classList.contains("active");
      const isArtistActive = artistTab.classList.contains("active");

      items.forEach((item) => {
        const type = item.dataset.type?.toLowerCase() || "";
        const name = item
          .querySelector(".item-title")
          .textContent.toLowerCase();

        // Kiểm tra điều kiện lọc theo tab
        let typeMatch = true;
        if (isPlaylistActive) {
          typeMatch = type === "playlist";
        } else if (isArtistActive) {
          typeMatch = type === "artist";
        } // else không filter theo type

        // Kiểm tra keyword có nằm trong text hay không
        const keywordMatch = name.includes(keyword);

        // Nếu thỏa 2 điều kiện thì show, không thì ẩn
        item.style.display = typeMatch && keywordMatch ? "" : "none";
      });
    });
  }
}

// Export instance singleton
export const uiService = new UIService();
export default uiService;
