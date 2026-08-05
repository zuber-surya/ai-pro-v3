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
    avatar: "/assets/stock/avatar-1.jpg",
  },
  {
    quote:
      "Finally, a CRM that understands real estate. The agent dashboard and AI insights saved us hours of manual data entry.",
    name: "Rahul Mehta",
    role: "Founder, Urban Spaces",
    stars: 5,
    avatar: "/assets/stock/avatar-2.jpg",
  },
  {
    quote:
      "Smooth, fast, and intelligent. The matching algorithm is scarily accurate. Highly recommended for busy professionals.",
    name: "Kevin Zhang",
    role: "Design Architect",
    stars: 4,
    avatar: "/assets/stock/avatar-3.jpg",
  },
] as const;
