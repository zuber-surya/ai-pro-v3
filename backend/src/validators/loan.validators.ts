import { z } from "zod";

const money = z.union([z.string(), z.number()]).transform((v, ctx) => {
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "must be a non-negative number" });
    return z.NEVER;
  }
  return n;
});

export const aiLoanAnalysisRequestSchema = z
  .object({
    propertyPrice: money,
    downPayment: money,
    annualIncome: money,
    tenureYears: z.coerce.number().int().min(1).max(30).default(20),
    interestRatePct: z.coerce.number().min(0).max(30).default(8.5),
  })
  .superRefine((data, ctx) => {
    if (data.downPayment > data.propertyPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "downPayment cannot exceed propertyPrice",
        path: ["downPayment"],
      });
    }
  });

export type AiLoanAnalysisRequest = z.infer<typeof aiLoanAnalysisRequestSchema>;
