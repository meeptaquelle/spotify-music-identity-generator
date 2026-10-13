import { mean, stdev } from "./statistics.js";
import { computeDiversity } from "./diversity.js";
import { clamp01 } from "../utils/math.js";

const GENRE_HUES = [
  [/(metal|hardcore|punk)/i,             8],
  [/(rock|grunge|garage)/i,             18],
  [/(indie|shoegaze|dream)/i,          200],
  [/(pop|dance|disco)/i,               325],
  [/(electronic|techno|house)/i,       190],
  [/(ambient|drone|new age)/i,         225],
  [/(hip[- ]?hop|rap|trap)/i,           42],
  [/(jazz|soul|funk|r&b)/i,             28],
  [/(classical|orchestra|baroque)/i,   240],
  [/(folk|country|americana)/i,        100],
  [/(blues)/i,                         230],
  [/(reggae|dub|dancehall)/i,          110],
  [/(latin|salsa|bossa)/i,             352],
  [/(world|afro|asian)/i,              155],
  [/(soundtrack|score|cinematic)/i,    265],
  [/(experimental|noise|avant)/i,      285]
];

function hueForGenre(genre) {
  if (!genre) return 220;
  for (const [re, hue] of GENRE_HUES) if (re.test(genre)) return hue;
  return 220;
}

export function extractMusicProfile(data) {
  const tracks = data?.tracks ?? [];
  const artists = data?.artists ?? [];
  const div = computeDiversity({ tracks, artists });

  // Dominant genre hue via circular mean across the genre distribution.
  let sinSum = 0, cosSum = 0, wsum = 0;
  for (const { genre, weight } of div.genreDistribution) {
    const h = (hueForGenre(genre) * Math.PI) / 180;
    sinSum += Math.sin(h) * weight;
    cosSum += Math.cos(h) * weight;
    wsum += weight;
  }
  const dominantGenreHue = wsum === 0
    ? 220
    : ((Math.atan2(sinSum / wsum, cosSum / wsum) * 180) / Math.PI + 360) % 360;
  const secondaryGenreHue = div.genreDistribution[1]
    ? hueForGenre(div.genreDistribution[1].genre)
    : (dominantGenreHue + 40) % 360;

  // Audio features — null when unavailable. Never fabricate.
  const audio = {};
  for (const f of ["energy", "danceability", "acousticness", "valence", "tempo", "loudness"]) {
    const vals = tracks
      .map((t) => t.audio?.[f])
      .filter((v) => v != null && !Number.isNaN(v));
    audio[f] = vals.length ? mean(vals) : null;
    audio[`${f}Stdev`] = vals.length > 1 ? stdev(vals) : null;
  }

  const anyAudio =
    tracks.filter((t) => t.audio && Object.values(t.audio).some((v) => v != null)).length /
    Math.max(1, tracks.length);

  const features = {
    // structural
    genreDiversity: div.genreDiversity,
    artistConcentration: div.artistConcentration,
    trackDiversity: div.trackDiversity,
    // tonal
    dominantGenreHue,
    secondaryGenreHue,
    temperature: audio.valence == null ? 0 : audio.valence - 0.5,
    // energy-like
    energy: audio.energy,
    danceability: audio.danceability,
    acousticness: audio.acousticness,
    valence: audio.valence,
    tempoNorm: audio.tempo == null ? null : clamp01((audio.tempo - 60) / 120),
    loudnessNorm: audio.loudness == null ? null : clamp01((audio.loudness + 30) / 30),
    // bundled
    confidence: anyAudio,
    entropy: (div.genreDiversity + div.trackDiversity) / 2,
    diversity: div.genreDiversity
  };

  return {
    source: data?.source ?? "unknown",
    user: data?.user ?? null,
    tracksCount: tracks.length,
    artistsCount: div.artistCount,
    genreDistribution: div.genreDistribution,
    features,
    audio,
    unavailable: data?.unavailable ?? [],
    seedSalt: `${tracks.length}-${div.genreCount}-${div.artistCount}`
  };
}