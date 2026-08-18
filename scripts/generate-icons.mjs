import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { deflateSync } from "node:zlib";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "public/icons");
const sizes = [16, 32, 48, 128];
const samplesPerAxis = 4;

const palette = {
  background: [51, 65, 85, 255],
  foreground: [248, 250, 252, 255],
  transparent: [0, 0, 0, 0],
};

function isInsideRoundedRectangle(x, y, left, top, right, bottom, radius) {
  if (x < left || x > right || y < top || y > bottom) {
    return false;
  }

  const nearestX = Math.max(left + radius, Math.min(x, right - radius));
  const nearestY = Math.max(top + radius, Math.min(y, bottom - radius));
  return Math.hypot(x - nearestX, y - nearestY) <= radius;
}

function isInsideCircle(x, y, centerX, centerY, radius) {
  return Math.hypot(x - centerX, y - centerY) <= radius;
}

function sampleIcon(x, y, size) {
  const outerInset = size * 0.04;
  const insideBackground = isInsideRoundedRectangle(
    x,
    y,
    outerInset,
    outerInset,
    size - outerInset,
    size - outerInset,
    size * 0.22,
  );

  if (!insideBackground) {
    return palette.transparent;
  }

  const cardLeft = size * 0.2;
  const cardTop = size * 0.24;
  const cardRight = size * 0.8;
  const cardBottom = size * 0.76;
  const insideCard = isInsideRoundedRectangle(
    x,
    y,
    cardLeft,
    cardTop,
    cardRight,
    cardBottom,
    size * 0.07,
  );

  if (!insideCard) {
    return palette.background;
  }

  const notchRadius = size * 0.075;
  if (
    isInsideCircle(x, y, cardLeft, size * 0.5, notchRadius) ||
    isInsideCircle(x, y, cardRight, size * 0.5, notchRadius)
  ) {
    return palette.background;
  }

  const lineLeft = size * 0.34;
  const lineRight = size * 0.66;
  const onFirstLine = y >= size * 0.39 && y <= size * 0.43;
  const onSecondLine = y >= size * 0.56 && y <= size * 0.6;

  if (x >= lineLeft && x <= lineRight && (onFirstLine || onSecondLine)) {
    return palette.background;
  }

  return palette.foreground;
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function createIcon(size) {
  const bytesPerRow = 1 + size * 4;
  const pixels = Buffer.alloc(bytesPerRow * size);

  for (let pixelY = 0; pixelY < size; pixelY += 1) {
    const rowOffset = pixelY * bytesPerRow;
    pixels[rowOffset] = 0;

    for (let pixelX = 0; pixelX < size; pixelX += 1) {
      const totals = [0, 0, 0, 0];

      for (let sampleY = 0; sampleY < samplesPerAxis; sampleY += 1) {
        for (let sampleX = 0; sampleX < samplesPerAxis; sampleX += 1) {
          const x = pixelX + (sampleX + 0.5) / samplesPerAxis;
          const y = pixelY + (sampleY + 0.5) / samplesPerAxis;
          const color = sampleIcon(x, y, size);

          for (let channel = 0; channel < 4; channel += 1) {
            totals[channel] += color[channel];
          }
        }
      }

      const pixelOffset = rowOffset + 1 + pixelX * 4;
      const sampleCount = samplesPerAxis * samplesPerAxis;
      for (let channel = 0; channel < 4; channel += 1) {
        pixels[pixelOffset + channel] = Math.round(totals[channel] / sampleCount);
      }
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    createChunk("IHDR", header),
    createChunk("IDAT", deflateSync(pixels)),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

await mkdir(outputDirectory, { recursive: true });

for (const size of sizes) {
  await writeFile(resolve(outputDirectory, `icon${size}.png`), createIcon(size));
}

console.log(`Generated ${sizes.length} extension icons in public/icons/.`);
