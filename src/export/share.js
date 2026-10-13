export function canShareFiles() {
  if (typeof navigator === "undefined") return false;
  if (!navigator.canShare) return false;
  try {
    const f = new File([new Blob()], "x.png", { type: "image/png" });
    return navigator.canShare({ files: [f] });
  } catch {
    return false;
  }
}

export async function shareFile(file, meta = {}) {
  if (!navigator.share) throw new Error("Native sharing is unavailable in this browser.");
  await navigator.share({ files: [file], ...meta });
}