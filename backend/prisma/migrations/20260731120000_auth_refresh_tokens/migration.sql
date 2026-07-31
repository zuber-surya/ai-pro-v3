-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" VARCHAR(200);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(40);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_users_role" ON "users"("role");

-- CreateTable
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "ix_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "ix_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
