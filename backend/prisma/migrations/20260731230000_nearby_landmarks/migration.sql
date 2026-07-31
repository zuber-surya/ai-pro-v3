-- CreateTable
CREATE TABLE "nearby_landmarks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(80),
    "distance_m" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nearby_landmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_nearby_landmarks_property_id" ON "nearby_landmarks"("property_id");

-- AddForeignKey
ALTER TABLE "nearby_landmarks" ADD CONSTRAINT "nearby_landmarks_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
