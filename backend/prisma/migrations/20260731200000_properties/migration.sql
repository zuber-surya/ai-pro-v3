-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('draft', 'published', 'archived', 'sold', 'rented');

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'draft',
    "price" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "property_type" VARCHAR(80) NOT NULL,
    "beds" INTEGER NOT NULL DEFAULT 0,
    "baths" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "sqft" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "address_line" VARCHAR(500) NOT NULL,
    "city" VARCHAR(120),
    "region" VARCHAR(120),
    "postal_code" VARCHAR(32),
    "country" VARCHAR(120),
    "year_built" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "agent_id" UUID,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "saves_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_properties_status" ON "properties"("status");

-- CreateIndex
CREATE INDEX "ix_properties_price" ON "properties"("price");

-- CreateIndex
CREATE INDEX "ix_properties_city" ON "properties"("city");

-- CreateIndex
CREATE INDEX "ix_properties_type" ON "properties"("property_type");

-- CreateIndex
CREATE INDEX "ix_properties_agent_id" ON "properties"("agent_id");

-- CreateIndex
CREATE INDEX "ix_properties_published_at" ON "properties"("published_at");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
