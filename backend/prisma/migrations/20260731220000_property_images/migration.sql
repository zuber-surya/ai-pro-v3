-- CreateEnum
CREATE TYPE "PropertyImageKind" AS ENUM ('photo', 'floorplan');

-- CreateTable
CREATE TABLE "property_images" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "kind" "PropertyImageKind" NOT NULL DEFAULT 'photo',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "caption" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_property_images_property_id_sort" ON "property_images"("property_id", "sort_order");

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
