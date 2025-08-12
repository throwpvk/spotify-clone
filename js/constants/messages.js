/**
 * Application Messages
 * Chứa tất cả các message, error text và notification text
 */

export const MESSAGES = {
    // Success messages
    SUCCESS: {
        REGISTER: 'Đăng ký thành công!',
        LOGIN: 'Đăng nhập thành công!',
        LOGOUT: 'Đăng xuất thành công!',
        PLAYLIST_CREATED: 'Tạo playlist thành công!',
        PLAYLIST_UPDATED: 'Cập nhật playlist thành công!',
        PLAYLIST_DELETED: 'Xóa playlist thành công!',
        ARTIST_FOLLOWED: 'Đã follow artist!',
        ARTIST_UNFOLLOWED: 'Đã unfollow artist!',
        PLAYLIST_FOLLOWED: 'Đã follow playlist!',
        PLAYLIST_UNFOLLOWED: 'Đã unfollow playlist!',
        IMAGE_UPLOADED: 'Tải ảnh thành công!'
    },
    
    // Error messages
    ERROR: {
        NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng thử lại!',
        SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau!',
        UNAUTHORIZED: 'Bạn chưa đăng nhập. Vui lòng đăng nhập!',
        FORBIDDEN: 'Bạn không có quyền thực hiện hành động này!',
        NOT_FOUND: 'Không tìm thấy dữ liệu!',
        VALIDATION_ERROR: 'Dữ liệu không hợp lệ!',
        EMAIL_EXISTS: 'Email đã tồn tại!',
        INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng!',
        PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự!',
        INVALID_EMAIL: 'Email không hợp lệ!',
        PLAYLIST_CREATE_FAILED: 'Không thể tạo playlist!',
        PLAYLIST_UPDATE_FAILED: 'Không thể cập nhật playlist!',
        PLAYLIST_DELETE_FAILED: 'Không thể xóa playlist!',
        IMAGE_UPLOAD_FAILED: 'Không thể tải ảnh!'
    },
    
    // Info messages
    INFO: {
        LOADING: 'Đang tải...',
        SAVING: 'Đang lưu...',
        UPLOADING: 'Đang tải lên...',
        NO_PLAYLISTS: 'Bạn chưa có playlist nào',
        NO_ARTISTS: 'Bạn chưa follow artist nào',
        NO_RESULTS: 'Không tìm thấy kết quả'
    },
    
    // Confirmation messages
    CONFIRM: {
        DELETE_PLAYLIST: 'Bạn có chắc chắn muốn xóa playlist này?',
        UNFOLLOW_ARTIST: 'Bạn có chắc chắn muốn unfollow artist này?',
        UNFOLLOW_PLAYLIST: 'Bạn có chắc chắn muốn unfollow playlist này?',
        LOGOUT: 'Bạn có chắc chắn muốn đăng xuất?'
    },
    
    // Placeholder text
    PLACEHOLDER: {
        SEARCH: 'Tìm kiếm...',
        PLAYLIST_NAME: 'Tên playlist...',
        PLAYLIST_DESCRIPTION: 'Mô tả playlist...',
        EMAIL: 'Email của bạn...',
        PASSWORD: 'Mật khẩu...',
        USERNAME: 'Tên người dùng...'
    }
};

export const TOOLTIPS = {
    PLAY: 'Phát',
    PAUSE: 'Tạm dừng',
    NEXT: 'Bài tiếp theo',
    PREVIOUS: 'Bài trước',
    SHUFFLE: 'Phát ngẫu nhiên',
    REPEAT: 'Lặp lại',
    VOLUME: 'Âm lượng',
    MUTE: 'Tắt tiếng',
    FOLLOW: 'Follow',
    UNFOLLOW: 'Unfollow',
    LIKE: 'Thích',
    DISLIKE: 'Bỏ thích',
    ADD_TO_PLAYLIST: 'Thêm vào playlist',
    REMOVE_FROM_PLAYLIST: 'Xóa khỏi playlist',
    CREATE_PLAYLIST: 'Tạo playlist mới',
    EDIT_PLAYLIST: 'Chỉnh sửa playlist',
    DELETE_PLAYLIST: 'Xóa playlist'
}; 