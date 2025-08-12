# Spotify Clone - Dự án Module 2

## 📋 Mô tả dự án

Dự án Spotify Clone được phát triển để áp dụng các kiến thức ES6+, ES modules, DOM manipulation, async/await và các kỹ thuật lập trình web hiện đại.

## 🎯 Mục tiêu dự án

- Phát triển các chức năng UI cơ bản (tooltip, modal, toast)
- Xây dựng hệ thống authentication (đăng ký, đăng nhập, đăng xuất)
- Quản lý playlist và artist (CRUD operations)
- Tích hợp API và xử lý dữ liệu
- Áp dụng kiến trúc module ES6

## 🏗️ Cấu trúc thư mục

```
spotify-clone/
├── index.html                 # File HTML chính
├── css/                      # Thư mục CSS
│   ├── reset.css             # Reset CSS
│   ├── variables.css         # CSS Variables
│   ├── components.css        # Component styles
│   ├── layout.css            # Layout styles
│   └── responsive.css        # Responsive styles
├── js/                       # Thư mục JavaScript (ES6 Modules)
│   ├── main.js              # Entry point - Khởi tạo ứng dụng
│   ├── constants/            # Constants và configuration
│   │   ├── api.js           # API endpoints
│   │   ├── config.js        # App configuration
│   │   └── messages.js      # Messages và error texts
│   ├── modules/             # Core modules
│   │   ├── api.js           # API service
│   │   ├── auth.js          # Authentication service
│   │   ├── ui.js            # UI components service
│   │   ├── playlist.js      # Playlist management
│   │   └── artist.js        # Artist management
│   └── services/            # Business logic services
│       ├── authService.js    # Authentication business logic
│       ├── playlistService.js # Playlist business logic
│       └── artistService.js  # Artist business logic
└── assets/                   # Assets (images, icons)
    ├── images/              # Hình ảnh
    └── icons/               # Icons
```

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies
Dự án sử dụng ES6 modules native, không cần package manager.

### 2. Chạy dự án
```bash
# Sử dụng live server hoặc http server
npx live-server
# hoặc
python -m http.server 8000
# hoặc
php -S localhost:8000
```

### 3. Truy cập ứng dụng
Mở trình duyệt và truy cập: `http://localhost:8000`

## 📚 Kiến trúc ES6 Modules

### Constants
- **`api.js`**: Chứa tất cả API endpoints và HTTP methods
- **`config.js`**: Cấu hình ứng dụng, validation rules, storage keys
- **`messages.js`**: Messages, error texts, tooltips

### Core Modules
- **`api.js`**: Service xử lý HTTP requests với retry logic và error handling
- **`auth.js`**: Quản lý authentication, validation, user state
- **`ui.js`**: Modal, toast, tooltip, loading, form management
- **`playlist.js`**: CRUD operations cho playlist
- **`artist.js`**: Quản lý artist và follow/unfollow

### Main Application
- **`main.js`**: Khởi tạo ứng dụng, điều phối services, event handling

## 🔧 Tính năng chính

### 1. Authentication System
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Validation form
- ✅ Auto-login sau đăng ký

### 2. UI Components
- ✅ Modal system
- ✅ Toast notifications
- ✅ Tooltips
- ✅ Loading states
- ✅ Context menu (chuột phải)

### 3. Playlist Management
- ✅ Tạo playlist mới
- ✅ Cập nhật playlist
- ✅ Xóa playlist
- ✅ Follow/Unfollow playlist
- ✅ Upload ảnh playlist

### 4. Artist Management
- ✅ Hiển thị danh sách artists
- ✅ Follow/Unfollow artist
- ✅ Chi tiết artist

### 5. API Integration
- ✅ RESTful API calls
- ✅ Error handling
- ✅ Retry logic
- ✅ Authentication headers
- ✅ File upload

## 🎨 UI/UX Features

- **Responsive Design**: Tương thích mobile và desktop
- **Modern UI**: Thiết kế giống Spotify thật
- **Smooth Animations**: CSS transitions và animations
- **Accessibility**: Keyboard navigation, screen reader support
- **Internationalization**: Hỗ trợ tiếng Việt

## 🔒 Security Features

- **Input Validation**: Client-side và server-side validation
- **Authentication**: JWT token management
- **XSS Prevention**: Sanitize user input
- **CSRF Protection**: Token-based protection

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🧪 Testing

### Manual Testing
- Test các chức năng authentication
- Test CRUD operations
- Test responsive design
- Test error handling

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚧 Development Status

### ✅ Completed
- [x] Project structure setup
- [x] ES6 modules architecture
- [x] Authentication system
- [x] UI components (modal, toast, tooltip)
- [x] API service layer
- [x] Playlist management
- [x] Artist management

### 🔄 In Progress
- [ ] Context menu implementation
- [ ] Search functionality
- [ ] Sort and filter
- [ ] Player controls

### 📋 Planned
- [ ] Music player
- [ ] Queue management
- [ ] Social features
- [ ] Advanced search
- [ ] Offline support

## 🐛 Troubleshooting

### Common Issues

1. **Module not found error**
   - Đảm bảo sử dụng live server hoặc http server
   - Không mở file trực tiếp từ file system

2. **CORS error**
   - Sử dụng live server hoặc http server
   - Kiểm tra API endpoint configuration

3. **Authentication not working**
   - Kiểm tra localStorage
   - Kiểm tra API response format

## 📖 API Documentation

### Authentication
```
POST /auth/register - Đăng ký
POST /auth/login - Đăng nhập
POST /auth/logout - Đăng xuất
```

### Playlists
```
GET /playlists/get-all - Lấy tất cả playlists
GET /playlists/get-playlist-by-id/:id - Lấy playlist theo ID
POST /playlists/create-playlist - Tạo playlist mới
PUT /playlists/update-playlist/:id - Cập nhật playlist
DELETE /playlists/delete-playlist/:id - Xóa playlist
POST /playlists/follow-playlist/:id - Follow playlist
POST /playlists/unfollow-playlist/:id - Unfollow playlist
```

### Artists
```
GET /artists/get-all-artists - Lấy tất cả artists
GET /artists/get-artist-by-id/:id - Lấy artist theo ID
POST /artists/follow-artist/:id - Follow artist
POST /artists/unfollow-artist/:id - Unfollow artist
```

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập. Không sử dụng cho mục đích thương mại.

## 👨‍💻 Author

**Student Name** - Module 2 Project

## 🙏 Acknowledgments

- Spotify UI/UX design inspiration
- ES6+ documentation
- Modern web development practices
- F8 community support

---

**Lưu ý**: Đây là dự án học tập, không phải sản phẩm thương mại. Các API endpoints cần được cập nhật theo backend thực tế. 