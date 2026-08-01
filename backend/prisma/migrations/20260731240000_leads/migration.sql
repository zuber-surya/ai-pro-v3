-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('new', 'contacted', 'qualified', 'visit_scheduled', 'negotiation', 'won', 'lost');

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(40),
    "preferred_contact_time" VARCHAR(120),
    "message" TEXT,
    "source" VARCHAR(80) NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'new',
    "score" DECIMAL(5,2),
    "property_id" UUID,
    "assignee_agent_id" UUID,
    "customer_user_id" UUID,
    "idempotency_key" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_idempotency_key_key" ON "leads"("idempotency_key");

-- CreateIndex
CREATE INDEX "ix_leads_stage" ON "leads"("stage");

-- CreateIndex
CREATE INDEX "ix_leads_email" ON "leads"("email");

-- CreateIndex
CREATE INDEX "ix_leads_assignee" ON "leads"("assignee_agent_id");

-- CreateIndex
CREATE INDEX "ix_leads_property_id" ON "leads"("property_id");

-- CreateIndex
CREATE INDEX "ix_leads_created_at" ON "leads"("created_at");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignee_agent_id_fkey" FOREIGN KEY ("assignee_agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
