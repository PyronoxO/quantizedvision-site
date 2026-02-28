import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "public", "img", "raw");
const WORKS_DIR = path.join(ROOT, "public", "img", "works");
const WATERMARK_PATH = path.join(WORKS_DIR, "logo-watermark.png");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mov", ".mp4", ".webm", ".m4v"]);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function isSupported(ext) {
  return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
}

function outputName(filename, isVideo) {
  const parsed = path.parse(filename);
  if (isVideo) {
    return `${parsed.name}.mp4`;
  }
  return filename;
}

async function processImage(inputPath, outputPath, watermarkPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1920;
  const wmWidth = Math.max(120, Math.min(420, Math.round(width * 0.22)));

  const watermarkBuffer = await sharp(watermarkPath)
    .resize({ width: wmWidth, withoutEnlargement: true })
    .png()
    .toBuffer();

  await image
    .composite([
      {
        input: watermarkBuffer,
        gravity: "southeast",
      },
    ])
    .toFile(outputPath);
}

function processVideo(inputPath, outputPath, watermarkPath) {
  const overlayFilter =
    "[1:v]scale=w='min(iw,main_w*0.22)':h=-1[wm];[0:v][wm]overlay=main_w-overlay_w-24:main_h-overlay_h-24";

  const command = [
    "-y",
    "-i",
    inputPath,
    "-i",
    watermarkPath,
    "-filter_complex",
    overlayFilter,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  const result = spawnSync("ffmpeg", command, { stdio: "pipe", encoding: "utf-8" });

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${path.basename(inputPath)}\n${result.stderr}`);
  }
}

async function main() {
  await ensureDir(RAW_DIR);
  await ensureDir(WORKS_DIR);

  try {
    await fs.access(WATERMARK_PATH);
  } catch {
    throw new Error(`Watermark file missing: ${WATERMARK_PATH}`);
  }

  const files = await fs.readdir(RAW_DIR);
  const processable = files.filter((file) => isSupported(path.extname(file).toLowerCase()));

  if (processable.length === 0) {
    console.log("No media found in public/img/raw. Add files and rerun.");
    return;
  }

  for (const filename of processable) {
    const ext = path.extname(filename).toLowerCase();
    const inputPath = path.join(RAW_DIR, filename);
    const isVideo = VIDEO_EXTENSIONS.has(ext);
    const outputPath = path.join(WORKS_DIR, outputName(filename, isVideo));

    if (isVideo) {
      processVideo(inputPath, outputPath, WATERMARK_PATH);
    } else {
      await processImage(inputPath, outputPath, WATERMARK_PATH);
    }

    console.log(`Created: ${path.relative(ROOT, outputPath)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
