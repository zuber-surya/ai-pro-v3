-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('requested', 'confirmed', 'cancelled', 'completed');

-- CreateTable
CREATE TABLE "visits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'requested',
    "notes" TEXT,
    "customer_user_id" UUID,
    "created_by_user_id" UUID,
    "lead_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_visits_property_id" ON "visits"("property_id");

-- CreateIndex
CREATE INDEX "ix_visits_scheduled_at" ON "visits"("scheduled_at");

-- CreateIndex
CREATE INDEX "ix_visits_status" ON "visits"("status");

-- CreateIndex
CREATE INDEX "ix_visits_customer_user_id" ON "visits"("customer_user_id");

-- CreateIndex
CREATE INDEX "ix_visits_lead_id" ON "visits"("lead_id");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
