# Spotify Music Identity Generator

A frontend-only Vue 3 + Vite scaffold for turning Spotify listening data into procedural abstract art.

## Requirements

- Node.js 20+ recommended
- A Spotify Developer application for live Spotify authentication
- Spotify endpoint access appropriate to your developer application's current permissions

## Getting started

```bash
npm install
npm run dev
```

The app starts in sample-data mode and can generate artwork without Spotify credentials.

## Spotify configuration

1. Create an application in the Spotify Developer Dashboard.
2. Add the local development redirect URI, for example `http://127.0.0.1:5173/`.
3. Copy `.env.example` to `.env` and set:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
```

4. Restart the Vite development server.

This scaffold uses Authorization Code with PKCE and does not require a client secret. Spotify API access and endpoint availability depend on the current rules and permissions for your application. Unavailable endpoints should be treated as optional.

For GitHub Pages, configure the redirect URI to match the deployed site's exact URL, including the repository path if applicable.

## Project structure

- `src/services/spotify/`: PKCE auth, API client, endpoint definitions, normalization
- `src/analysis/`: profile statistics and derived features
- `src/engine/`: seeded procedural composition and Canvas rendering
- `src/config/`: visual defaults, palettes, mappings and style presets
- `src/composables/`: Vue state and orchestration
- `src/export/`: PNG and Instagram Story exports
- `src/components/`: interface components
- `src/views/`: main application view

## Current scaffold status

Included:
- Responsive Vue interface
- Sample profile and deterministic seed
- Basic procedural Canvas renderer
- Smooth/brutal, density, roughness and contrast controls
- Spotify PKCE authorization scaffold
- High-resolution PNG and Instagram Story export
- Static frontend architecture

Before using live Spotify data, verify which endpoints and scopes are available to your application. The initial API client intentionally does not assume that restricted audio-analysis endpoints are available.

## Build

```bash
npm run build
npm run preview
```
