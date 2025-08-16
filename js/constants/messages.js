/**
 * Application Messages Constants
 * Chứa tất cả các message
 */

export const MESSAGES = {
  // Common Messages
  COMMON: {
    LOADING: "Đang tải...",
    SUCCESS: "Thành công!",
    ERROR: "Có lỗi xảy ra!",
    WARNING: "Cảnh báo!",
    INFO: "Thông tin",
    CONFIRM: "Xác nhận",
    CANCEL: "Hủy bỏ",
    SAVE: "Lưu",
    DELETE: "Xóa",
    EDIT: "Chỉnh sửa",
    CLOSE: "Đóng",
    SUBMIT: "Gửi",
    RESET: "Đặt lại",
  },

  // Authentication Messages
  AUTH: {
    // Login
    LOGIN_TITLE: "Đăng nhập",
    LOGIN_SUCCESS: "Đăng nhập thành công!",
    LOGIN_FAILED: "Đăng nhập thất bại!",
    LOGIN_INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác",
    LOGIN_EMAIL_REQUIRED: "Vui lòng nhập email",
    LOGIN_PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu",

    // Register
    REGISTER_TITLE: "Đăng ký",
    REGISTER_SUCCESS: "Đăng ký thành công!",
    REGISTER_FAILED: "Đăng ký thất bại!",
    REGISTER_EMAIL_EXISTS: "Email đã được sử dụng",
    REGISTER_USERNAME_EXISTS: "Tên người dùng đã tồn tại",
    REGISTER_PASSWORD_WEAK: "Mật khẩu quá yếu",

    // Logout
    LOGOUT_SUCCESS: "Đăng xuất thành công!",
    LOGOUT_FAILED: "Đăng xuất thất bại!",

    // Validation
    VALIDATION_EMAIL_INVALID: "Email không hợp lệ",
    VALIDATION_PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 6 ký tự",
    VALIDATION_PASSWORD_WEAK: "Mật khẩu phải bao gồm chữ hoa, chữ thường và số",
    VALIDATION_USERNAME_TOO_SHORT: "Tên người dùng phải có ít nhất 3 ký tự",
    VALIDATION_USERNAME_TOO_LONG: "Tên người dùng không được quá 30 ký tự",
    VALIDATION_USERNAME_INVALID:
      "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
  },

  // Form Messages
  FORM: {
    REQUIRED_FIELD: "Trường này là bắt buộc",
    INVALID_FORMAT: "Định dạng không hợp lệ",
    MIN_LENGTH: "Phải có ít nhất {min} ký tự",
    MAX_LENGTH: "Không được quá {max} ký tự",
  },

  // Error Messages
  ERRORS: {
    NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet",
    SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau",
    TIMEOUT_ERROR: "Yêu cầu quá thời gian chờ. Vui lòng thử lại",
    UNKNOWN_ERROR: "Có lỗi không xác định xảy ra",
  },

  // Success Messages
  SUCCESS: {
    OPERATION_SUCCESS: "Thao tác thành công!",
    DATA_LOADED: "Dữ liệu đã được tải",
    CHANGES_SAVED: "Thay đổi đã được lưu",
  },

  // UI Messages
  UI: {
    TOOLTIP_DEFAULT: "Thông tin bổ sung",
    MODAL_CLOSE: "Nhấn ESC để đóng",
    LOADING_PLEASE_WAIT: "Vui lòng chờ...",
  },

  // Music Messages
  MUSIC: {
    PLAYLIST_LOADED: "Playlist đã được tải",
    ARTIST_LOADED: "Thông tin nghệ sĩ đã được tải",
    NO_MUSIC_FOUND: "Không tìm thấy nhạc",
  },
};

export const TOOLTIPS = {
  PLAY: "Phát",
  PAUSE: "Tạm dừng",
  NEXT: "Bài tiếp theo",
  PREVIOUS: "Bài trước",
  SHUFFLE: "Phát ngẫu nhiên",
  REPEAT: "Lặp lại",
  VOLUME: "Âm lượng",
  MUTE: "Tắt tiếng",
  FOLLOW: "Follow",
  UNFOLLOW: "Unfollow",
  LIKE: "Thích",
  DISLIKE: "Bỏ thích",
  ADD_TO_PLAYLIST: "Thêm vào playlist",
  REMOVE_FROM_PLAYLIST: "Xóa khỏi playlist",
  CREATE_PLAYLIST: "Tạo playlist mới",
  EDIT_PLAYLIST: "Chỉnh sửa playlist",
  DELETE_PLAYLIST: "Xóa playlist",
};
