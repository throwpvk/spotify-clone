/**
 * UI Service Module
 * Service xử lý các UI components cơ bản: modal, toast, context menu, form validation
 */

import { APP_CONFIG } from "../constants/config.js";
import { MESSAGES } from "../constants/messages.js";

class UIService {
  constructor() {
    this.activeModals = new Set();
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
    this.setupContextMenu();
    this._setupGlobalEvents();
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
   * Thiết lập global events
   */
  _setupGlobalEvents() {
    // Escape key để đóng modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this._closeAllModals();
      }
    });

    // Click outside để đóng modals
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal(e.target);
      }
    });
  }

  /**
   * Thiết lập context menu
   */
  setupContextMenu() {
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

    if (!itemType || !itemName || itemType === "liked") return;

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
    } else if (itemType === "myplaylist") {
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
          console.log(element);
        }
        break;

      case "remove":
        if (type === "playlist") {
          this._handleRemovePlaylist(name, element);
          console.log(element);
        }
        break;

      case "delete":
        if (type === "myplaylist") {
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

    // Chọn icon và class phù hợp với từng loại
    let iconClass, iconText;
    switch (type) {
      case "success":
        iconClass = "fas fa-check-circle";
        iconText = "✓";
        break;
      case "error":
        iconClass = "fas fa-exclamation-circle";
        iconText = "✗";
        break;
      case "warning":
        iconClass = "fas fa-exclamation-triangle";
        iconText = "⚠";
        break;
      default:
        iconClass = "fas fa-info-circle";
        iconText = "ℹ";
    }

    toast.innerHTML = `
      <i class="${iconClass}"></i>
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
   * Đóng modal
   */
  closeModal(modal) {
    if (modal) {
      modal.classList.remove("show");
      const modalId = modal.id;
      if (modalId) {
        this.activeModals.delete(modalId);
      }
    }
  }

  /**
   * Đóng tất cả modals
   */
  _closeAllModals() {
    const modals = document.querySelectorAll(".modal.show");
    modals.forEach((modal) => {
      this.closeModal(modal);
    });
  }

  /**
   * Hiển thị toast message (public method)
   */
  showToast(message, type = "info") {
    this._showToast(message, type);
  }

  /**
   * Thiết lập form validation
   */
  setupFormValidation(form, formType) {
    const inputs = form.querySelectorAll("input");

    inputs.forEach((input) => {
      // Validation khi user nhập
      input.addEventListener("input", () => {
        this._validateInput(input, formType);
      });

      // Validation khi user rời khỏi input
      input.addEventListener("blur", () => {
        this._validateInput(input, formType);
      });

      // Validation khi user focus vào input
      input.addEventListener("focus", () => {
        this._clearInputError(input);
      });
    });
  }

  /**
   * Validation cho từng input
   */
  _validateInput(input, formType) {
    const value = input.value.trim();
    const fieldName = input.name;
    let isValid = true;
    let errorMessage = "";

    // Validation theo từng field
    switch (fieldName) {
      case "username":
        if (formType === "signup") {
          if (!value) {
            isValid = false;
            errorMessage = "Vui lòng nhập tên người dùng";
          } else if (value.length < APP_CONFIG.VALIDATION.USERNAME_MIN_LENGTH) {
            isValid = false;
            errorMessage = `Tên người dùng phải có ít nhất ${APP_CONFIG.VALIDATION.USERNAME_MIN_LENGTH} ký tự`;
          } else if (value.length > APP_CONFIG.VALIDATION.USERNAME_MAX_LENGTH) {
            isValid = false;
            errorMessage = `Tên người dùng không được quá ${APP_CONFIG.VALIDATION.USERNAME_MAX_LENGTH} ký tự`;
          } else if (!APP_CONFIG.VALIDATION.USERNAME_REGEX.test(value)) {
            isValid = false;
            errorMessage =
              "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới";
          }
        }
        break;

      case "email":
        if (!value) {
          isValid = false;
          errorMessage = "Vui lòng nhập email";
        } else if (!APP_CONFIG.VALIDATION.EMAIL_REGEX.test(value)) {
          isValid = false;
          errorMessage = "Vui lòng nhập email hợp lệ";
        }
        break;

      case "password":
        if (!value) {
          isValid = false;
          errorMessage = "Vui lòng nhập mật khẩu";
        } else if (value.length < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
          isValid = false;
          errorMessage = `Mật khẩu phải có ít nhất ${APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`;
        } else if (!APP_CONFIG.VALIDATION.PASSWORD_REGEX.test(value)) {
          isValid = false;
          errorMessage = "Mật khẩu phải bao gồm chữ hoa, chữ thường và số";
        }
        break;
    }

    // Hiển thị hoặc ẩn error message
    if (!isValid) {
      this._showInputError(input, errorMessage);
    } else {
      this._clearInputError(input);
    }

    return isValid;
  }

  /**
   * Hiển thị error cho input
   */
  _showInputError(input, message) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    if (errorElement) {
      errorElement.querySelector("span").textContent = message;
      errorElement.style.display = "flex";
      formGroup.classList.add("invalid");
    }
  }

  /**
   * Ẩn error cho input
   */
  _clearInputError(input) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    if (errorElement) {
      errorElement.style.display = "none";
      formGroup.classList.remove("invalid");
    }
  }

  /**
   * Validation toàn bộ form trước khi submit
   */
  validateForm(form, formType) {
    const inputs = form.querySelectorAll("input");
    let isValid = true;

    inputs.forEach((input) => {
      if (!this._validateInput(input, formType)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Reset tất cả error messages trong form
   */
  resetFormErrors(form) {
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      this._clearInputError(input);
    });
  }

  /**
   * Hiển thị form đăng ký
   */
  showSignupForm() {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    if (signupForm && loginForm) {
      signupForm.style.display = "block";
      loginForm.style.display = "none";
    }
  }

  /**
   * Hiển thị form đăng nhập
   */
  showLoginForm() {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    if (signupForm && loginForm) {
      signupForm.style.display = "none";
      loginForm.style.display = "block";
    }
  }

  /**
   * Toggle user dropdown
   */
  toggleUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    if (userDropdown) {
      userDropdown.classList.toggle("show");
    }
  }

  /**
   * Ẩn user dropdown
   */
  hideUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    if (userDropdown) {
      userDropdown.classList.remove("show");
    }
  }

  /**
   * Cập nhật UI cho user đã đăng nhập
   */
  updateUIForAuthenticatedUser() {
    // Ẩn nút đăng nhập/đăng ký
    const authButtons = document.querySelectorAll(".signup-btn, .login-btn");
    authButtons.forEach((btn) => (btn.style.display = "none"));

    // Hiển thị user info
    const userInfo = document.querySelector(".user-menu");
    if (userInfo) {
      userInfo.style.display = "flex";
    }

    // Cập nhật avatar và tên
    if (window.spotifyApp && window.spotifyApp.getService) {
      const authService = window.spotifyApp.getService("auth");
      if (authService) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const userAvatar = document.getElementById("userAvatar");
          const userName = document.getElementById("userName");

          if (userAvatar && currentUser.avatar) {
            userAvatar.src = currentUser.avatar;
          }

          if (userName && currentUser.displayName) {
            userName.textContent = currentUser.displayName;
          }
        }
      }
    }
  }

  /**
   * Cập nhật UI cho user chưa đăng nhập
   */
  updateUIForUnauthenticatedUser() {
    // Hiển thị nút đăng nhập/đăng ký
    const authButtons = document.querySelectorAll(".signup-btn, .login-btn");
    authButtons.forEach((btn) => (btn.style.display = "block"));

    // Ẩn user info
    const userInfo = document.querySelector(".user-menu");
    if (userInfo) {
      userInfo.style.display = "none";
    }
  }

  /**
   * Thiết lập library filter events
   */
  _setupLibraryFilterEvents() {
    // Lọc playlists/artists
    const playlistTab = document.querySelector(".tab-playlist");
    const artistTab = document.querySelector(".tab-artist");
    const libraryContent = document.querySelector(".library-content");
    const searchLibraryBtn = document.querySelector(".search-library-btn");
    const searchLibraryInput = document.querySelector(".search-library-input");
    const librarySortBtn = document.querySelector(".sort-btn");

    if (!playlistTab || !artistTab || !libraryContent) return;

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

    if (searchLibraryBtn && searchLibraryInput) {
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
}

export const uiService = new UIService();
export default uiService;
