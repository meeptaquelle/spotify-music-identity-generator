// Mulberry32 — small, fast, deterministic PRNG.
export function seededRandom(seed = 1) {
  let value = seed >>> 0;
  return function () {
    value = (value + 0x6D2B79F5) | 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class RNG {
  constructor(seed) {
    this.seed = typeof seed === "string" ? hashString(seed) : (seed >>> 0);
    this._next = seededRandom(this.seed);
  }
  next() { return this._next(); }
  range(min, max) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p) { return this.next() < p; }
  gauss(mean = 0, sd = 1) {
    let u = 0;
    for (let i = 0; i < 4; i++) u += this.next();
    return mean + (u - 2) * sd * 0.7;
  }
}