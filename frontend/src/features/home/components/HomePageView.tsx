"use client";

import { useEffect, useState } from "react";
import { getCmsHomepage } from "@/lib/api";
import { asHomepageSections, type HomepageSections } from "@/features/cms";
import { HomeHeader } from "./HomeHeader";
import { HomeHero } from "./HomeHero";
import { FeaturedProperties } from "./FeaturedProperties";
import { HomeJourney } from "./HomeJourney";
import { HomeTestimonials } from "./HomeTestimonials";
import { HomeLeadCapture } from "./HomeLeadCapture";
import { HomeFooter } from "./HomeFooter";
import { HomeChatShell } from "./HomeChatShell";

/** SCR-HOME — PropVista CRM homepage shell (CMS-influenced with static fallbacks) */
export function HomePageView() {
  const [sections, setSections] = useState<HomepageSections>({});

  useEffect(() => {
    let cancelled = false;
    getCmsHomepage()
      .then((page) => {
        if (!cancelled) setSections(asHomepageSections(page));
      })
      .catch(() => {
        /* designed defaults via component fallbacks */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <HomeHeader />
      <main>
        <HomeHero cms={sections.hero} />
        <FeaturedProperties
          title={sections.featured?.title}
          subtitle={sections.featured?.subtitle}
          propertyIds={sections.featured?.propertyIds}
        />
        <HomeJourney steps={sections.journey?.steps} />
        <HomeTestimonials items={sections.testimonials?.items} />
        <HomeLeadCapture />
      </main>
      <HomeChatShell />
      <HomeFooter />
    </div>
  );
}
