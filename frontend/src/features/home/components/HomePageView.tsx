import { HomeHeader } from "./HomeHeader";
import { HomeHero } from "./HomeHero";
import { FeaturedProperties } from "./FeaturedProperties";
import { HomeJourney } from "./HomeJourney";
import { HomeTestimonials } from "./HomeTestimonials";
import { HomeFooter } from "./HomeFooter";
import { HomeChatShell } from "./HomeChatShell";

/** SCR-HOME — PropVista CRM homepage shell */
export function HomePageView() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <HomeHeader />
      <main>
        <HomeHero />
        <FeaturedProperties />
        <HomeJourney />
        <HomeTestimonials />
      </main>
      <HomeChatShell />
      <HomeFooter />
    </div>
  );
}
