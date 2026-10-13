export function normalizeTracks(spotifyTracks) {
  const seen = new Set();
  const out = [];
  for (const t of spotifyTracks) {
    if (!t || !t.id || seen.has(t.id)) continue;
    seen.add(t.id);
    out.push({
      id: t.id,
      name: t.name || "",
      artists: (t.artists || []).map((a) => a?.name).filter(Boolean),
      genres: [],
      popularity: typeof t.popularity === "number" ? t.popularity : null,
      durationMs: t.duration_ms ?? null,
      audio: {
        energy: null,
        danceability: null,
        acousticness: null,
        valence: null,
        tempo: null,
        loudness: null
      },
      listeningWeight: 1
    });
  }
  // Rank-weighted: earlier entries carry slightly more weight.
  out.forEach((t, i) => { t.listeningWeight = 1 / (1 + i * 0.02); });
  return out;
}

export function normalizeArtists(spotifyArtists) {
  const seen = new Set();
  const out = [];
  for (const a of spotifyArtists) {
    if (!a || !a.id || seen.has(a.id)) continue;
    seen.add(a.id);
    out.push({
      id: a.id,
      name: a.name || "",
      genres: a.genres || [],
      popularity: typeof a.popularity === "number" ? a.popularity : null,
      image: a.images?.[0]?.url || null
    });
  }
  return out;
}

// Attach genres to tracks from the artist index (best-effort).
export function attachGenres(tracks, artists) {
  const map = new Map();
  for (const a of artists) map.set(a.name.toLowerCase(), a.genres || []);
  for (const t of tracks) {
    if (t.genres?.length) continue;
    const gs = new Set();
    for (const name of t.artists) {
      const list = map.get(name.toLowerCase());
      if (list) list.forEach((g) => gs.add(g));
    }
    t.genres = [...gs];
  }
  return tracks;
}

export function buildProfile({ me, tracks, artists, unavailable = [] }) {
  return {
    source: "spotify",
    user: me
      ? { id: me.id, displayName: me.display_name || me.id, image: me.images?.[0]?.url }
      : null,
    tracks,
    artists,
    unavailable,
    fetchedAt: Date.now()
  };
}