export function mean(arr) {
  if (!arr.length) return null;
  let s = 0;
  for (const v of arr) s += v;
  return s / arr.length;
}

export function stdev(arr) {
  if (arr.length < 2) return null;
  const m = mean(arr);
  let s = 0;
  for (const v of arr) s += (v - m) ** 2;
  return Math.sqrt(s / arr.length);
}

export function normalizedEntropy(counts) {
  const total = counts.reduce((s, c) => s + c, 0);
  if (!total || counts.length < 2) return 0;
  let h = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / total;
    h -= p * Math.log(p);
  }
  return h / Math.log(counts.length);
}

export function concentration(counts) {
  const total = counts.reduce((s, c) => s + c, 0);
  if (!total) return 0;
  let s = 0;
  for (const c of counts) {
    const p = c / total;
    s += p * p;
  }
  const n = counts.length || 1;
  const min = 1 / n;
  return (s - min) / (1 - min || 1);
}