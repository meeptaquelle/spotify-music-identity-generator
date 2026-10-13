import { spotifyRequest, fetchAllPages } from './api.js'
import { spotifyEndpoints } from './endpoints.js'
import { normalizeSpotifyTracks, normalizeSpotifyArtists, attachArtistGenres } from './normalize.js'

export async function fetchSpotifyMusicProfile(accessToken) {
  const [profile, rawTracks, rawArtists] = await Promise.all([
    spotifyRequest(spotifyEndpoints.profile, accessToken).catch(() => null),
    fetchAllPages(spotifyEndpoints.topTracks, accessToken, { limit: 50, time_range: 'medium_term' }),
    fetchAllPages(spotifyEndpoints.topArtists, accessToken, { limit: 50, time_range: 'medium_term' }).catch(() => []),
  ])
  const artists = normalizeSpotifyArtists(rawArtists)
  const tracks = attachArtistGenres(normalizeSpotifyTracks(rawTracks), artists)
  return {
    source: 'spotify',
    account: profile?.display_name ?? profile?.id ?? null,
    tracks,
    artists,
    unavailable: {
      audioFeatures: 'Not requested by this scaffold; endpoint access must be verified.',
      genres: artists.length ? null : 'Artist metadata was unavailable.',
    },
  }
}
