import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { getGeminiClient } from "../integrations/gemini/gemini.client.js";
import type { AiLoanAnalysisRequest } from "../validators/loan.validators.js";

const geminiLoanSchema = z.object({
  analysis: z.string().min(1),
  eligible: z.boolean().optional(),
});

/** Standard reducing-balance EMI. Exported for unit tests. */
export function computeEmi(
  principal: number,
  annualRatePct: number,
  tenureYears: number,
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  const n = tenureYears * 12;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / n;
  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

function moneyString(n: number): string {
  return n.toFixed(2);
}

function formulaAnalysis(input: {
  loanAmount: number;
  emi: number;
  monthlyIncome: number;
  tenureYears: number;
  interestRatePct: number;
  eligible: boolean;
}): string {
  const ratio = input.monthlyIncome > 0 ? (input.emi / input.monthlyIncome) * 100 : 0;
  const eligibility = input.eligible
    ? "Estimated EMI is within a common 40% of monthly income guideline."
    : "Estimated EMI exceeds a common 40% of monthly income guideline — consider a larger down payment or longer tenure.";
  return [
    `Formula estimate (fallback): loan ₹${moneyString(input.loanAmount)} at ${input.interestRatePct}% for ${input.tenureYears} years.`,
    `EMI ≈ ₹${moneyString(input.emi)} (~${ratio.toFixed(1)}% of monthly income).`,
    eligibility,
    "Informational only; not a loan offer. Confirm with a lender.",
  ].join(" ");
}

export const loanService = {
  async analyze(input: AiLoanAnalysisRequest) {
    const loanAmount = Math.max(0, input.propertyPrice - input.downPayment);
    const emi = computeEmi(loanAmount, input.interestRatePct, input.tenureYears);
    const monthlyIncome = input.annualIncome / 12;
    const eligible = monthlyIncome > 0 ? emi <= monthlyIncome * 0.4 : false;
    const estimatedEmi = moneyString(emi);

    const formula = {
      provider: "gemini" as const,
      analysis: formulaAnalysis({
        loanAmount,
        emi,
        monthlyIncome,
        tenureYears: input.tenureYears,
        interestRatePct: input.interestRatePct,
        eligible,
      }),
      estimatedEmi,
      loanAmount: moneyString(loanAmount),
      eligible,
      mode: "fallback" as const,
      interestRatePct: input.interestRatePct,
      tenureYears: input.tenureYears,
    };

    try {
      const raw = await getGeminiClient().generateJson<unknown>({
        timeoutMs: env.AI_CHAT_TIMEOUT_MS,
        system: `You are PropVista CRM's loan affordability assistant for India.
Return ONLY JSON: {"analysis": string, "eligible": boolean}.
analysis: 2-4 short sentences on affordability given the numbers. No invented lender offers.
eligible: whether EMI is reasonable vs income (roughly EMI <= 40% of monthly income).
Never mention non-Gemini providers.`,
        prompt: JSON.stringify({
          propertyPrice: input.propertyPrice,
          downPayment: input.downPayment,
          loanAmount,
          annualIncome: input.annualIncome,
          monthlyIncome,
          tenureYears: input.tenureYears,
          interestRatePct: input.interestRatePct,
          estimatedEmi: emi,
          formulaEligible: eligible,
        }),
      });

      const parsed = geminiLoanSchema.safeParse(raw);
      if (!parsed.success) {
        return formula;
      }

      return {
        provider: "gemini" as const,
        analysis: `${parsed.data.analysis} Informational only; not a loan offer.`,
        estimatedEmi,
        loanAmount: moneyString(loanAmount),
        eligible: parsed.data.eligible ?? eligible,
        mode: "ai" as const,
        interestRatePct: input.interestRatePct,
        tenureYears: input.tenureYears,
      };
    } catch (err) {
      if (
        err instanceof AppError &&
        (err.code === "AI_UNAVAILABLE" || err.code === "AI_TIMEOUT")
      ) {
        return formula;
      }
      return formula;
    }
  },
};
