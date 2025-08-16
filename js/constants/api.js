/**
 * API Endpoints Configuration
 * Cấu hình các endpoint API
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: "https://spotify.f8team.dev/api/auth/register",
    LOGIN: "https://spotify.f8team.dev/api/auth/login",
  },

  // User Management
  USER: {
    ME: "https://spotify.f8team.dev/api/users/me",
    PROFILE: "https://spotify.f8team.dev/api/users/me",
  },

  // User Library
  ME: {
    PLAYLISTS: "https://spotify.f8team.dev/api/me/playlists",
  },

  // Playlists
  PLAYLISTS: {
    GET_ALL: "https://spotify.f8team.dev/api/playlists",
    GET_BY_ID: "https://spotify.f8team.dev/api/playlists",
  },

  // Artists
  ARTISTS: {
    GET_ALL: "https://spotify.f8team.dev/api/artists",
    GET_BY_ID: "https://spotify.f8team.dev/api/artists",
  },

  // HTTP Methods
  HTTP_METHODS: {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH",
  },

  // Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};
