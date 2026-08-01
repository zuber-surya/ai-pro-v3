"use client";

export type SearchUiFilters = {
  minPrice: string;
  maxPrice: string;
  propertyTypes: string[];
  bedrooms: number | null;
  amenities: string[];
};

export const DEFAULT_SEARCH_FILTERS: SearchUiFilters = {
  minPrice: "",
  maxPrice: "",
  propertyTypes: [],
  bedrooms: null,
  amenities: [],
};

const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Commercial"] as const;
const AMENITIES = ["Pool", "Gym", "Parking", "Security", "Garden", "Balcony"] as const;
const BED_OPTIONS = [1, 3, 5] as const;

export function SearchFiltersPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: SearchUiFilters;
  onChange: (next: SearchUiFilters) => void;
  onClear: () => void;
}) {
  function toggleType(type: string) {
    const set = new Set(filters.propertyTypes);
    if (set.has(type)) set.delete(type);
    else set.add(type);
    onChange({ ...filters, propertyTypes: Array.from(set) });
  }

  function toggleAmenity(name: string) {
    const set = new Set(filters.amenities);
    if (set.has(name)) set.delete(name);
    else set.add(name);
    onChange({ ...filters, amenities: Array.from(set) });
  }

  return (
    <aside className="flex w-full flex-shrink-0 flex-col gap-lg md:w-72">
      <div className="sticky top-24 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-level-1">
        <div className="mb-lg flex items-center justify-between">
          <h3 className="font-headline-md text-[18px] text-on-surface">Filters</h3>
          <button
            type="button"
            className="font-label-sm text-primary hover:underline"
            onClick={onClear}
          >
            Clear all
          </button>
        </div>

        <div className="mb-lg">
          <label className="mb-base block font-label-md text-on-surface-variant">Price Range</label>
          <div className="mb-md flex items-center gap-base">
            <input
              className="w-full rounded-lg border border-outline-variant px-2 py-1.5 text-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              aria-label="Minimum price"
            />
            <span className="text-outline-variant">-</span>
            <input
              className="w-full rounded-lg border border-outline-variant px-2 py-1.5 text-body-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              type="text"
              inputMode="numeric"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              aria-label="Maximum price"
            />
          </div>
        </div>

        <div className="mb-lg">
          <label className="mb-base block font-label-md text-on-surface-variant">
            Property Type
          </label>
          <div className="space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="group flex cursor-pointer items-center gap-md">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={filters.propertyTypes.includes(type)}
                  onChange={() => toggleType(type)}
                />
                <span className="text-body-sm text-on-surface transition-colors group-hover:text-primary">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-lg">
          <label className="mb-base block font-label-md text-on-surface-variant">Bedrooms</label>
          <div className="flex gap-2">
            {BED_OPTIONS.map((n) => {
              const active = filters.bedrooms === n;
              return (
                <button
                  key={n}
                  type="button"
                  className={[
                    "flex-1 rounded-lg border py-2 text-body-sm transition-all",
                    active
                      ? "border-primary bg-primary-container text-on-primary"
                      : "border-outline-variant hover:border-primary",
                  ].join(" ")}
                  onClick={() =>
                    onChange({ ...filters, bedrooms: active ? null : n })
                  }
                  aria-pressed={active}
                >
                  {n}+
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-base block font-label-md text-on-surface-variant">Amenities</label>
          <div className="space-y-2">
            {AMENITIES.map((name) => (
              <label key={name} className="flex cursor-pointer items-center gap-md">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={filters.amenities.includes(name)}
                  onChange={() => toggleAmenity(name)}
                />
                <span className="text-body-sm">{name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
