import { TESTIMONIALS } from "../content";

export function HomeTestimonials() {
  return (
    <section className="mx-auto max-w-container-max px-xl py-xl">
      <h2 className="font-headline-lg mb-xl text-center text-headline-lg text-on-surface">
        Trusted by thousands of owners
      </h2>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
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
              <div className="h-12 w-12 overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.avatar} alt="" className="h-full w-full object-cover" />
              </div>
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
