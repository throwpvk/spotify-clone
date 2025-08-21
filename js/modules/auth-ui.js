/**
 * Auth UI Module
 * Module xử lý các UI events liên quan đến authentication
 */

class AuthUI {
  constructor() {
    this._init();
  }

  /**
   * Khởi tạo auth UI
   */
  _init() {
    this._setupAuthModalEvents();
    this._setupUserMenuEvents();
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
        this._openModal("authModal");
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        this._showLoginForm();
        this._openModal("authModal");
      });
    }

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        this._closeModal("authModal");
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

    // Form submit events
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        this._handleAuthFormSubmit(e, "signup");
      });

      // Thêm real-time validation cho signup form
      if (window.spotifyApp && window.spotifyApp.getService) {
        const uiService = window.spotifyApp.getService("ui");
        if (uiService) {
          uiService.setupFormValidation(signupForm, "signup");
        }
      }
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        this._handleAuthFormSubmit(e, "login");
      });

      // Thêm real-time validation cho login form
      if (window.spotifyApp && window.spotifyApp.getService) {
        const uiService = window.spotifyApp.getService("ui");
        if (uiService) {
          uiService.setupFormValidation(loginForm, "login");
        }
      }
    }
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
   * Xử lý submit form authentication
   */
  _handleAuthFormSubmit(e, formType) {
    e.preventDefault();

    const form = e.target;

    // Validation form trước khi submit
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService && !uiService.validateForm(form, formType)) {
        return; // Không submit nếu form không hợp lệ
      }
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
              this._closeModal("authModal");
              form.reset();
              // Reset tất cả error messages
              if (window.spotifyApp && window.spotifyApp.getService) {
                const uiService = window.spotifyApp.getService("ui");
                if (uiService) {
                  uiService.resetFormErrors(form);
                }
              }
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
              this._closeModal("authModal");
              form.reset();
              // Reset tất cả error messages
              if (window.spotifyApp && window.spotifyApp.getService) {
                const uiService = window.spotifyApp.getService("ui");
                if (uiService) {
                  uiService.resetFormErrors(form);
                }
              }
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
   * Mở modal
   */
  _openModal(modalId) {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.openModal(modalId);
      }
    }
  }

  /**
   * Đóng modal
   */
  _closeModal(modalId) {
    if (window.spotifyApp && window.spotifyApp.getService) {
      const uiService = window.spotifyApp.getService("ui");
      if (uiService) {
        uiService.closeModalById(modalId);
      }
    }
  }
}

export const authUI = new AuthUI();
export default authUI;
