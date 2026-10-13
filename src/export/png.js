import { render } from "../engine/render.js";

export const SQUARE_EXPORT_SIZE = 2160;

export function renderToCanvas(composition, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D not available.");
  render(ctx, composition, size);
  return canvas;
}

export function canvasToBlob(canvas, type = "image/png") {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to encode PNG."));
    }, type);
  });
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadSquare(composition, filename) {
  const canvas = renderToCanvas(composition, SQUARE_EXPORT_SIZE);
  const blob = await canvasToBlob(canvas);
  triggerDownload(blob, filename);
}