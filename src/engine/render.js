import { seededRandom } from "../utils/seededRandom.js";

/**
 * Render a composition onto a canvas 2D context.
 * The composition is generated at composition.size; rendering at a larger
 * target uses ctx.scale() so geometry is preserved exactly.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} composition  — from generate()
 * @param {number} targetSize   — output pixel size (defaults to composition.size)
 */
export function render(ctx, composition, targetSize = composition.size) {
  const { background, layers, texture } = composition;
  const scale = targetSize / composition.size;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, targetSize, targetSize);

  // Background (drawn in device space, not scaled)
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, targetSize, targetSize);

  // All shapes in composition space
  ctx.save();
  ctx.scale(scale, scale);
  for (const layer of layers) {
    drawLayer(ctx, layer, composition.size);
  }
  ctx.restore();

  // Grain, applied at output resolution
  if (texture?.grain?.amount > 0.002) {
    applyGrain(ctx, targetSize, texture.grain);
  }

  ctx.restore();
}

function drawLayer(ctx, layer, size) {
  ctx.save();
  ctx.globalCompositeOperation = layer.blend || "source-over";

  switch (layer.kind) {
    case "plate":
      fillPolygon(ctx, layer.points, layer.fill, layer.alpha ?? 1);
      ctx.lineWidth = size * 0.0015;
      ctx.strokeStyle = "rgba(0,0,0,0.32)";
      strokePolygon(ctx, layer.points);
      break;

    case "fragment":
      fillPolygon(ctx, layer.points, layer.fill, layer.alpha ?? 1);
      break;

    case "mass":
      fillPolygon(ctx, layer.points, layer.fill);
      if (layer.soft) {
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = size * 0.012;
        ctx.strokeStyle = layer.fill;
        strokePolygon(ctx, layer.points);
        ctx.globalAlpha = 1;
      }
      break;

    case "stroke":
      strokePath(ctx, layer.points, layer.color, layer.width);
      break;

    case "dot":
      ctx.beginPath();
      ctx.arc(layer.cx, layer.cy, layer.r, 0, Math.PI * 2);
      ctx.fillStyle = layer.fill;
      ctx.fill();
      break;

    case "cell":
      drawCell(ctx, layer);
      break;
  }
  ctx.restore();
}

function fillPolygon(ctx, pts, fill, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function strokePolygon(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.stroke();
}

function strokePath(ctx, pts, color, width) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawCell(ctx, layer) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = layer.fill;
  ctx.fillRect(layer.x, layer.y, layer.w, layer.h);

  if (layer.hatched) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(layer.x, layer.y, layer.w, layer.h);
    ctx.clip();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    const step = Math.max(4, layer.w / 22);
    const { x, y, w, h, hatchAngle } = layer;
    for (let i = -w; i < h + w; i += step) {
      const x0 = x + Math.cos(hatchAngle) * i;
      const y0 = y + Math.sin(hatchAngle) * i;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(
        x0 + Math.cos(hatchAngle + Math.PI / 2) * h * 2,
        y0 + Math.sin(hatchAngle + Math.PI / 2) * h * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}

function applyGrain(ctx, size, grain) {
  const { amount, step } = grain;
  const rand = seededRandom(0xC0FFEE);
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  const amt = amount * 255;
  const s = Math.max(1, step | 0);

  for (let y = 0; y < size; y += s) {
    const yEnd = Math.min(y + s, size);
    for (let x = 0; x < size; x += s) {
      const xEnd = Math.min(x + s, size);
      const n = (rand() - 0.5) * amt;
      for (let yy = y; yy < yEnd; yy++) {
        const rowStart = yy * size;
        for (let xx = x; xx < xEnd; xx++) {
          const i = (rowStart + xx) * 4;
          const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
          const weight = 1 - Math.abs(lum - 0.5) * 1.2;
          if (weight <= 0) continue;
          const delta = n * weight;
          d[i]     = clampByte(d[i] + delta);
          d[i + 1] = clampByte(d[i + 1] + delta);
          d[i + 2] = clampByte(d[i + 2] + delta);
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}