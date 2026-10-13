// Built-in sample profile — deterministic, varied genres.

const ARTISTS = [
  { name: "Nova Drift",   genres: ["alternative rock", "indie rock"] },
  { name: "Mirage Code",  genres: ["electronic", "synthwave"] },
  { name: "Low Orbit",    genres: ["ambient", "electronic"] },
  { name: "Cassette Sun", genres: ["indie rock", "soul"] },
  { name: "Cobalt Room",  genres: ["jazz", "soul", "funk"] },
  { name: "Ten Cities",   genres: ["hip-hop"] },
  { name: "Ivory Static", genres: ["classical", "ambient"] },
  { name: "Red Harbor",   genres: ["alternative rock"] }
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export function buildSampleProfile(count = 60, seed = 42) {
  const rng = mulberry32(seed);
  const tracks = [];
  for (let i = 0; i < count; i++) {
    const artist = ARTISTS[Math.floor(rng() * ARTISTS.length)];
    tracks.push({
      id: `sample-${i}`,
      name: `Sketch ${i + 1}`,
      artists: [artist.name],
      genres: [...artist.genres],
      popularity: Math.round(30 + rng() * 60),
      durationMs: Math.round((150 + rng() * 180) * 1000),
      audio: {
        energy: clamp01(0.3 + rng() * 0.6),
        danceability: clamp01(0.3 + rng() * 0.6),
        acousticness: clamp01(rng()),
        valence: clamp01(rng()),
        tempo: 70 + rng() * 120,
        loudness: -18 + rng() * 14
      },
      listeningWeight: 1 / (1 + i * 0.02)
    });
  }
  const artists = ARTISTS.map((a, i) => ({
    id: `sample-artist-${i}`,
    name: a.name,
    genres: [...a.genres],
    popularity: Math.round(40 + rng() * 40),
    image: null
  }));
  return {
    source: "sample",
    user: { id: "sample", displayName: "Sample Listener", image: null },
    tracks,
    artists,
    unavailable: []
  };
}