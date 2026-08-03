/** Static homepage marketing fallbacks when CMS is unavailable. */

export const POPULAR_SEARCHES = [
  "Pet-friendly in Indiranagar",
  "Villas with garden",
  "Modern lofts downtown",
] as const;

export const JOURNEY_STEPS = [
  {
    icon: "chat_bubble_outline",
    title: "1. Search or Chat",
    body: "Use natural language to describe exactly what you need. No more rigid filters.",
    tone: "primary" as const,
  },
  {
    icon: "hub",
    title: "2. Get Matched",
    body: "Our AI analyzes thousands of properties to find your perfect 1:1 match.",
    tone: "ai" as const,
  },
  {
    icon: "handshake",
    title: "3. Connect",
    body: "Tour the best options with our top-rated agents and close the deal.",
    tone: "secondary" as const,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "The AI search is a game changer. I just typed what I wanted and it found the exact apartment that wasn't even on other sites.",
    name: "Aditi Sharma",
    role: "Tech Lead at FinCorp",
    stars: 5,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvPLphI9Z3Hab1N0-VdR1S1AVRvIc-fwZ65tTXnqtL5oizRiDGjJ2IeAZUqfhzWn6rPLgUA8nFmIMICgXIjtC-4qZ3Bol_3Kn0GK3C-NIX940rPMV7kQAM9eBpd_02eEILaUMIj14XmjVLXNEPJUyq93M8-HllBhyVpMAUhAdPWvQlpZTVw3jSUEQ0NnX-a-MiPEVCtNCpwrm1tpetTfGnurNU-kYfw18R5RRNs-IYffKu6S4b8GZzQw",
  },
  {
    quote:
      "Finally, a CRM that understands real estate. The agent dashboard and AI insights saved us hours of manual data entry.",
    name: "Rahul Mehta",
    role: "Founder, Urban Spaces",
    stars: 5,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAflldv_EN-QSWwHejXfRoMZBSyb0xNFHFEWzf1QmsSQSfbZtKFUsltXtzGN7CyKweBcN7YfaZTADqwnkND5vRc5a-RN29FGUMeH31nOTBCBrJytXFgS1ITsE8HYoNamBtc4XQvyAGUDPpoptaHsVLQEqgsqjYB6GyqzkEq6R1dMAT6oYnbinHxsZx-gH1IdrG2sukwutjSwcHI0Di0afiufS0l_iqB8tbumlckElRNti4UezVm9HBHgg",
  },
  {
    quote:
      "Smooth, fast, and intelligent. The matching algorithm is scarily accurate. Highly recommended for busy professionals.",
    name: "Kevin Zhang",
    role: "Design Architect",
    stars: 4,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmJVuqD_i-RJldOZhYezVc5n7dXGlvRUid4Cy05KXSMrKpBALAsWlcVK3OmNc-FESAQkwziDggxYrTWP6zEcqRcwNZreNBG0NOgs8Key4154hC6fg8RggbirUnUyJJOfEHgnBCFICz9cmhnvzU_89Qz2SxHKDTyi1zbajjUGcgfkNc5cBVx0vcc3X9eJ_9lOs_HjzEUWFwMWDMX0oTjDdylWKV4kshyhWrT5HecyP9cVVVkNqlFb1LhA",
  },
] as const;
