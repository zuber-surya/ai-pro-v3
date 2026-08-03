/**
 * Local demo seed — homepage CMS defaults + curated featured listings.
 * Run: npm run prisma:seed (non-production only).
 */
import "dotenv/config";
import { PrismaClient, PropertyStatus } from "@prisma/client";

const prisma = new PrismaClient();

const HOMEPAGE_SECTIONS = {
  hero: {
    eyebrow: "AI-Powered Search Engine",
    headline: "Find your next home with Intelligence.",
    headlineHighlight: "Intelligence",
    subheadline:
      "Skip the filters. Just tell our AI exactly what you're looking for in plain English.",
    searchPlaceholder: "Try '3BHK under 80 lakhs near tech park'",
    popularSearches: [
      "Pet-friendly in Indiranagar",
      "Villas with garden",
      "Modern lofts downtown",
    ],
  },
  featured: {
    title: "Curated matches for you",
    subtitle: "Properties that align with your lifestyle profile.",
    propertyIds: [
      "f1000000-0000-4000-8000-000000000001",
      "f1000000-0000-4000-8000-000000000002",
      "f1000000-0000-4000-8000-000000000003",
    ],
  },
  journey: {
    steps: [
      {
        icon: "chat_bubble_outline",
        title: "1. Search or Chat",
        body: "Use natural language to describe exactly what you need. No more rigid filters.",
        tone: "primary",
      },
      {
        icon: "hub",
        title: "2. Get Matched",
        body: "Our AI analyzes thousands of properties to find your perfect 1:1 match.",
        tone: "ai",
      },
      {
        icon: "handshake",
        title: "3. Connect",
        body: "Tour the best options with our top-rated agents and close the deal.",
        tone: "secondary",
      },
    ],
  },
  testimonials: {
    items: [
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
    ],
  },
} as const;

const FEATURED_SHOWCASE = [
  {
    id: "f1000000-0000-4000-8000-000000000001",
    title: "Skyline Residences",
    price: "12000000",
    propertyType: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    areaSqFt: 1850,
    addressLine: "MG Road",
    city: "Bangalore",
    region: "Karnataka",
    country: "India",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNqELk8MLCTE3yAP7rrphgOjNPjUDFlPmqhvynyVNd7tiY3dAPoP0yepZ8kDIoaNiXwsekuloXMW5Wm4qyDVfUKFP50jxHoiOj3WGn2f2LFas3Ect-Lv0txziKKjgN-K7-RwHc-Cpo8byUASHUuEX3FUTfM7NpnEk6mePLiV0UUN2BkhOuOWUd2WFFWpaGVtOPLkWUAxGGU50q2PAgLrYLGHrTLrA9T1L_zz_6Q8d5hSke7KnlV2hL7Q",
  },
  {
    id: "f1000000-0000-4000-8000-000000000002",
    title: "The Green Villa",
    price: "8500000",
    propertyType: "Villa",
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1400,
    addressLine: "Whitefield",
    city: "Bangalore",
    region: "Karnataka",
    country: "India",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQH05Pd5UtkqR88qRyZgD8LUc8VeoUFnpuIdtKTRlE2wRH8mJtPgbJtBXUFGkaIytN8NmTMhW9ggefNx80GM09ee5lR23b0kZCr6FPbr-kCTmrWFg2LZfKWp2b85x_I7HXbXFV2RHJ61dgtRu4y-Ghjl-WGBCVHssO2X2-jq-8a_SMdeQI_IukQKmhMbmIHU_4qFJmYsNS-kpDzWzVfrXGr_9m_aQrAVeFv_y9aqXXXenxYIjYSzvpuA",
  },
  {
    id: "f1000000-0000-4000-8000-000000000003",
    title: "Industrial Loft",
    price: "15000000",
    propertyType: "Loft",
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2100,
    addressLine: "Koramangala",
    city: "Bangalore",
    region: "Karnataka",
    country: "India",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDadPEZUHU1ASR3IAeKE-vq5Nh9lNfkfib-dhqClulIVWHcm336XhTmiGSE2wr7msE5dxV8AVZ_s8Elw7RwxpS9nw_LE659iUZ8ZlAloNqiopp0DrfvwvNIWpNUuahOeTPJ2goygav-1XXNhJHDDdI7Xp1BhaHp845bRpK1DocuTSnpkzHl8TRNoomFNiK4nHQJDo6CH3BEcjl19n0OUjjIw6yhms23OCTyRMGylvlpPi8ViVAE7K-FSQ",
  },
] as const;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed in production");
  }

  await prisma.cmsPage.update({
    where: { slug: "homepage" },
    data: {
      title: "PropVista Homepage",
      bodyJson: HOMEPAGE_SECTIONS,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // Keep curated strip to design showcase only.
  await prisma.property.updateMany({
    where: { featured: true, id: { notIn: FEATURED_SHOWCASE.map((p) => p.id) } },
    data: { featured: false },
  });

  for (const item of FEATURED_SHOWCASE) {
    const { imageUrl, ...fields } = item;
    await prisma.property.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        ...fields,
        currency: "INR",
        status: PropertyStatus.published,
        featured: true,
        publishedAt: new Date(),
        description: `Curated showcase listing: ${item.title}`,
      },
      update: {
        ...fields,
        status: PropertyStatus.published,
        featured: true,
        publishedAt: new Date(),
      },
    });

    const existingImage = await prisma.propertyImage.findFirst({
      where: { propertyId: item.id, sortOrder: 0 },
    });
    if (existingImage) {
      await prisma.propertyImage.update({
        where: { id: existingImage.id },
        data: { url: imageUrl, kind: "photo" },
      });
    } else {
      await prisma.propertyImage.create({
        data: {
          propertyId: item.id,
          url: imageUrl,
          kind: "photo",
          sortOrder: 0,
          caption: item.title,
        },
      });
    }
  }

  console.log("Seed complete: homepage CMS + 3 curated featured listings.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
