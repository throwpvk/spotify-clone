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
    this.contextMenu = null;
    this._init();
  }

  /**
   * Khởi tạo service
   */
  _init() {
    this._disableContextMenu();
    this._disableUserSelect();
    this._setupLibraryFilterEvents();
    this._setupContextMenu();
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

  /**
   * Thiết lập context menu
   */
  _setupContextMenu() {
    // Tạo context menu element
    this._createContextMenu();

    // Thêm event listeners cho library items
    this._setupLibraryItemContextMenu();

    // Đóng context menu khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!this.contextMenu?.contains(e.target)) {
        this._hideContextMenu();
      }
    });
  }

  /**
   * Tạo context menu element
   */
  _createContextMenu() {
    const contextMenuHTML = `
      <div class="context-menu" id="contextMenu">
        <div class="context-menu-item" data-action="unfollow">
          <i class="fas fa-user-minus"></i>
          <span>Unfollow</span>
        </div>
        <div class="context-menu-item" data-action="remove">
          <i class="fas fa-user-times"></i>
          <span>Remove from profile</span>
        </div>
        <div class="context-menu-item" data-action="delete">
          <i class="fas fa-trash"></i>
          <span>Delete</span>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", contextMenuHTML);
    this.contextMenu = document.getElementById("contextMenu");

    // Thêm event listeners cho context menu items
    this._setupContextMenuActions();
  }

  /**
   * Thiết lập context menu cho library items
   */
  _setupLibraryItemContextMenu() {
    const libraryContent = document.querySelector(".library-content");

    if (libraryContent) {
      libraryContent.addEventListener("contextmenu", (e) => {
        const libraryItem = e.target.closest(".library-item");
        if (libraryItem) {
          e.preventDefault();
          this._showContextMenu(e, libraryItem);
        }
      });
    }
  }

  /**
   * Hiển thị context menu
   */
  _showContextMenu(event, targetElement) {
    const itemType = targetElement.dataset.type?.toLowerCase();
    const itemName = targetElement.querySelector(".item-title")?.textContent;

    if (!itemType || !itemName) return;

    // Lưu thông tin item hiện tại
    this.currentContextItem = {
      element: targetElement,
      type: itemType,
      name: itemName,
    };

    // Hiển thị/ẩn các menu items dựa trên type
    this._updateContextMenuItems(itemType);

    // Đặt vị trí context menu
    const menuWidth = 200;
    const menuHeight = 120;

    let left = event.clientX;
    let top = event.clientY;

    // Đảm bảo menu không bị tràn ra ngoài màn hình
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 10;
    }

    if (top + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - 10;
    }

    this.contextMenu.style.left = `${left}px`;
    this.contextMenu.style.top = `${top}px`;
    this.contextMenu.style.display = "block";
  }

  /**
   * Cập nhật các menu items dựa trên type
   */
  _updateContextMenuItems(itemType) {
    const unfollowItem = this.contextMenu.querySelector(
      '[data-action="unfollow"]'
    );
    const removeItem = this.contextMenu.querySelector('[data-action="remove"]');
    const deleteItem = this.contextMenu.querySelector('[data-action="delete"]');

    // Ẩn tất cả items trước
    unfollowItem.style.display = "none";
    removeItem.style.display = "none";
    deleteItem.style.display = "none";

    // Hiển thị items phù hợp với type
    if (itemType === "artist") {
      unfollowItem.style.display = "flex";
    } else if (itemType === "playlist") {
      removeItem.style.display = "flex";
      deleteItem.style.display = "flex";
    }
  }

  /**
   * Ẩn context menu
   */
  _hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.display = "none";
    }
    this.currentContextItem = null;
  }

  /**
   * Thiết lập các actions cho context menu
   */
  _setupContextMenuActions() {
    this.contextMenu.addEventListener("click", (e) => {
      const menuItem = e.target.closest(".context-menu-item");
      if (!menuItem) return;

      const action = menuItem.dataset.action;
      this._handleContextMenuAction(action);
    });
  }

  /**
   * Xử lý các actions của context menu
   */
  _handleContextMenuAction(action) {
    if (!this.currentContextItem) return;

    const { type, name, element } = this.currentContextItem;

    switch (action) {
      case "unfollow":
        if (type === "artist") {
          this._handleUnfollowArtist(name, element);
        }
        break;

      case "remove":
        if (type === "playlist") {
          this._handleRemovePlaylist(name, element);
        }
        break;

      case "delete":
        if (type === "playlist") {
          this._handleDeletePlaylist(name, element);
        }
        break;
    }

    this._hideContextMenu();
  }

  /**
   * Xử lý unfollow artist
   */
  _handleUnfollowArtist(artistName, element) {
    console.log(`Unfollowing artist: ${artistName}`);

    // Hiển thị confirmation dialog
    if (confirm(`Bạn có chắc muốn unfollow "${artistName}"?`)) {
      // Thêm hiệu ứng fade out
      element.style.transition = "opacity 0.3s ease";
      element.style.opacity = "0";

      setTimeout(() => {
        element.remove();
        this._showToast(`Đã unfollow "${artistName}"`, "success");
      }, 300);
    }
  }

  /**
   * Xử lý remove playlist from profile
   */
  _handleRemovePlaylist(playlistName, element) {
    console.log(`Removing playlist from profile: ${playlistName}`);

    if (confirm(`Bạn có chắc muốn xóa "${playlistName}" khỏi profile?`)) {
      element.style.transition = "opacity 0.3s ease";
      element.style.opacity = "0";

      setTimeout(() => {
        element.remove();
        this._showToast(`Đã xóa "${playlistName}" khỏi profile`, "success");
      }, 300);
    }
  }

  /**
   * Xử lý delete playlist
   */
  _handleDeletePlaylist(playlistName, element) {
    console.log(`Deleting playlist: ${playlistName}`);

    if (
      confirm(
        `Bạn có chắc muốn xóa vĩnh viễn "${playlistName}"? Hành động này không thể hoàn tác.`
      )
    ) {
      element.style.transition = "opacity 0.3s ease";
      element.style.opacity = "0";

      setTimeout(() => {
        element.remove();
        this._showToast(`Đã xóa playlist "${playlistName}"`, "success");
      }, 300);
    }
  }

  /**
   * Hiển thị toast message
   */
  _showToast(message, type = "info") {
    // Tạo toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${
        type === "success" ? "check-circle" : "info-circle"
      }"></i>
      <span>${message}</span>
    `;

    // Thêm vào body
    document.body.appendChild(toast);

    // Hiển thị toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Mở modal
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("show");
      this.activeModals.add(modalId);
    }
  }

  /**
   * Đóng modal theo ID
   */
  closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("show");
      this.activeModals.delete(modalId);
    }
  }

  /**
   * Hiển thị loading
   */
  showLoading(container, message = "Loading...") {
    const loading = document.createElement("div");
    loading.className = "loading";
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <span>${message}</span>
    `;

    if (container) {
      container.appendChild(loading);
    }

    return loading;
  }

  /**
   * Ẩn loading
   */
  hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.remove();
    }
  }

  /**
   * Hiển thị toast message (public method)
   */
  showToast(message, type = "info") {
    this._showToast(message, type);
  }
}

// Export instance singleton
export const uiService = new UIService();
export default uiService;
