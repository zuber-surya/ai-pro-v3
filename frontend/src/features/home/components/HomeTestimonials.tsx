import { TESTIMONIALS } from "../content";
import type { HomepageTestimonial } from "@/features/cms";

export function HomeTestimonials({ items }: { items?: HomepageTestimonial[] }) {
  const list =
    items && items.length > 0
      ? items.map((t, i) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
          stars: t.stars ?? 5,
          avatar: t.avatar ?? TESTIMONIALS[i % TESTIMONIALS.length]?.avatar ?? "",
        }))
      : [...TESTIMONIALS];

  return (
    <section className="mx-auto max-w-container-max px-xl py-xl">
      <h2 className="font-headline-lg mb-xl text-center text-headline-lg text-on-surface">
        Trusted by thousands of owners
      </h2>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {list.map((t) => (
          <article
            key={t.name}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
          >
            <div className="mb-md flex gap-xs text-ai-accent" aria-label={`${t.stars} of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-[18px]"
                  style={{
                    fontVariationSettings: i < t.stars ? "'FILL' 1" : "'FILL' 0",
                  }}
                  aria-hidden
                >
                  star
                </span>
              ))}
            </div>
            <p className="font-body-md mb-lg text-on-surface">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-md">
              {t.avatar ? (
                <div className="h-12 w-12 overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-label-md text-primary">
                  {t.name.slice(0, 1)}
                </div>
              )}
              <div>
                <p className="font-label-md text-on-surface">{t.name}</p>
                <p className="font-label-sm text-on-surface-variant">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
