export const AUTH_BASE = "https://accounts.spotify.com";
export const API_BASE = "https://api.spotify.com/v1";

export const SCOPES = ["user-top-read", "user-read-private"];

export const ENDPOINTS = {
  me: `${API_BASE}/me`,
  topTracks: (range = "medium_term", limit = 50, offset = 0) =>
    `${API_BASE}/me/top/tracks?time_range=${range}&limit=${limit}&offset=${offset}`,
  topArtists: (range = "medium_term", limit = 50, offset = 0) =>
    `${API_BASE}/me/top/artists?time_range=${range}&limit=${limit}&offset=${offset}`
};