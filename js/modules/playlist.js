/**
 * Playlist Module
 * Module xử lý tất cả logic liên quan đến playlist
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';
import { MESSAGES } from '../constants/messages.js';
import { uiService } from './ui.js';
import { APP_CONFIG } from '../constants/config.js';

class PlaylistService {
    constructor() {
        this.playlists = [];
        this.currentPlaylist = null;
        this.myPlaylists = [];
        this.init();
    }

    /**
     * Khởi tạo service
     */
    init() {
        this.setupEventListeners();
        this.loadAllPlaylists();
        this.loadMyPlaylists();
    }

    /**
     * Thiết lập event listeners
     */
    setupEventListeners() {
        // Create playlist button
        const createBtn = document.querySelector('.create-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreatePlaylistModal());
        }

        // Playlist tabs
        const playlistTabs = document.querySelectorAll('.nav-tab');
        playlistTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // Search library
        const searchBtn = document.querySelector('.search-library-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.toggleSearch());
        }

        // Sort button
        const sortBtn = document.querySelector('.sort-btn');
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.toggleSortOptions());
        }
    }

    /**
     * Load tất cả playlists
     */
    async loadAllPlaylists() {
        try {
            const loading = uiService.showLoading(document.querySelector('.main-content'), MESSAGES.INFO.LOADING);
            
            const response = await apiService.get(API_ENDPOINTS.PLAYLISTS.GET_ALL);
            this.playlists = response.data || [];
            
            this.renderPlaylists();
            uiService.hideLoading(loading);
            
        } catch (error) {
            console.error('Error loading playlists:', error);
            uiService.showToast(MESSAGES.ERROR.NETWORK_ERROR, 'error');
        }
    }

    /**
     * Load playlists của user
     */
    async loadMyPlaylists() {
        try {
            const response = await apiService.get(API_ENDPOINTS.PLAYLISTS.GET_MY_PLAYLISTS);
            this.myPlaylists = response.data || [];
            
            this.renderMyPlaylists();
            
        } catch (error) {
            console.error('Error loading my playlists:', error);
        }
    }

    /**
     * Render playlists
     */
    renderPlaylists() {
        const container = document.querySelector('.playlists-container');
        if (!container) return;

        if (this.playlists.length === 0) {
            container.innerHTML = `<div class="no-playlists">${MESSAGES.INFO.NO_PLAYLISTS}</div>`;
            return;
        }

        const playlistsHTML = this.playlists.map(playlist => this.createPlaylistCard(playlist)).join('');
        container.innerHTML = playlistsHTML;

        // Add click events
        this.addPlaylistClickEvents();
    }

    /**
     * Render my playlists
     */
    renderMyPlaylists() {
        const container = document.querySelector('.library-content');
        if (!container) return;

        // Giữ lại Liked Songs
        const likedSongs = container.querySelector('.library-item.liked-songs');
        container.innerHTML = '';

        if (likedSongs) {
            container.appendChild(likedSongs);
        }

        // Thêm my playlists
        this.myPlaylists.forEach(playlist => {
            const playlistElement = this.createLibraryPlaylistItem(playlist);
            container.appendChild(playlistElement);
        });

        // Add context menu events
        this.addContextMenuEvents();
    }

    /**
     * Tạo playlist card
     */
    createPlaylistCard(playlist) {
        return `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-image">
                    <img src="${playlist.image || APP_CONFIG.DEFAULTS.PLAYLIST_IMAGE}" alt="${playlist.name}">
                    <div class="playlist-overlay">
                        <button class="play-btn" title="${MESSAGES.TOOLTIPS.PLAY}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="playlist-info">
                    <h3 class="playlist-name">${playlist.name}</h3>
                    <p class="playlist-description">${playlist.description || ''}</p>
                    <p class="playlist-stats">${playlist.songCount || 0} bài hát</p>
                </div>
            </div>
        `;
    }

    /**
     * Tạo library playlist item
     */
    createLibraryPlaylistItem(playlist) {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.setAttribute('data-playlist-id', playlist.id);
        item.setAttribute('data-type', 'playlist');
        
        item.innerHTML = `
            <img src="${playlist.image || APP_CONFIG.DEFAULTS.PLAYLIST_IMAGE}" alt="${playlist.name}" class="item-image">
            <div class="item-info">
                <div class="item-title">${playlist.name}</div>
                <div class="item-subtitle">Playlist • ${playlist.owner || 'You'}</div>
            </div>
        `;

        return item;
    }

    /**
     * Thêm click events cho playlists
     */
    addPlaylistClickEvents() {
        const playlistCards = document.querySelectorAll('.playlist-card');
        playlistCards.forEach(card => {
            card.addEventListener('click', () => {
                const playlistId = card.getAttribute('data-playlist-id');
                this.showPlaylistDetail(playlistId);
            });
        });
    }

    /**
     * Thêm context menu events
     */
    addContextMenuEvents() {
        const playlistItems = document.querySelectorAll('.library-item[data-type="playlist"]');
        playlistItems.forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const playlistId = item.getAttribute('data-playlist-id');
                this.showContextMenu(e, playlistId, 'playlist');
            });
        });
    }

    /**
     * Hiển thị playlist detail
     */
    async showPlaylistDetail(playlistId) {
        try {
            const loading = uiService.showLoading(document.querySelector('.main-content'));
            
            const response = await apiService.get(`${API_ENDPOINTS.PLAYLISTS.GET_BY_ID}/${playlistId}`);
            this.currentPlaylist = response.data;
            
            this.renderPlaylistDetail();
            uiService.hideLoading(loading);
            
        } catch (error) {
            console.error('Error loading playlist detail:', error);
            uiService.showToast(MESSAGES.ERROR.NOT_FOUND, 'error');
        }
    }

    /**
     * Render playlist detail
     */
    renderPlaylistDetail() {
        const container = document.querySelector('.main-content');
        if (!container || !this.currentPlaylist) return;

        // Ẩn playlists và artists
        const playlistsContainer = container.querySelector('.playlists-container');
        const artistsContainer = container.querySelector('.artists-container');
        if (playlistsContainer) playlistsContainer.style.display = 'none';
        if (artistsContainer) artistsContainer.style.display = 'none';

        // Hiển thị detail
        const detailHTML = this.createPlaylistDetailHTML();
        
        let detailContainer = container.querySelector('.detail-container');
        if (!detailContainer) {
            detailContainer = document.createElement('div');
            detailContainer.className = 'detail-container';
            container.appendChild(detailContainer);
        }
        
        detailContainer.innerHTML = detailHTML;
        detailContainer.style.display = 'block';

        // Add back button event
        const backBtn = detailContainer.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.hideDetail());
        }

        // Add follow button event
        const followBtn = detailContainer.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', () => this.toggleFollow());
        }
    }

    /**
     * Tạo HTML cho playlist detail
     */
    createPlaylistDetailHTML() {
        const playlist = this.currentPlaylist;
        
        return `
            <div class="detail-header">
                <button class="back-btn">
                    <i class="fas fa-chevron-left"></i>
                    <span>Back</span>
                </button>
                <div class="detail-info">
                    <img src="${playlist.image || APP_CONFIG.DEFAULTS.PLAYLIST_IMAGE}" alt="${playlist.name}" class="detail-image">
                    <div class="detail-text">
                        <h1 class="detail-title">${playlist.name}</h1>
                        <p class="detail-description">${playlist.description || ''}</p>
                        <p class="detail-stats">${playlist.songCount || 0} bài hát</p>
                    </div>
                </div>
                <button class="follow-btn ${playlist.isFollowed ? 'following' : ''}">
                    ${playlist.isFollowed ? 'Following' : 'Follow'}
                </button>
            </div>
            <div class="detail-content">
                <!-- Songs list sẽ được thêm ở đây -->
            </div>
        `;
    }

    /**
     * Ẩn detail view
     */
    hideDetail() {
        const container = document.querySelector('.main-content');
        const detailContainer = container.querySelector('.detail-container');
        const playlistsContainer = container.querySelector('.playlists-container');
        const artistsContainer = container.querySelector('.artists-container');

        if (detailContainer) {
            detailContainer.style.display = 'none';
        }

        if (playlistsContainer) {
            playlistsContainer.style.display = 'block';
        }

        if (artistsContainer) {
            artistsContainer.style.display = 'block';
        }

        this.currentPlaylist = null;
    }

    /**
     * Toggle follow playlist
     */
    async toggleFollow() {
        if (!this.currentPlaylist) return;

        try {
            const endpoint = this.currentPlaylist.isFollowed 
                ? API_ENDPOINTS.PLAYLISTS.UNFOLLOW 
                : API_ENDPOINTS.PLAYLISTS.FOLLOW;

            await apiService.post(`${endpoint}/${this.currentPlaylist.id}`);
            
            this.currentPlaylist.isFollowed = !this.currentPlaylist.isFollowed;
            
            // Update UI
            const followBtn = document.querySelector('.follow-btn');
            if (followBtn) {
                followBtn.textContent = this.currentPlaylist.isFollowed ? 'Following' : 'Follow';
                followBtn.classList.toggle('following', this.currentPlaylist.isFollowed);
            }

            // Update my playlists
            await this.loadMyPlaylists();

            uiService.showToast(
                this.currentPlaylist.isFollowed 
                    ? MESSAGES.SUCCESS.PLAYLIST_FOLLOWED 
                    : MESSAGES.SUCCESS.PLAYLIST_UNFOLLOWED, 
                'success'
            );

        } catch (error) {
            console.error('Error toggling follow:', error);
            uiService.showToast(MESSAGES.ERROR.NETWORK_ERROR, 'error');
        }
    }

    /**
     * Tạo playlist mới
     */
    async createPlaylist(name = APP_CONFIG.DEFAULTS.PLAYLIST_NAME, description = '') {
        try {
            const response = await apiService.post(API_ENDPOINTS.PLAYLISTS.CREATE, {
                name,
                description
            });

            const newPlaylist = response.data;
            this.myPlaylists.push(newPlaylist);
            
            this.renderMyPlaylists();
            uiService.showToast(MESSAGES.SUCCESS.PLAYLIST_CREATED, 'success');

            return newPlaylist;

        } catch (error) {
            console.error('Error creating playlist:', error);
            uiService.showToast(MESSAGES.ERROR.PLAYLIST_CREATE_FAILED, 'error');
            throw error;
        }
    }

    /**
     * Cập nhật playlist
     */
    async updatePlaylist(playlistId, data) {
        try {
            const response = await apiService.put(`${API_ENDPOINTS.PLAYLISTS.UPDATE}/${playlistId}`, data);
            
            // Update local data
            const index = this.myPlaylists.findIndex(p => p.id === playlistId);
            if (index !== -1) {
                this.myPlaylists[index] = { ...this.myPlaylists[index], ...data };
            }

            this.renderMyPlaylists();
            uiService.showToast(MESSAGES.SUCCESS.PLAYLIST_UPDATED, 'success');

            return response;

        } catch (error) {
            console.error('Error updating playlist:', error);
            uiService.showToast(MESSAGES.ERROR.PLAYLIST_UPDATE_FAILED, 'error');
            throw error;
        }
    }

    /**
     * Xóa playlist
     */
    async deletePlaylist(playlistId) {
        try {
            await apiService.delete(`${API_ENDPOINTS.PLAYLISTS.DELETE}/${playlistId}`);
            
            // Remove from local data
            this.myPlaylists = this.myPlaylists.filter(p => p.id !== playlistId);
            this.renderMyPlaylists();
            
            uiService.showToast(MESSAGES.SUCCESS.PLAYLIST_DELETED, 'success');

        } catch (error) {
            console.error('Error deleting playlist:', error);
            uiService.showToast(MESSAGES.ERROR.PLAYLIST_DELETE_FAILED, 'error');
            throw error;
        }
    }

    /**
     * Upload ảnh cho playlist
     */
    async uploadPlaylistImage(playlistId, file) {
        try {
            const response = await apiService.uploadFile(API_ENDPOINTS.UPLOAD.IMAGE, file);
            
            // Update playlist với ảnh mới
            await this.updatePlaylist(playlistId, { image: response.data.path });
            
            uiService.showToast(MESSAGES.SUCCESS.IMAGE_UPLOADED, 'success');

        } catch (error) {
            console.error('Error uploading image:', error);
            uiService.showToast(MESSAGES.ERROR.IMAGE_UPLOAD_FAILED, 'error');
            throw error;
        }
    }

    /**
     * Hiển thị modal tạo playlist
     */
    showCreatePlaylistModal() {
        // Tạo modal HTML
        const modalHTML = `
            <div class="modal" id="createPlaylistModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Tạo Playlist mới</h2>
                        <button class="modal-close" onclick="uiService.closeModalById('createPlaylistModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="createPlaylistForm">
                        <div class="form-group">
                            <label for="playlistName">Tên Playlist</label>
                            <input type="text" id="playlistName" name="name" required 
                                   placeholder="${MESSAGES.PLACEHOLDER.PLAYLIST_NAME}">
                        </div>
                        <div class="form-group">
                            <label for="playlistDescription">Mô tả (tùy chọn)</label>
                            <textarea id="playlistDescription" name="description" 
                                      placeholder="${MESSAGES.PLACEHOLDER.PLAYLIST_DESCRIPTION}"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" 
                                    onclick="uiService.closeModalById('createPlaylistModal')">Hủy</button>
                            <button type="submit" class="btn-primary">Tạo</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Thêm modal vào DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submit
        const form = document.getElementById('createPlaylistForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const name = formData.get('name');
            const description = formData.get('description');

            try {
                await this.createPlaylist(name, description);
                uiService.closeModalById('createPlaylistModal');
                form.remove();
            } catch (error) {
                // Error đã được xử lý trong createPlaylist
            }
        });

        // Mở modal
        uiService.openModal('createPlaylistModal');
    }

    /**
     * Switch tab
     */
    switchTab(selectedTab) {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        selectedTab.classList.add('active');

        // Xử lý logic switch tab
        const tabType = selectedTab.textContent.toLowerCase();
        this.loadContentByTab(tabType);
    }

    /**
     * Load content theo tab
     */
    loadContentByTab(tabType) {
        if (tabType === 'playlists') {
            this.loadMyPlaylists();
        } else if (tabType === 'artists') {
            // Load artists - sẽ được implement trong ArtistService
        }
    }

    /**
     * Toggle search
     */
    toggleSearch() {
        // Implement search functionality
        console.log('Toggle search');
    }

    /**
     * Toggle sort options
     */
    toggleSortOptions() {
        // Implement sort functionality
        console.log('Toggle sort options');
    }

    /**
     * Hiển thị context menu
     */
    showContextMenu(event, itemId, itemType) {
        // Implement context menu
        console.log('Show context menu for:', itemType, itemId);
    }
}

// Export instance singleton
export const playlistService = new PlaylistService();
export default playlistService; 