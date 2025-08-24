/**
 * API Endpoints
 * Cấu hình endpoints API
 */

export const API = {
  // Authentication
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_FOLLOWED_PLAYLISTS: "/me/playlists/followed",
    GET_FOLLOWED_ARTISTS: "/me/following",
    GET_LIKED_TRACKS: "/me/tracks/liked",
  },

  // User Management
  USER: {
    ME: "/users/me",
    PROFILE: "/users/me",
  },

  // User Library
  ME: {
    PLAYLISTS: "/me/playlists",
  },

  // Playlists
  PLAYLISTS: {
    GET_ALL: "/playlists",
    GET_BY_ID: "/playlists",
    GET_ALL_TRACKS_BY_ID: "/playlists",
  },

  // Artists
  ARTISTS: {
    GET_ALL: "/artists",
    GET_BY_ID: "/artists",
    GET_ALL_TRACKS_BY_ID: "/artists",
  },
};
