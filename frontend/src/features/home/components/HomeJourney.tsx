import { JOURNEY_STEPS } from "../content";

const toneClass = {
  primary: "bg-primary/10 text-primary",
  ai: "bg-ai-accent/10 text-ai-accent",
  secondary: "bg-secondary/10 text-secondary",
} as const;

export function HomeJourney() {
  return (
    <section className="bg-surface-container py-xl">
      <div className="mx-auto max-w-container-max px-xl text-center">
        <h2 className="font-headline-lg mb-xl text-headline-lg text-on-surface">
          Your journey to a better home
        </h2>
        <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
          {JOURNEY_STEPS.map((step) => (
            <div key={step.title} className="flex flex-col items-center">
              <div
                className={`mb-lg flex h-20 w-20 items-center justify-center rounded-full ${toneClass[step.tone]}`}
              >
                <span className="material-symbols-outlined text-[32px]" aria-hidden>
                  {step.icon}
                </span>
              </div>
              <h3 className="font-headline-md mb-sm text-[20px]">{step.title}</h3>
              <p className="font-body-md max-w-xs text-on-surface-variant">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
