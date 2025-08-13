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
    this.init();
  }

  /**
   * Khởi tạo service
   */
  init() {
    this.disableContextMenu();
    this.disableUserSelect();
  }

  /**
   * Vô hiệu hóa context menu
   */
  disableContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  /**
   * Vô hiệu hóa user select
   */
  disableUserSelect() {
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.mozUserSelect = "none";
    document.body.style.msUserSelect = "none";
  }
}

// Export instance singleton
export const uiService = new UIService();
export default uiService;
