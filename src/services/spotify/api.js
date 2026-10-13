import { ENDPOINTS } from "./endpoints.js";
import { getToken } from "./auth.js";

async function request(url) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated.");

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new Error("Spotify session expired. Please reconnect.");
  if (res.status === 429) {
    const retry = Number(res.headers.get("Retry-After") || 2);
    await new Promise((r) => setTimeout(r, retry * 1000));
    return request(url);
  }
  if (res.status === 403) throw new Error("Access forbidden by Spotify for this endpoint.");
  if (!res.ok) throw new Error(`Spotify API error ${res.status}`);
  return res.json();
}

export async function getMe() {
  return request(ENDPOINTS.me);
}

export async function getTopTracks(range = "medium_term", max = 50) {
  const out = [];
  let offset = 0;
  const limit = 50;
  while (out.length < max) {
    const page = await request(ENDPOINTS.topTracks(range, limit, offset));
    const items = page.items || [];
    out.push(...items);
    if (items.length < limit) break;
    offset += limit;
  }
  return out.slice(0, max);
}

export async function getTopArtists(range = "medium_term", max = 50) {
  const out = [];
  let offset = 0;
  const limit = 50;
  while (out.length < max) {
    const page = await request(ENDPOINTS.topArtists(range, limit, offset));
    const items = page.items || [];
    out.push(...items);
    if (items.length < limit) break;
    offset += limit;
  }
  return out.slice(0, max);
}