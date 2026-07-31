"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { ErrorState, Loader } from "@/components/states";
import {
  getProperty,
  replaceAmenities,
  updateProperty,
  type Property,
} from "@/lib/api/properties";
import { AppError } from "@/types/api";

const STANDARD_AMENITIES = [
  "Parking",
  "Balcony",
  "Gym",
  "Pool",
  "Garden",
  "Security",
  "Elevator",
  "Power Backup",
  "Clubhouse",
  "Pet Friendly",
];

type FieldErrors = Partial<Record<string, string>>;

export function ListingEditorPanel({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Property["status"]>("draft");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [areaSqFt, setAreaSqFt] = useState("");
  const [bedrooms, setBedrooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [featured, setFeatured] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [customAmenity, setCustomAmenity] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProperty(propertyId)
      .then((p) => {
        if (cancelled) return;
        setTitle(p.title);
        setDescription(p.description ?? "");
        setPrice(p.price);
        setPropertyType(p.propertyType);
        setAreaSqFt(String(p.areaSqFt));
        setBedrooms(String(p.bedrooms));
        setBathrooms(String(p.bathrooms));
        setAddressLine(p.address.line);
        setCity(p.address.city ?? "");
        setFeatured(p.featured);
        setStatus(p.status);
        setSelectedAmenities(new Set(p.amenities ?? []));
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof AppError ? err.message : "Failed to load property");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  function validateForPublish(): boolean {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "Required";
    if (!propertyType.trim()) next.propertyType = "Required";
    if (!addressLine.trim()) next.addressLine = "Required";
    if (!(Number(price) > 0)) next.price = "Must be greater than 0";
    if (!(Number(areaSqFt) > 0)) next.areaSqFt = "Must be greater than 0";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateDraft(): boolean {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "Required";
    if (!addressLine.trim()) next.addressLine = "Required";
    if (!propertyType.trim()) next.propertyType = "Required";
    if (!price.trim()) next.price = "Required";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(as: "draft" | "published") {
    setError(null);
    if (as === "published" ? !validateForPublish() : !validateDraft()) return;
    setSaving(true);
    try {
      await updateProperty(propertyId, {
        title: title.trim(),
        description: description.trim() || null,
        price: price.trim(),
        propertyType: propertyType.trim(),
        areaSqFt: Number(areaSqFt) || 0,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        addressLine: addressLine.trim(),
        city: city.trim() || null,
        featured,
        status: as,
      });
      await replaceAmenities(propertyId, [...selectedAmenities]);
      setStatus(as);
      router.push("/properties");
    } catch (err) {
      if (err instanceof AppError) {
        const mapped: FieldErrors = {};
        for (const d of err.details) {
          if (d.field) mapped[d.field] = d.issue;
        }
        if (Object.keys(mapped).length) setFieldErrors(mapped);
        setError(err.message);
      } else {
        setError("Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  function toggleAmenity(name: string) {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function addCustom(e: FormEvent) {
    e.preventDefault();
    const name = customAmenity.trim();
    if (!name) return;
    setSelectedAmenities((prev) => new Set(prev).add(name));
    setCustomAmenity("");
  }

  if (loading) return <Loader />;
  if (error && !title) return <ErrorState message={error} />;

  const customSelected = [...selectedAmenities].filter(
    (a) => !STANDARD_AMENITIES.some((s) => s.toLowerCase() === a.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-xl px-md py-xl md:px-xl">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <Link href="/properties" className="text-body-sm text-primary hover:underline">
            ← Properties
          </Link>
          <h1 className="mt-sm font-headline-lg text-headline-lg text-on-surface">Edit listing</h1>
          <p className="text-body-sm capitalize text-on-surface-variant">Status: {status}</p>
        </div>
        <div className="flex gap-sm">
          <Button variant="secondary" disabled={saving} onClick={() => void save("draft")}>
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void save("published")}>
            Publish
          </Button>
        </div>
      </div>

      {/* Tabs: Basic Info active; Media omitted (no video/tour) */}
      <div className="flex gap-lg border-b border-outline-variant">
        <span className="border-b-2 border-primary pb-md font-label-md text-primary">Basic Info</span>
        <span className="pb-md font-label-md text-on-surface-variant">Amenities</span>
      </div>

      {error ? <ErrorState message={error} /> : null}

      <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <h2 className="font-headline-md text-headline-md">Basic Info</h2>
        <Input
          label="Listing Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={fieldErrors.title}
        />
        <label className="flex flex-col gap-xs text-body-sm text-on-surface">
          Description
          <textarea
            className="min-h-28 rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="grid gap-md md:grid-cols-2">
          <Input
            label="Price (INR)"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={fieldErrors.price}
          />
          <Input
            label="Property Area (sq. ft.)"
            name="areaSqFt"
            value={areaSqFt}
            onChange={(e) => setAreaSqFt(e.target.value)}
            error={fieldErrors.areaSqFt}
          />
          <Input
            label="Property Type"
            name="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            error={fieldErrors.propertyType}
          />
          <Input
            label="Address"
            name="addressLine"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            error={fieldErrors.addressLine}
          />
          <Input label="City" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input
            label="Bedrooms"
            name="bedrooms"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
          <Input
            label="Bathrooms"
            name="bathrooms"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-sm text-body-md">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured Listing
        </label>
      </section>

      <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <h2 className="font-headline-md text-headline-md">Amenities</h2>
        <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-3">
          {STANDARD_AMENITIES.map((name) => (
            <label key={name} className="flex items-center gap-sm rounded-lg border border-outline-variant px-md py-sm">
              <input
                type="checkbox"
                checked={[...selectedAmenities].some((a) => a.toLowerCase() === name.toLowerCase())}
                onChange={() => toggleAmenity(name)}
              />
              <span className="text-body-sm">{name}</span>
            </label>
          ))}
        </div>
        <form className="flex flex-wrap items-end gap-sm" onSubmit={addCustom}>
          <div className="min-w-[200px] flex-1">
            <Input
              label="Custom amenity"
              name="customAmenity"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Add
          </Button>
        </form>
        {customSelected.length > 0 ? (
          <ul className="flex flex-wrap gap-sm">
            {customSelected.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="rounded-lg bg-surface-container-high px-sm py-xs text-body-sm"
                  onClick={() => toggleAmenity(name)}
                >
                  {name} ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
