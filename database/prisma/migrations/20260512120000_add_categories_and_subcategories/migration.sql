-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Service" ADD COLUMN "subcategoryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Subcategory_categoryId_name_key" ON "Subcategory"("categoryId", "name");
CREATE INDEX "Subcategory_categoryId_idx" ON "Subcategory"("categoryId");
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");
CREATE INDEX "Service_subcategoryId_idx" ON "Service"("subcategoryId");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed a starter catalog used by the provider UI and admin category management.
INSERT INTO "Category" ("id", "name", "updatedAt")
VALUES
  ('cat-traiteur', 'Traiteur', CURRENT_TIMESTAMP),
  ('cat-events', 'Events', CURRENT_TIMESTAMP),
  ('cat-beauty', 'Beauty', CURRENT_TIMESTAMP),
  ('cat-media', 'Media', CURRENT_TIMESTAMP),
  ('cat-entertainment', 'Entertainment', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Subcategory" ("id", "name", "categoryId", "updatedAt")
VALUES
  ('sub-traiteur-chinese-food', 'Chinese Food', 'cat-traiteur', CURRENT_TIMESTAMP),
  ('sub-traiteur-moroccan-food', 'Moroccan Food', 'cat-traiteur', CURRENT_TIMESTAMP),
  ('sub-traiteur-french-food', 'French Food', 'cat-traiteur', CURRENT_TIMESTAMP),
  ('sub-traiteur-buffet', 'Buffet', 'cat-traiteur', CURRENT_TIMESTAMP),
  ('sub-traiteur-pastry', 'Pastry', 'cat-traiteur', CURRENT_TIMESTAMP),
  ('sub-traiteur-wedding-catering', 'Wedding Catering', 'cat-traiteur', CURRENT_TIMESTAMP),
  ('sub-events-decoration', 'Decoration', 'cat-events', CURRENT_TIMESTAMP),
  ('sub-events-wedding-planning', 'Wedding Planning', 'cat-events', CURRENT_TIMESTAMP),
  ('sub-events-birthday-planning', 'Birthday Planning', 'cat-events', CURRENT_TIMESTAMP),
  ('sub-events-florist', 'Florist', 'cat-events', CURRENT_TIMESTAMP),
  ('sub-events-venue-setup', 'Venue Setup', 'cat-events', CURRENT_TIMESTAMP),
  ('sub-beauty-makeup', 'Makeup', 'cat-beauty', CURRENT_TIMESTAMP),
  ('sub-beauty-hair-styling', 'Hair Styling', 'cat-beauty', CURRENT_TIMESTAMP),
  ('sub-beauty-henna', 'Henna', 'cat-beauty', CURRENT_TIMESTAMP),
  ('sub-beauty-nails', 'Nails', 'cat-beauty', CURRENT_TIMESTAMP),
  ('sub-beauty-skin-care', 'Skin Care', 'cat-beauty', CURRENT_TIMESTAMP),
  ('sub-media-photography', 'Photography', 'cat-media', CURRENT_TIMESTAMP),
  ('sub-media-videography', 'Videography', 'cat-media', CURRENT_TIMESTAMP),
  ('sub-media-reels', 'Reels', 'cat-media', CURRENT_TIMESTAMP),
  ('sub-media-drone', 'Drone', 'cat-media', CURRENT_TIMESTAMP),
  ('sub-media-photo-booth', 'Photo Booth', 'cat-media', CURRENT_TIMESTAMP),
  ('sub-entertainment-dj', 'DJ', 'cat-entertainment', CURRENT_TIMESTAMP),
  ('sub-entertainment-live-band', 'Live Band', 'cat-entertainment', CURRENT_TIMESTAMP),
  ('sub-entertainment-traditional-music', 'Traditional Music', 'cat-entertainment', CURRENT_TIMESTAMP),
  ('sub-entertainment-kids-animation', 'Kids Animation', 'cat-entertainment', CURRENT_TIMESTAMP),
  ('sub-entertainment-host', 'Host', 'cat-entertainment', CURRENT_TIMESTAMP)
ON CONFLICT ("categoryId", "name") DO NOTHING;

-- Backfill categories from existing services, including any provider-written values.
INSERT INTO "Category" ("id", "name", "updatedAt")
SELECT 'cat-' || md5(TRIM("category")), TRIM("category"), CURRENT_TIMESTAMP
FROM "Service"
WHERE TRIM(COALESCE("category", '')) <> ''
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Subcategory" ("id", "name", "categoryId", "updatedAt")
SELECT
  'sub-' || md5(TRIM(s."category") || '/' || TRIM(s."subcategory")),
  TRIM(s."subcategory"),
  c."id",
  CURRENT_TIMESTAMP
FROM "Service" s
JOIN "Category" c ON c."name" = TRIM(s."category")
WHERE TRIM(COALESCE(s."category", '')) <> ''
  AND TRIM(COALESCE(s."subcategory", '')) <> ''
ON CONFLICT ("categoryId", "name") DO NOTHING;

UPDATE "Service" s
SET "categoryId" = c."id"
FROM "Category" c
WHERE c."name" = TRIM(s."category");

UPDATE "Service" s
SET "subcategoryId" = sc."id"
FROM "Category" c
JOIN "Subcategory" sc ON sc."categoryId" = c."id"
WHERE c."name" = TRIM(s."category")
  AND sc."name" = TRIM(s."subcategory");
