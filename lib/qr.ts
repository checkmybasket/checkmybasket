// Dependency-free QR code encoder (byte mode, error-correction level M, versions 1–10).
// Returns the module matrix; rendering is up to the caller (see components/qr-code.tsx).
// Ported from the public-domain QR spec (ISO/IEC 18004), structured after Nayuki's reference encoder.

const ECC_PER_BLOCK_M = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // versions 1..10
const NUM_BLOCKS_M = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const TOTAL_CODEWORDS = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
const ALIGNMENT_POS: number[][] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

/** Encode `text` as a QR symbol; returns a square matrix of booleans (true = dark module). */
export function qrMatrix(text: string): boolean[][] {
  const data = new TextEncoder().encode(text);

  // Pick the smallest version whose data capacity fits (byte mode header: 4 + 8 bits for v1-9, 16 for v10)
  let version = -1;
  for (let v = 1; v <= 10; v++) {
    const dataCw = TOTAL_CODEWORDS[v - 1] - ECC_PER_BLOCK_M[v - 1] * NUM_BLOCKS_M[v - 1];
    const headerBits = 4 + (v <= 9 ? 8 : 16);
    if (data.length * 8 + headerBits <= dataCw * 8) { version = v; break; }
  }
  if (version === -1) throw new Error("Text too long for QR versions 1-10 at level M");

  const dataCw = TOTAL_CODEWORDS[version - 1] - ECC_PER_BLOCK_M[version - 1] * NUM_BLOCKS_M[version - 1];

  // --- Build the data bit stream ---
  const bits: number[] = [];
  const push = (val: number, len: number) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(0b0100, 4); // byte mode
  push(data.length, version <= 9 ? 8 : 16);
  for (const b of data) push(b, 8);
  push(0, Math.min(4, dataCw * 8 - bits.length)); // terminator
  while (bits.length % 8 !== 0) bits.push(0);
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    codewords.push(b);
  }
  for (let pad = 0xec; codewords.length < dataCw; pad ^= 0xec ^ 0x11) codewords.push(pad);

  // --- Split into blocks, compute ECC, interleave ---
  const numBlocks = NUM_BLOCKS_M[version - 1];
  const eccLen = ECC_PER_BLOCK_M[version - 1];
  const totalCw = TOTAL_CODEWORDS[version - 1];
  const numShort = numBlocks - (totalCw % numBlocks);
  const shortLen = Math.floor(totalCw / numBlocks) - eccLen; // data length of short blocks
  const blocks: number[][] = [];
  const eccBlocks: number[][] = [];
  const gen = rsGenerator(eccLen);
  for (let i = 0, off = 0; i < numBlocks; i++) {
    const len = shortLen + (i < numShort ? 0 : 1);
    const block = codewords.slice(off, off + len);
    off += len;
    blocks.push(block);
    eccBlocks.push(rsRemainder(block, gen));
  }
  const result: number[] = [];
  for (let i = 0; i <= shortLen; i++)
    for (let j = 0; j < numBlocks; j++)
      if (i < blocks[j].length) result.push(blocks[j][i]);
  for (let i = 0; i < eccLen; i++)
    for (let j = 0; j < numBlocks; j++) result.push(eccBlocks[j][i]);

  // --- Build the matrix ---
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => { modules[y][x] = dark; isFunction[y][x] = true; };

  // Timing patterns
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  // Finder patterns + separators
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      set(x, y, d !== 2 && d !== 4);
    }
  };
  drawFinder(3, 3); drawFinder(size - 4, 3); drawFinder(3, size - 4);
  // Alignment patterns
  const aligns = ALIGNMENT_POS[version - 1];
  for (const cy of aligns) for (const cx of aligns) {
    if ((cx <= 8 && cy <= 8) || (cx >= size - 9 && cy <= 8) || (cx <= 8 && cy >= size - 9)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
      set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  // Reserve format info areas (values drawn after masking)
  for (let i = 0; i < 9; i++) { isFunction[8][i] = isFunction[i][8] = true; }
  for (let i = 0; i < 8; i++) { isFunction[8][size - 1 - i] = true; isFunction[size - 1 - i][8] = true; }
  modules[size - 8][8] = true; isFunction[size - 8][8] = true; // dark module
  // (Versions 7+ need version info blocks)
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const info = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((info >>> i) & 1) === 1;
      const a = size - 11 + (i % 3), b = Math.floor(i / 3);
      set(a, b, bit); set(b, a, bit);
    }
  }

  // --- Place data bits in zigzag ---
  let bitIdx = 0;
  const totalBits = result.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIdx < totalBits) {
          modules[y][x] = ((result[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
          bitIdx++;
        }
      }
    }
  }

  // --- Choose best mask ---
  let bestMask = 0, bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(modules, isFunction, mask);
    drawFormatBits(modules, isFunction, size, mask);
    const p = penaltyScore(modules);
    if (p < bestPenalty) { bestPenalty = p; bestMask = mask; }
    applyMask(modules, isFunction, mask); // undo (XOR is self-inverse)
  }
  applyMask(modules, isFunction, bestMask);
  drawFormatBits(modules, isFunction, size, bestMask);
  return modules;
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return (x * y) % 2 + (x * y) % 3 === 0;
    case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
    default: return (((x + y) % 2) + (x * y) % 3) % 2 === 0;
  }
}

function applyMask(modules: boolean[][], isFunction: boolean[][], mask: number) {
  const size = modules.length;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++)
    if (!isFunction[y][x] && maskBit(mask, x, y)) modules[y][x] = !modules[y][x];
}

function drawFormatBits(modules: boolean[][], isFunction: boolean[][], size: number, mask: number) {
  // Level M = 0b00
  const data = mask; // (0b00 << 3) | mask
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const at = (x: number, y: number, i: number) => { modules[y][x] = ((bits >>> i) & 1) === 1; isFunction[y][x] = true; };
  for (let i = 0; i <= 5; i++) at(8, i, i);
  at(8, 7, 6); at(8, 8, 7); at(7, 8, 8);
  for (let i = 9; i < 15; i++) at(14 - i, 8, i);
  for (let i = 0; i < 8; i++) at(size - 1 - i, 8, i);
  for (let i = 8; i < 15; i++) at(8, size - 15 + i, i);
}

function penaltyScore(m: boolean[][]): number {
  const size = m.length;
  let score = 0;
  // Rule 1: runs of same colour in rows/cols
  for (let y = 0; y < size; y++) {
    for (const get of [(i: number) => m[y][i], (i: number) => m[i][y]]) {
      let run = 1;
      for (let x = 1; x <= size; x++) {
        if (x < size && get(x) === get(x - 1)) run++;
        else { if (run >= 5) score += run - 2; run = 1; }
      }
    }
  }
  // Rule 2: 2x2 blocks
  for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++)
    if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
  // Rule 3: finder-like patterns 1011101 with 4 light modules either side
  const pat = [true, false, true, true, true, false, true];
  const matches = (get: (i: number) => boolean, start: number, len: number) => {
    for (let k = 0; k < 7; k++) if (start + k >= len || get(start + k) !== pat[k]) return false;
    const before = start >= 4 && [1, 2, 3, 4].every(k => !get(start - k));
    const after = start + 10 < len && [7, 8, 9, 10].every(k => !get(start + k));
    return before || after;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (matches(i => m[y][i], x, size)) score += 40;
    if (matches(i => m[i][x], y, size)) score += 40;
  }
  // Rule 4: dark module proportion
  let dark = 0;
  for (const row of m) for (const c of row) if (c) dark++;
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}

// --- Reed-Solomon over GF(2^8), reducing polynomial 0x11D ---
function gfMul(a: number, b: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((b >>> i) & 1) * a;
  }
  return z;
}

function rsGenerator(degree: number): number[] {
  const result = new Array(degree - 1).fill(0).concat([1]);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], generator: number[]): number[] {
  const result = new Array(generator.length).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < generator.length; i++) result[i] ^= gfMul(generator[i], factor);
  }
  return result;
}

/** Build a single SVG path string ("M..h1v1h-1z" per dark module) for the matrix. */
export function qrSvgPath(matrix: boolean[][]): string {
  const parts: string[] = [];
  for (let y = 0; y < matrix.length; y++)
    for (let x = 0; x < matrix.length; x++)
      if (matrix[y][x]) parts.push(`M${x} ${y}h1v1h-1z`);
  return parts.join("");
}
