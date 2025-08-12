/**
 * Artist Module
 * Module xử lý tất cả logic liên quan đến artist
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';
import { MESSAGES } from '../constants/messages.js';
import { uiService } from './ui.js';

class ArtistService {
    constructor() {
        this.artists = [];
        this.currentArtist = null;
        this.followedArtists = [];
        this.init();
    }

    /**
     * Khởi tạo service
     */
    init() {
        this.loadAllArtists();
        this.loadFollowedArtists();
    }

    /**
     * Load tất cả artists
     */
    async loadAllArtists() {
        try {
            const loading = uiService.showLoading(document.querySelector('.main-content'), MESSAGES.INFO.LOADING);
            
            const response = await apiService.get(API_ENDPOINTS.ARTISTS.GET_ALL);
            this.artists = response.data || [];
            
            this.renderArtists();
            uiService.hideLoading(loading);
            
        } catch (error) {
            console.error('Error loading artists:', error);
            uiService.showToast(MESSAGES.ERROR.NETWORK_ERROR, 'error');
        }
    }

    /**
     * Load artists đã follow
     */
    async loadFollowedArtists() {
        try {
            // API này sẽ được implement sau
            // const response = await apiService.get(API_ENDPOINTS.ARTISTS.GET_FOLLOWED);
            // this.followedArtists = response.data || [];
            
            this.renderFollowedArtists();
            
        } catch (error) {
            console.error('Error loading followed artists:', error);
        }
    }

    /**
     * Render artists
     */
    renderArtists() {
        const container = document.querySelector('.artists-container');
        if (!container) return;

        if (this.artists.length === 0) {
            container.innerHTML = `<div class="no-artists">${MESSAGES.INFO.NO_ARTISTS}</div>`;
            return;
        }

        const artistsHTML = this.artists.map(artist => this.createArtistCard(artist)).join('');
        container.innerHTML = artistsHTML;

        // Add click events
        this.addArtistClickEvents();
    }

    /**
     * Render followed artists
     */
    renderFollowedArtists() {
        const container = document.querySelector('.library-content');
        if (!container) return;

        // Tìm và xóa các artist items cũ
        const oldArtistItems = container.querySelectorAll('.library-item[data-type="artist"]');
        oldArtistItems.forEach(item => item.remove());

        // Thêm followed artists
        this.followedArtists.forEach(artist => {
            const artistElement = this.createLibraryArtistItem(artist);
            container.appendChild(artistElement);
        });

        // Add context menu events
        this.addContextMenuEvents();
    }

    /**
     * Tạo artist card
     */
    createArtistCard(artist) {
        return `
            <div class="artist-card" data-artist-id="${artist.id}">
                <div class="artist-image">
                    <img src="${artist.image || 'assets/images/default-artist.png'}" alt="${artist.name}">
                    <div class="artist-overlay">
                        <button class="play-btn" title="${MESSAGES.TOOLTIPS.PLAY}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="artist-info">
                    <h3 class="artist-name">${artist.name}</h3>
                    <p class="artist-genre">${artist.genre || 'Unknown Genre'}</p>
                    <p class="artist-stats">${artist.followerCount || 0} followers</p>
                </div>
            </div>
        `;
    }

    /**
     * Tạo library artist item
     */
    createLibraryArtistItem(artist) {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.setAttribute('data-artist-id', artist.id);
        item.setAttribute('data-type', 'artist');
        
        item.innerHTML = `
            <img src="${artist.image || 'assets/images/default-artist.png'}" alt="${artist.name}" class="item-image">
            <div class="item-info">
                <div class="item-title">${artist.name}</div>
                <div class="item-subtitle">Artist</div>
            </div>
        `;

        return item;
    }

    /**
     * Thêm click events cho artists
     */
    addArtistClickEvents() {
        const artistCards = document.querySelectorAll('.artist-card');
        artistCards.forEach(card => {
            card.addEventListener('click', () => {
                const artistId = card.getAttribute('data-artist-id');
                this.showArtistDetail(artistId);
            });
        });
    }

    /**
     * Thêm context menu events
     */
    addContextMenuEvents() {
        const artistItems = document.querySelectorAll('.library-item[data-type="artist"]');
        artistItems.forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const artistId = item.getAttribute('data-artist-id');
                this.showContextMenu(e, artistId, 'artist');
            });
        });
    }

    /**
     * Hiển thị artist detail
     */
    async showArtistDetail(artistId) {
        try {
            const loading = uiService.showLoading(document.querySelector('.main-content'));
            
            const response = await apiService.get(`${API_ENDPOINTS.ARTISTS.GET_BY_ID}/${artistId}`);
            this.currentArtist = response.data;
            
            this.renderArtistDetail();
            uiService.hideLoading(loading);
            
        } catch (error) {
            console.error('Error loading artist detail:', error);
            uiService.showToast(MESSAGES.ERROR.NOT_FOUND, 'error');
        }
    }

    /**
     * Render artist detail
     */
    renderArtistDetail() {
        const container = document.querySelector('.main-content');
        if (!container || !this.currentArtist) return;

        // Ẩn playlists và artists
        const playlistsContainer = container.querySelector('.playlists-container');
        const artistsContainer = container.querySelector('.artists-container');
        if (playlistsContainer) playlistsContainer.style.display = 'none';
        if (artistsContainer) artistsContainer.style.display = 'none';

        // Hiển thị detail
        const detailHTML = this.createArtistDetailHTML();
        
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
     * Tạo HTML cho artist detail
     */
    createArtistDetailHTML() {
        const artist = this.currentArtist;
        
        return `
            <div class="detail-header">
                <button class="back-btn">
                    <i class="fas fa-chevron-left"></i>
                    <span>Back</span>
                </button>
                <div class="detail-info">
                    <img src="${artist.image || 'assets/images/default-artist.png'}" alt="${artist.name}" class="detail-image">
                    <div class="detail-text">
                        <h1 class="detail-title">${artist.name}</h1>
                        <p class="detail-genre">${artist.genre || 'Unknown Genre'}</p>
                        <p class="detail-stats">${artist.followerCount || 0} followers</p>
                    </div>
                </div>
                <button class="follow-btn ${artist.isFollowed ? 'following' : ''}">
                    ${artist.isFollowed ? 'Following' : 'Follow'}
                </button>
            </div>
            <div class="detail-content">
                <!-- Songs và albums sẽ được thêm ở đây -->
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

        this.currentArtist = null;
    }

    /**
     * Toggle follow artist
     */
    async toggleFollow() {
        if (!this.currentArtist) return;

        try {
            const endpoint = this.currentArtist.isFollowed 
                ? API_ENDPOINTS.ARTISTS.UNFOLLOW 
                : API_ENDPOINTS.ARTISTS.FOLLOW;

            await apiService.post(`${endpoint}/${this.currentArtist.id}`);
            
            this.currentArtist.isFollowed = !this.currentArtist.isFollowed;
            
            // Update UI
            const followBtn = document.querySelector('.follow-btn');
            if (followBtn) {
                followBtn.textContent = this.currentArtist.isFollowed ? 'Following' : 'Follow';
                followBtn.classList.toggle('following', this.currentArtist.isFollowed);
            }

            // Update followed artists
            await this.loadFollowedArtists();

            uiService.showToast(
                this.currentArtist.isFollowed 
                    ? MESSAGES.SUCCESS.ARTIST_FOLLOWED 
                    : MESSAGES.SUCCESS.ARTIST_UNFOLLOWED, 
                'success'
            );

        } catch (error) {
            console.error('Error toggling follow:', error);
            uiService.showToast(MESSAGES.ERROR.NETWORK_ERROR, 'error');
        }
    }

    /**
     * Unfollow artist
     */
    async unfollowArtist(artistId) {
        try {
            await apiService.post(`${API_ENDPOINTS.ARTISTS.UNFOLLOW}/${artistId}`);
            
            // Remove from local data
            this.followedArtists = this.followedArtists.filter(a => a.id !== artistId);
            this.renderFollowedArtists();
            
            uiService.showToast(MESSAGES.SUCCESS.ARTIST_UNFOLLOWED, 'success');

        } catch (error) {
            console.error('Error unfollowing artist:', error);
            uiService.showToast(MESSAGES.ERROR.NETWORK_ERROR, 'error');
            throw error;
        }
    }

    /**
     * Hiển thị context menu
     */
    showContextMenu(event, itemId, itemType) {
        // Implement context menu
        console.log('Show context menu for:', itemType, itemId);
    }

    /**
     * Lấy artist theo ID
     */
    getArtistById(artistId) {
        return this.artists.find(artist => artist.id === artistId);
    }

    /**
     * Lấy tất cả artists
     */
    getAllArtists() {
        return this.artists;
    }

    /**
     * Lấy followed artists
     */
    getFollowedArtists() {
        return this.followedArtists;
    }
}

// Export instance singleton
export const artistService = new ArtistService();
export default artistService; 