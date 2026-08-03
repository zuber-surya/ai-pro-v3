-- CreateTable
CREATE TABLE "ai_configs" (
    "id" UUID NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "greeting" TEXT NOT NULL,
    "faqs_json" JSONB NOT NULL DEFAULT '[]',
    "escalation_json" JSONB NOT NULL DEFAULT '{}',
    "tone" VARCHAR(40),
    "prompts_json" JSONB NOT NULL DEFAULT '{}',
    "model_label" VARCHAR(80) NOT NULL DEFAULT 'gemini',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_configs_key_key" ON "ai_configs"("key");

-- AddForeignKey
ALTER TABLE "ai_configs" ADD CONSTRAINT "ai_configs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_configs" ADD CONSTRAINT "ai_configs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default Gemini-only chatbot config
INSERT INTO "ai_configs" (
  "id",
  "key",
  "greeting",
  "faqs_json",
  "escalation_json",
  "tone",
  "prompts_json",
  "model_label",
  "created_at",
  "updated_at"
) VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'default',
  'Hello! I''m PropVista''s AI assistant. How can I help you find your dream home today?',
  '[
    {"q":"How do I schedule a tour?","a":"You can click Schedule Visit on any property page to book a slot."},
    {"q":"Do you offer virtual showings?","a":"Yes, select the Virtual Tour option during the scheduling process."},
    {"q":"What documents are needed for rental?","a":"Proof of income, ID, and 3 months of bank statements are standard."}
  ]'::jsonb,
  '{"failedResponseThreshold":3,"onExplicitHumanRequest":true}'::jsonb,
  'friendly',
  '{"system":"You are PropVista CRM''s AI real estate assistant for the Indian market. Answer briefly and helpfully about property search, buying/renting basics, home loans, and how to use PropVista. Do not invent specific inventory listings, prices, or availability. Stay on real-estate topics."}'::jsonb,
  'gemini',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
