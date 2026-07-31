import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function assertValidImageUpload(file: {
  mimetype: string;
  size: number;
  buffer: Buffer;
}): void {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new AppError("VALIDATION_ERROR", "Invalid image type", 422, [
      { field: "file", issue: "Allowed types: jpeg, png, webp" },
    ]);
  }
  if (file.size > MAX_BYTES) {
    throw new AppError("VALIDATION_ERROR", "Image exceeds 2MB limit", 422, [
      { field: "file", issue: "max 2MB" },
    ]);
  }
  if (!file.buffer?.length) {
    throw new AppError("VALIDATION_ERROR", "Empty file", 422, [
      { field: "file", issue: "empty" },
    ]);
  }
}

/**
 * Saves agent profile image under STORAGE_ROOT/agents/{agentId}/.
 * Returns public URL path served by /uploads.
 */
export async function saveAgentImage(
  agentId: string,
  file: { mimetype: string; size: number; buffer: Buffer },
): Promise<string> {
  assertValidImageUpload(file);
  const ext = EXT_BY_MIME[file.mimetype] ?? ".bin";
  const dir = path.join(env.STORAGE_ROOT, "agents", agentId);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  await writeFile(path.join(dir, filename), file.buffer);
  return `/uploads/agents/${agentId}/${filename}`;
}

export const localStorageLimits = {
  maxBytes: MAX_BYTES,
  allowedMime: [...ALLOWED_MIME],
};
