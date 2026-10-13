import { reactive } from 'vue';

export const appState = reactive({
  auth: {
    connected: false,
    displayName: '',
    loading: false,
    error: null
  },
  profile: {
    ready: false,
    source: null,      // 'spotify' | 'sample'
    tracksCount: 0,
    artistsCount: 0,
    unavailable: []    // e.g. ['audio-features']
  },
  generation: {
    seed: 12345,
    config: null,       // filled by useArtwork
    busy: false,
    error: null
  },
  exports: {
    busy: false,
    shareSupported: false,
    error: null
  }
});