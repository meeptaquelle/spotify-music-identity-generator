import { AUTH_BASE, SCOPES } from "./endpoints.js";

const VERIFIER_KEY = "mi_pkce_verifier";
const STATE_KEY = "mi_oauth_state";
const TOKEN_KEY = "mi_access_token";
const EXPIRY_KEY = "mi_token_expiry";

export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
export const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
  (typeof window !== "undefined" ? `${window.location.origin}/callback` : "");

export function isConfigured() {
  return Boolean(CLIENT_ID);
}

function base64url(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(hash));
}

export async function beginLogin() {
  if (!isConfigured()) throw new Error("Spotify client ID is not configured.");
  const verifier = randomString(64);
  const challenge = await sha256(verifier);
  const state = randomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    state,
    code_challenge_method: "S256",
    code_challenge: challenge
  });
  window.location.assign(`${AUTH_BASE}/authorize?${params.toString()}`);
}

export async function handleCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) throw new Error(`Spotify authorization error: ${error}`);
  if (!code) return null;

  const storedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);

  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  if (!storedState || storedState !== state) {
    throw new Error("OAuth state mismatch. Please try connecting again.");
  }
  if (!verifier) throw new Error("Missing PKCE verifier. Please try connecting again.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier
  });

  const res = await fetch(`${AUTH_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.error || `Token exchange failed (${res.status})`);
  }

  setToken(data.access_token, data.expires_in);
  window.history.replaceState({}, document.title, "/");
  return data.access_token;
}

export function setToken(token, expiresIn) {
  sessionStorage.setItem(TOKEN_KEY, token);
  const expiry = Date.now() + (expiresIn || 3600) * 1000;
  sessionStorage.setItem(EXPIRY_KEY, String(expiry));
}

export function getToken() {
  const t = sessionStorage.getItem(TOKEN_KEY);
  if (!t) return null;
  const exp = Number(sessionStorage.getItem(EXPIRY_KEY) || 0);
  if (exp && Date.now() > exp - 5000) {
    clearAuth();
    return null;
  }
  return t;
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRY_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}