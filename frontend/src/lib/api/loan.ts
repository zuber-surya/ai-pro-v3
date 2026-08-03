import { apiRequest } from "./client";

export type AiLoanAnalysisRequest = {
  propertyPrice: string | number;
  downPayment: string | number;
  annualIncome: string | number;
  tenureYears?: number;
  interestRatePct?: number;
};

export type AiLoanAnalysisResponse = {
  provider: "gemini";
  analysis: string;
  estimatedEmi: string;
  loanAmount?: string;
  eligible?: boolean;
  mode?: "ai" | "fallback";
  interestRatePct?: number;
  tenureYears?: number;
};

export function analyzeLoan(payload: AiLoanAnalysisRequest) {
  return apiRequest<AiLoanAnalysisResponse>("/ai/loan-analysis", {
    method: "POST",
    body: payload,
  });
}
