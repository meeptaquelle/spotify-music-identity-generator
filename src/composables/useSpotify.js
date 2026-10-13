import { ref } from "vue";
import {
  beginLogin, handleCallback as processOAuthCallback,
  getToken, clearAuth, isConfigured
} from "../services/spotify/auth.js";
import { getMe, getTopTracks, getTopArtists } from "../services/spotify/api.js";
import {
  normalizeTracks, normalizeArtists, attachGenres, buildProfile
} from "../services/spotify/normalize.js";

export function useSpotify() {
  const connected = ref(false);
  const displayName = ref("");
  const loading = ref(false);
  const error = ref("");

  async function connect() {
    error.value = "";
    try {
      await beginLogin();
    } catch (e) {
      error.value = e.message;
    }
  }

  async function handleCallback() {
    try {
      const token = await processOAuthCallback();
      if (!token) return false;
      const me = await getMe().catch(() => null);
      if (me) displayName.value = me.display_name || me.id || "Spotify listener";
      connected.value = true;
      return true;
    } catch (e) {
      error.value = e.message;
      return false;
    }
  }

  async function loadProfile() {
    error.value = "";
    loading.value = true;
    try {
      const me = await getMe().catch(() => null);
      if (me) displayName.value = me.display_name || me.id || "Spotify listener";

      const ranges = ["short_term", "medium_term", "long_term"];
      const allTracks = [];
      const allArtists = [];
      const unavailable = [];

      for (const r of ranges) {
        try { allTracks.push(...(await getTopTracks(r, 50))); }
        catch { unavailable.push(`top-tracks:${r}`); }
        try { allArtists.push(...(await getTopArtists(r, 50))); }
        catch { unavailable.push(`top-artists:${r}`); }
      }

      let tracks = normalizeTracks(allTracks);
      const artists = normalizeArtists(allArtists);
      tracks = attachGenres(tracks, artists);

      // Audio-features endpoint is commonly restricted. Note it explicitly.
      unavailable.push("audio-features");

      const profile = buildProfile({ me, tracks, artists, unavailable });
      connected.value = true;
      return profile;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function disconnect() {
    clearAuth();
    connected.value = false;
    displayName.value = "";
  }

  function restore() {
    if (getToken()) connected.value = true;
  }

  return {
    connected, displayName, loading, error,
    isConfigured: isConfigured(),
    connect, disconnect, handleCallback, loadProfile, restore
  };
}