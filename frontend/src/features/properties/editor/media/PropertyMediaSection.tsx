"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { ErrorState, Loader } from "@/components/states";
import { publicEnv } from "@/lib/config/env";
import {
  deletePropertyImage,
  listPropertyImages,
  uploadPropertyImage,
  type PropertyImage,
} from "@/lib/api/properties";
import { AppError } from "@/types/api";

function mediaSrc(url: string): string {
  if (url.startsWith("http")) return url;
  const base = publicEnv.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${base}${url}`;
}

export function PropertyMediaSection({ propertyId }: { propertyId: string }) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [kind, setKind] = useState<"photo" | "floorplan">("photo");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setImages(await listPropertyImages(propertyId));
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadPropertyImage(propertyId, file, { kind });
      await load();
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await deletePropertyImage(propertyId, id);
      await load();
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Delete failed");
    }
  }

  const photos = images.filter((i) => i.kind === "photo");
  const floorplans = images.filter((i) => i.kind === "floorplan");

  return (
    <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
      <h2 className="font-headline-md text-headline-md">Media</h2>
      <p className="text-body-sm text-on-surface-variant">
        Photos and floorplans only (jpeg/png/webp, max 2MB). No video or virtual tour.
      </p>

      <div className="flex flex-wrap items-end gap-sm">
        <label className="flex flex-col gap-xs text-body-sm">
          Kind
          <select
            className="rounded-lg border border-outline-variant bg-surface px-md py-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as "photo" | "floorplan")}
          >
            <option value="photo">Photo</option>
            <option value="floorplan">Floorplan</option>
          </select>
        </label>
        <label className="flex flex-col gap-xs text-body-sm">
          Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => void onUpload(e.target.files)}
          />
        </label>
        {uploading ? <span className="text-body-sm text-on-surface-variant">Uploading…</span> : null}
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <Loader /> : null}

      {!loading ? (
        <div className="grid gap-lg md:grid-cols-2">
          <div>
            <h3 className="mb-sm font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Photos ({photos.length})
            </h3>
            <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
              {photos.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-lg border border-outline-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaSrc(img.url)} alt={img.caption ?? ""} className="aspect-square w-full object-cover" />
                  <Button
                    variant="ghost"
                    className="absolute bottom-1 right-1 bg-surface/90"
                    onClick={() => void onDelete(img.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            {photos.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No photos yet.</p>
            ) : null}
          </div>
          <div>
            <h3 className="mb-sm font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Floorplans ({floorplans.length})
            </h3>
            <div className="grid grid-cols-2 gap-sm">
              {floorplans.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-lg border border-outline-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaSrc(img.url)} alt={img.caption ?? "Floorplan"} className="aspect-square w-full object-cover" />
                  <Button
                    variant="ghost"
                    className="absolute bottom-1 right-1 bg-surface/90"
                    onClick={() => void onDelete(img.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            {floorplans.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No floorplans yet.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
