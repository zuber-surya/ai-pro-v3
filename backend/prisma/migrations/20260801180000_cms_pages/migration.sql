-- CreateTable
CREATE TABLE "cms_pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "body_json" JSONB NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "ix_cms_pages_published" ON "cms_pages"("is_published");

-- Seed homepage + legal pages
INSERT INTO "cms_pages" ("id", "slug", "title", "body_json", "is_published", "published_at", "created_at", "updated_at")
VALUES
(
  'c1000000-0000-4000-8000-000000000001',
  'homepage',
  'PropVista Homepage',
  '{
    "hero": {
      "eyebrow": "AI-Powered Search Engine",
      "headline": "Find your next home with Intelligence.",
      "headlineHighlight": "Intelligence",
      "subheadline": "Skip the filters. Just tell our AI exactly what you are looking for in plain English.",
      "searchPlaceholder": "Try ''3BHK under 80 lakhs near tech park''",
      "popularSearches": ["Pet-friendly in Indiranagar", "Villas with garden", "Modern lofts downtown"]
    },
    "featured": {
      "title": "Curated matches for you",
      "subtitle": "Properties that align with your lifestyle profile.",
      "propertyIds": []
    },
    "journey": {
      "steps": [
        {"icon":"chat_bubble_outline","title":"1. Search or Chat","body":"Use natural language to describe exactly what you need. No more rigid filters.","tone":"primary"},
        {"icon":"hub","title":"2. Get Matched","body":"Our AI analyzes thousands of properties to find your perfect 1:1 match.","tone":"ai"},
        {"icon":"handshake","title":"3. Connect","body":"Tour the best options with our top-rated agents and close the deal.","tone":"secondary"}
      ]
    },
    "testimonials": {
      "items": [
        {"quote":"The AI search is a game changer. I just typed what I wanted and it found the exact apartment that wasn''t even on other sites.","name":"Aditi Sharma","role":"Tech Lead at FinCorp","stars":5},
        {"quote":"Finally, a CRM that understands real estate. The agent dashboard and AI insights saved us hours of manual data entry.","name":"Rahul Mehta","role":"Founder, Urban Spaces","stars":5},
        {"quote":"Smooth, fast, and intelligent. The matching algorithm is scarily accurate. Highly recommended for busy professionals.","name":"Kevin Zhang","role":"Design Architect","stars":4}
      ]
    }
  }'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'c1000000-0000-4000-8000-000000000002',
  'privacy',
  'Privacy Policy',
  '{"html":"<p>PropVista respects your privacy. We collect account and inquiry data to operate the platform. Contact support for data requests.</p>"}'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'c1000000-0000-4000-8000-000000000003',
  'terms',
  'Terms of Service',
  '{"html":"<p>By using PropVista you agree to lawful use of the service. Listings and AI guidance are informational and not legal advice.</p>"}'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
