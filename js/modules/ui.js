/**
 * UI Module
 * Module xử lý tất cả các component UI như modal, toast, tooltip, filter, search
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
    this._setupLibraryFilterEvents();
    this._setupContextMenu();
    this._setupAuthModalEvents();
    this._setupUserMenuEvents();
    this._setupGlobalEvents();
    this._setupHomeNavigation();

    // Render Home page sau khi DOM đã sẵn sàng
    setTimeout(() => {
      this.renderHomePage();
    }, 1000); // Delay 1 giây để đảm bảo các service khác đã khởi tạo
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
   * Thiết lập auth modal events
   */
  _setupAuthModalEvents() {
    const signupBtn = document.querySelector(".signup-btn");
    const loginBtn = document.querySelector(".login-btn");
    const authModal = document.getElementById("authModal");
    const modalClose = document.getElementById("modalClose");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showSignupBtn = document.getElementById("showSignup");

    if (signupBtn) {
      signupBtn.addEventListener("click", () => {
        this._showSignupForm();
        this.openModal("authModal");
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        this._showLoginForm();
        this.openModal("authModal");
      });
    }

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        this.closeModalById("authModal");
      });
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener("click", () => {
        this._showLoginForm();
      });
    }

    if (showSignupBtn) {
      showSignupBtn.addEventListener("click", () => {
        this._showSignupForm();
      });
    }

    // Form submit events sẽ được xử lý bởi auth service
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        this._handleAuthFormSubmit(e, "signup");
      });

      // Thêm real-time validation cho signup form
      this._setupFormValidation(signupForm, "signup");
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        this._handleAuthFormSubmit(e, "login");
      });

      // Thêm real-time validation cho login form
      this._setupFormValidation(loginForm, "login");
    }
  }

  /**
   * Thiết lập validation real-time cho form
   */
  _setupFormValidation(form, formType) {
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
  _validateForm(form, formType) {
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
   * Thiết lập user menu events
   */
  _setupUserMenuEvents() {
    const userAvatar = document.getElementById("userAvatar");
    const logoutBtn = document.getElementById("logoutBtn");

    if (userAvatar) {
      userAvatar.addEventListener("click", (e) => {
        e.stopPropagation();
        this._toggleUserDropdown();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        // Gọi auth service để logout
        if (window.spotifyApp && window.spotifyApp.getService) {
          const authService = window.spotifyApp.getService("auth");
          if (authService) {
            authService.logout();
          }
        }
      });
    }

    // Close dropdown khi click outside
    document.addEventListener("click", () => {
      this._hideUserDropdown();
    });
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
   * Xử lý submit form authentication
   */
  _handleAuthFormSubmit(e, formType) {
    e.preventDefault();

    const form = e.target;

    // Validation form trước khi submit
    if (!this._validateForm(form, formType)) {
      return; // Không submit nếu form không hợp lệ
    }

    const formData = new FormData(form);

    if (formType === "signup") {
      const userData = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      // Gọi auth service để đăng ký
      if (window.spotifyApp && window.spotifyApp.getService) {
        const authService = window.spotifyApp.getService("auth");
        if (authService) {
          authService
            .register(userData)
            .then(() => {
              this.closeModalById("authModal");
              form.reset();
              // Reset tất cả error messages
              this._resetFormErrors(form);
            })
            .catch((error) => {
              console.error("Signup error:", error);
              // Không cần hiển thị error ở đây vì auth service đã xử lý
            });
        }
      }
    } else if (formType === "login") {
      const credentials = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      // Gọi auth service để đăng nhập
      if (window.spotifyApp && window.spotifyApp.getService) {
        const authService = window.spotifyApp.getService("auth");
        if (authService) {
          authService
            .login(credentials)
            .then(() => {
              this.closeModalById("authModal");
              form.reset();
              // Reset tất cả error messages
              this._resetFormErrors(form);
            })
            .catch((error) => {
              console.error("Login error:", error);
              // Không cần hiển thị error ở đây vì auth service đã xử lý
            });
        }
      }
    }
  }

  /**
   * Reset tất cả error messages trong form
   */
  _resetFormErrors(form) {
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      this._clearInputError(input);
    });
  }

  /**
   * Hiển thị form đăng ký
   */
  _showSignupForm() {
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
  _showLoginForm() {
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
  _toggleUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    if (userDropdown) {
      userDropdown.classList.toggle("show");
    }
  }

  /**
   * Ẩn user dropdown
   */
  _hideUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    if (userDropdown) {
      userDropdown.classList.remove("show");
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

  // ===== HOME PAGE RENDERING METHODS =====

  /**
   * Render "Today's biggest hits" section
   */
  renderTodaysHits(playlists) {
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
   * Xử lý click vào playlist
   */
  _handlePlaylistClick(playlist) {
    console.log("Playlist clicked:", playlist);
    // TODO: Implement playlist detail page or play functionality
    this.showToast(
      `Đang mở playlist: ${playlist.name || playlist.title}`,
      "info"
    );
  }

  /**
   * Xử lý click vào artist
   */
  _handleArtistClick(artist) {
    console.log("Artist clicked:", artist);
    // TODO: Implement artist detail page
    this.showToast(
      `Đang mở trang nghệ sĩ: ${artist.name || artist.display_name}`,
      "info"
    );
  }

  /**
   * Render toàn bộ trang Home
   */
  renderHomePage() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const homeService = window.spotifyApp.getService("home");
      if (homeService) {
        // Render Today's biggest hits
        const todaysHits = homeService.getTodaysHits();
        this.renderTodaysHits(todaysHits);

        // Render Popular artists
        const popularArtists = homeService.getPopularArtists();
        this.renderPopularArtists(popularArtists);
      }
    }
  }

  /**
   * Refresh trang Home
   */
  async refreshHomePage() {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const homeService = window.spotifyApp.getService("home");
      if (homeService) {
        await homeService.refreshHomeData();
        this.renderHomePage();
      }
    }
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
    let currentPosition = 0;
    const totalCards = container.children.length;
    let resizeTimeout;
    const scrollStep = 3;

    // Calculate visible cards and max position
    const calculateVisibleCards = () => {
      const containerWidth = container.parentElement.offsetWidth;
      return Math.floor(containerWidth / (cardWidth + gap));
    };

    let visibleCards = calculateVisibleCards();
    let maxPosition = Math.max(0, totalCards - visibleCards);

    // Update button states
    const updateButtonStates = () => {
      prevBtn.disabled = currentPosition <= 0;
      nextBtn.disabled = currentPosition >= maxPosition;
    };

    // Move to position with smooth animation
    const moveToPosition = (position) => {
      currentPosition = Math.max(0, Math.min(position, maxPosition));
      const translateX = -currentPosition * (cardWidth + gap);

      // Add smooth transition
      container.style.transition =
        "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
      container.style.transform = `translateX(${translateX}px)`;

      updateButtonStates();
    };

    // Event listeners with smooth animation
    prevBtn.addEventListener("click", () => {
      if (currentPosition > 0) {
        const newPosition = Math.max(0, currentPosition - scrollStep);
        moveToPosition(newPosition);
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentPosition < maxPosition) {
        const newPosition = Math.min(maxPosition, currentPosition + scrollStep);
        moveToPosition(newPosition);
      }
    });

    // Initial state
    updateButtonStates();

    // Handle window resize with debounce
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

        // Remove transition temporarily for instant repositioning
        container.style.transition = "none";
        moveToPosition(currentPosition);

        // Restore transition after repositioning
        setTimeout(() => {
          container.style.transition =
            "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        }, 10);
      }, 150); // Debounce delay
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }
}

// Export instance singleton
export const uiService = new UIService();
export default uiService;
