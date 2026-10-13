import { render } from "../engine/render.js";
import { canvasToBlob, triggerDownload } from "./png.js";

const W = 1080;
const H = 1920;
const PAD = 120;

export function buildStoryCanvas(composition, opts = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D not available.");

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Square artwork, centered
  const size = Math.min(W - PAD * 2, H - PAD * 3);
  const x = (W - size) / 2;
  const y = (H - size) / 2 - 80;

  const art = document.createElement("canvas");
  art.width = size;
  art.height = size;
  const actx = art.getContext("2d", { willReadFrequently: true });
  render(actx, composition, size);
  ctx.drawImage(art, x, y, size, size);

  // Attribution
  ctx.fillStyle = "rgba(241,238,232,0.9)";
  ctx.textAlign = "center";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.fillText("MUSIC IDENTITY", W / 2, y + size + 90);

  ctx.fillStyle = "rgba(241,238,232,0.45)";
  ctx.font = "400 22px system-ui, sans-serif";
  ctx.fillText(`seed ${opts.seed ?? "—"}`, W / 2, y + size + 130);

  ctx.fillStyle = "rgba(29,185,84,0.85)";
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.fillText("based on Spotify listening data", W / 2, H - PAD / 2);

  return canvas;
}

export async function storyBlob(composition, opts = {}) {
  const canvas = buildStoryCanvas(composition, opts);
  return canvasToBlob(canvas);
}

export async function downloadStory(composition, opts = {}) {
  const blob = await storyBlob(composition, opts);
  triggerDownload(blob, `music-identity-story-${opts.seed ?? "seed"}.png`);
}