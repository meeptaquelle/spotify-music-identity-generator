import { normalizedEntropy, concentration } from "./statistics.js";

export function computeDiversity(profile) {
  const tracks = profile.tracks || [];
  const artists = profile.artists || [];

  const artistCounts = new Map();
  for (const t of tracks) {
    const w = t.listeningWeight ?? 1;
    for (const a of t.artists || []) {
      artistCounts.set(a, (artistCounts.get(a) || 0) + w);
    }
  }
  const artistArr = [...artistCounts.values()];

  const genreCounts = new Map();
  for (const t of tracks) {
    const w = t.listeningWeight ?? 1;
    const gs = t.genres?.length ? t.genres : ["unknown"];
    for (const g of gs) {
      genreCounts.set(g, (genreCounts.get(g) || 0) + w / gs.length);
    }
  }
  const genreArr = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
  const genreTotal = genreArr.reduce((s, [, c]) => s + c, 0) || 1;
  const genreDistribution = genreArr.map(([genre, count]) => ({
    genre, weight: count / genreTotal
  }));

  const uniqueTrackIds = new Set(tracks.map((t) => t.id));
  const trackDiversity = tracks.length ? uniqueTrackIds.size / tracks.length : 0;

  return {
    artistConcentration: concentration(artistArr),
    genreDistribution,
    genreDiversity: normalizedEntropy(genreArr.map(([, c]) => c)),
    trackDiversity,
    artistCount: artistCounts.size,
    genreCount: genreArr.length
  };
}