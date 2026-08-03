import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { propertyService } from "./property.service.js";
import type { AuthUser } from "../middleware/requireAuth.middleware.js";
import {
  bulkRowCreateSchema,
  normalizeBulkRecord,
  type BulkValidateRequest,
} from "../validators/bulk.validators.js";

export type BulkSessionDto = {
  id: string;
  status: string;
  validCount: number;
  errorCount: number;
  warningCount: number;
  totalRows: number;
  fileName: string;
  createdAt: string;
  errors: Array<{
    rowNumber: number;
    fieldName: string | null;
    message: string;
    originalValue: string | null;
    suggestion: string | null;
    severity: string;
  }>;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const bulkService = {
  async validate(input: BulkValidateRequest, actor: AuthUser) {
    if (input.idempotencyKey) {
      const existing = await prisma.bulkUploadSession.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return {
          sessionId: existing.id,
          validCount: existing.validRows,
          errorCount: existing.errorRows,
        };
      }
    }

    const rowErrors: Array<{
      rowNumber: number;
      fieldName: string | null;
      message: string;
      originalValue: string | null;
      suggestion: string | null;
      severity: string;
    }> = [];
    const validRecords: Array<Record<string, unknown>> = [];
    let warningRows = 0;

    input.records.forEach((raw, index) => {
      const rowNumber = index + 1;
      const normalized = normalizeBulkRecord(raw as Record<string, unknown>);
      const parsed = bulkRowCreateSchema.safeParse(normalized);

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const field = issue.path.join(".") || null;
          const original =
            field && normalized[field] != null ? String(normalized[field]) : null;
          rowErrors.push({
            rowNumber,
            fieldName: field,
            message: issue.message,
            originalValue: original,
            suggestion: field ? `Provide a valid value for ${field}` : "Fix invalid fields",
            severity: "error",
          });
        }
        return;
      }

      const data = parsed.data;
      if (data.status && data.status !== "draft" && data.status !== "published") {
        rowErrors.push({
          rowNumber,
          fieldName: "status",
          message: "status must be draft or published",
          originalValue: String(data.status),
          suggestion: "Use draft or published",
          severity: "error",
        });
        return;
      }

      const hasLat = data.lat != null;
      const hasLng = data.lng != null;
      if (hasLat !== hasLng) {
        warningRows += 1;
        rowErrors.push({
          rowNumber,
          fieldName: hasLat ? "lng" : "lat",
          message: "Latitude and longitude should both be provided",
          originalValue: null,
          suggestion: "Provide both lat and lng, or omit both",
          severity: "warning",
        });
      } else if (!hasLat && !hasLng) {
        warningRows += 1;
        rowErrors.push({
          rowNumber,
          fieldName: "lat",
          message: "Coordinates missing (optional)",
          originalValue: null,
          suggestion: "Add lat/lng for map placement",
          severity: "warning",
        });
      }

      validRecords.push({
        ...data,
        _rowNumber: rowNumber,
      });
    });

    const errorRowNumbers = new Set(
      rowErrors.filter((e) => e.severity === "error").map((e) => e.rowNumber),
    );
    // Drop rows that also have errors from valid set
    const cleanValid = validRecords.filter(
      (r) => !errorRowNumbers.has(Number(r._rowNumber)),
    );

    const session = await prisma.bulkUploadSession.create({
      data: {
        uploadedBy: actor.id,
        fileName: input.fileName ?? "records.json",
        totalRows: input.records.length,
        validRows: cleanValid.length,
        errorRows: errorRowNumbers.size,
        warningRows,
        status: "validated",
        idempotencyKey: input.idempotencyKey,
        validRecordsJson: cleanValid as Prisma.InputJsonValue,
        errors: {
          create: rowErrors.map((e) => ({
            rowNumber: e.rowNumber,
            fieldName: e.fieldName,
            message: e.message,
            originalValue: e.originalValue,
            suggestion: e.suggestion,
            severity: e.severity,
          })),
        },
      },
    });

    return {
      sessionId: session.id,
      validCount: session.validRows,
      errorCount: session.errorRows,
    };
  },

  async getSession(id: string): Promise<BulkSessionDto> {
    const session = await prisma.bulkUploadSession.findUnique({
      where: { id },
      include: {
        errors: { orderBy: [{ rowNumber: "asc" }, { createdAt: "asc" }] },
      },
    });
    if (!session) throw new AppError("RESOURCE_NOT_FOUND", "Bulk session not found", 404);
    return {
      id: session.id,
      status: session.status,
      validCount: session.validRows,
      errorCount: session.errorRows,
      warningCount: session.warningRows,
      totalRows: session.totalRows,
      fileName: session.fileName,
      createdAt: session.createdAt.toISOString(),
      errors: session.errors.map((e) => ({
        rowNumber: e.rowNumber,
        fieldName: e.fieldName,
        message: e.message,
        originalValue: e.originalValue,
        suggestion: e.suggestion,
        severity: e.severity,
      })),
    };
  },

  async errorsCsv(id: string): Promise<string> {
    const session = await this.getSession(id);
    const header = "rowNumber,severity,fieldName,message,originalValue,suggestion";
    const lines = session.errors.map((e) =>
      [
        String(e.rowNumber),
        e.severity,
        e.fieldName ?? "",
        e.message,
        e.originalValue ?? "",
        e.suggestion ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
    return [header, ...lines].join("\n");
  },

  async importSession(id: string, actor: AuthUser): Promise<BulkSessionDto> {
    const session = await prisma.bulkUploadSession.findUnique({ where: { id } });
    if (!session) throw new AppError("RESOURCE_NOT_FOUND", "Bulk session not found", 404);
    if (session.status === "imported") {
      return this.getSession(id);
    }
    if (session.status !== "validated") {
      throw new AppError("CONFLICT_DUPLICATE", "Session is not ready for import", 409);
    }
    if (session.validRows === 0) {
      throw new AppError("BULK_VALIDATION_FAILED", "No valid rows to import", 422);
    }

    const records = Array.isArray(session.validRecordsJson)
      ? (session.validRecordsJson as Array<Record<string, unknown>>)
      : [];

    try {
      for (const row of records) {
        const { _rowNumber: _rn, lat, lng, ...rest } = row;
        const created = await propertyService.create(
          {
            title: String(rest.title ?? ""),
            description: rest.description != null ? String(rest.description) : undefined,
            status:
              rest.status === "published" || rest.status === "draft"
                ? rest.status
                : "draft",
            price: String(rest.price ?? "0"),
            propertyType: String(rest.propertyType ?? "Apartment"),
            bedrooms: Number(rest.bedrooms ?? 0),
            bathrooms: Number(rest.bathrooms ?? 0),
            areaSqFt: Number(rest.areaSqFt ?? 0),
            addressLine: String(rest.addressLine ?? ""),
            city: rest.city != null ? String(rest.city) : undefined,
            region: rest.region != null ? String(rest.region) : undefined,
            postalCode: rest.postalCode != null ? String(rest.postalCode) : undefined,
            country: rest.country != null ? String(rest.country) : undefined,
            agentId: rest.agentId != null ? String(rest.agentId) : undefined,
            featured: Boolean(rest.featured ?? false),
          },
          actor,
        );

        if (lat != null || lng != null) {
          await propertyService.update(
            created.id,
            {
              lat: lat != null ? Number(lat) : null,
              lng: lng != null ? Number(lng) : null,
            },
            actor,
          );
        }
      }

      await prisma.bulkUploadSession.update({
        where: { id },
        data: { status: "imported" },
      });
    } catch (err) {
      await prisma.bulkUploadSession.update({
        where: { id },
        data: { status: "failed" },
      });
      throw err;
    }

    return this.getSession(id);
  },
};
