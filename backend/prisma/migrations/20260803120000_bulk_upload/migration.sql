-- CreateTable
CREATE TABLE "bulk_upload_sessions" (
    "id" UUID NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "file_name" VARCHAR(300) NOT NULL DEFAULT 'records.json',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "warning_rows" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(40) NOT NULL DEFAULT 'validated',
    "idempotency_key" VARCHAR(100),
    "valid_records_json" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_upload_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_upload_row_errors" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "row_number" INTEGER NOT NULL,
    "field_name" VARCHAR(120),
    "message" TEXT NOT NULL,
    "original_value" TEXT,
    "suggestion" TEXT,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'error',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bulk_upload_row_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bulk_upload_sessions_idempotency_key_key" ON "bulk_upload_sessions"("idempotency_key");

-- CreateIndex
CREATE INDEX "ix_bulk_upload_sessions_uploader_created" ON "bulk_upload_sessions"("uploaded_by", "created_at");

-- CreateIndex
CREATE INDEX "ix_bulk_upload_row_errors_session_row" ON "bulk_upload_row_errors"("session_id", "row_number");

-- AddForeignKey
ALTER TABLE "bulk_upload_sessions" ADD CONSTRAINT "bulk_upload_sessions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_upload_row_errors" ADD CONSTRAINT "bulk_upload_row_errors_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "bulk_upload_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
