import { apiRequest } from "./client";
import { publicEnv } from "@/lib/config/env";
import { getAccessToken } from "@/lib/auth";
import { AppError, type ApiErrorEnvelope } from "@/types/api";

export type BulkValidateResponse = {
  sessionId: string;
  validCount: number;
  errorCount: number;
};

export type BulkRowIssue = {
  rowNumber: number;
  fieldName: string | null;
  message: string;
  originalValue: string | null;
  suggestion: string | null;
  severity: string;
};

export type BulkSession = {
  id: string;
  status: string;
  validCount: number;
  errorCount: number;
  warningCount: number;
  totalRows: number;
  fileName: string;
  createdAt: string;
  errors: BulkRowIssue[];
};

export function validateBulkProperties(payload: {
  records: Record<string, unknown>[];
  fileName?: string;
  idempotencyKey?: string;
}) {
  return apiRequest<BulkValidateResponse>("/bulk/properties/validate", {
    method: "POST",
    body: payload,
  });
}

export function getBulkSession(id: string) {
  return apiRequest<BulkSession>(`/bulk/properties/sessions/${id}`);
}

export function importBulkSession(id: string) {
  return apiRequest<BulkSession>(`/bulk/properties/sessions/${id}/import`, {
    method: "POST",
  });
}

export async function downloadBulkErrorsCsv(id: string): Promise<Blob> {
  const token = getAccessToken();
  const res = await fetch(
    `${publicEnv.apiBaseUrl}/bulk/properties/sessions/${id}/errors.csv`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!res.ok) {
    let code = "INTERNAL_ERROR";
    let message = res.statusText;
    let details: AppError["details"] = [];
    try {
      const data = (await res.json()) as ApiErrorEnvelope;
      code = data.error?.code ?? code;
      message = data.error?.message ?? message;
      details = data.error?.details ?? [];
    } catch {
      /* ignore */
    }
    throw new AppError(code, message, res.status, details);
  }
  return res.blob();
}

/** Minimal CSV parser (quoted fields supported). */
export function parseCsvToRecords(text: string): Record<string, unknown>[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((c) => c.trim() !== "")).map((cols) => {
    const record: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      if (!h) return;
      record[h] = cols[i]?.trim() ?? "";
    });
    return record;
  });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
