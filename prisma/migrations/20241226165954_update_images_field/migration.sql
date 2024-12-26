-- CreateTable
CREATE TABLE "BlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "content_preview" TEXT,
    "author" TEXT NOT NULL,
    "category" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "label" TEXT,
    "published_at" DATETIME,
    "author_bio" TEXT,
    "reading_time" INTEGER,
    "featured_image_url" TEXT,
    "status" TEXT,
    "images" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
