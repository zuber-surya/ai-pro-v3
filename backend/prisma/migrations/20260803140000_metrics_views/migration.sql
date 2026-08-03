-- CreateTable
CREATE TABLE "property_view_events" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "viewer_user_id" UUID,
    "session_id" VARCHAR(100),
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_view_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_daily_snapshots" (
    "id" UUID NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "active_listings" INTEGER NOT NULL DEFAULT 0,
    "active_leads" INTEGER NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "sessions_count" INTEGER NOT NULL DEFAULT 0,
    "lead_sources_json" JSONB,
    "stage_distribution_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metrics_daily_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_property_view_events_property_viewed" ON "property_view_events"("property_id", "viewed_at");

-- CreateIndex
CREATE INDEX "ix_property_view_events_viewed_at" ON "property_view_events"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_metrics_daily_snapshots_date" ON "metrics_daily_snapshots"("snapshot_date");

-- AddForeignKey
ALTER TABLE "property_view_events" ADD CONSTRAINT "property_view_events_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
