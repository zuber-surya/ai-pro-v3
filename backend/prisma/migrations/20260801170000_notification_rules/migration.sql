-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'in_app');

-- CreateTable
CREATE TABLE "notification_rules" (
    "id" UUID NOT NULL,
    "event_type" VARCHAR(80) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "template_key" VARCHAR(120),
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_notification_rules_event_channel" ON "notification_rules"("event_type", "channel");

-- Seed default new_lead email + in_app rules
INSERT INTO "notification_rules" ("id", "event_type", "channel", "is_enabled", "template_key", "created_at", "updated_at")
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'new_lead', 'email', true, 'new_lead_email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('b1000000-0000-4000-8000-000000000002', 'new_lead', 'in_app', true, 'new_lead_in_app', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
