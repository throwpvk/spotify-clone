/**
 * API Endpoints Constants
 * Chứa tất cả các endpoint API được sử dụng trong dự án
 */

export const API_BASE_URL = "https://api.example.com";

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    VERIFY: "/auth/verify",
  },

  // Playlists
  PLAYLISTS: {
    GET_ALL: "/playlists/get-all",
    GET_BY_ID: "/playlists/get-playlist-by-id",
    CREATE: "/playlists/create-playlist",
    UPDATE: "/playlists/update-playlist",
    DELETE: "/playlists/delete-playlist",
    FOLLOW: "/playlists/follow-playlist",
    UNFOLLOW: "/playlists/unfollow-playlist",
    GET_MY_PLAYLISTS: "/playlists/get-my-playlists",
  },

  // Artists
  ARTISTS: {
    GET_ALL: "/artists/get-all-artists",
    GET_BY_ID: "/artists/get-artist-by-id",
    FOLLOW: "/artists/follow-artist",
    UNFOLLOW: "/artists/unfollow-artist",
  },

  // Upload
  UPLOAD: {
    IMAGE: "/upload/image",
  },
};

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};
