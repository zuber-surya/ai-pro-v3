"use client";

import { useState, type FormEvent } from "react";
import { AppError, analyzeLoan, type AiLoanAnalysisResponse } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatInr } from "./emi";

export function LoanAnalysisModal({
  open,
  onClose,
  propertyPrice,
  defaultDownPayment,
  defaultTenureYears,
  defaultRate,
}: {
  open: boolean;
  onClose: () => void;
  propertyPrice: number;
  defaultDownPayment: number;
  defaultTenureYears: number;
  defaultRate: number;
}) {
  const [downPayment, setDownPayment] = useState(String(Math.round(defaultDownPayment)));
  const [annualIncome, setAnnualIncome] = useState("");
  const [tenureYears, setTenureYears] = useState(String(defaultTenureYears));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiLoanAnalysisResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeLoan({
        propertyPrice,
        downPayment: downPayment.trim() || 0,
        annualIncome: annualIncome.trim() || 0,
        tenureYears: Number(tenureYears) || defaultTenureYears,
        interestRatePct: defaultRate,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Could not run loan analysis.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="AI Loan Analysis"
      onClose={() => !submitting && onClose()}
      footer={
        <Button type="button" variant="ghost" disabled={submitting} onClick={onClose}>
          Close
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="space-y-md">
        <p className="text-body-sm text-on-surface-variant">
          Property price: <strong>{formatInr(propertyPrice)}</strong> · Rate {defaultRate}%
        </p>
        <Input
          label="Down payment (INR)"
          name="downPayment"
          value={downPayment}
          onChange={(e) => setDownPayment(e.target.value)}
          required
        />
        <Input
          label="Annual income (INR)"
          name="annualIncome"
          value={annualIncome}
          onChange={(e) => setAnnualIncome(e.target.value)}
          required
          placeholder="e.g. 2400000"
        />
        <Input
          label="Tenure (years)"
          name="tenureYears"
          value={tenureYears}
          onChange={(e) => setTenureYears(e.target.value)}
        />
        <Button type="submit" variant="ai" disabled={submitting}>
          {submitting ? "Analyzing…" : "Run analysis"}
        </Button>
        {error ? (
          <p className="text-body-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        {result ? (
          <div className="space-y-sm rounded-xl border border-outline-variant bg-surface-container-low p-md">
            {result.mode === "fallback" ? (
              <p className="rounded-lg bg-secondary/10 px-sm py-1 font-label-sm text-secondary" role="status">
                AI unavailable — showing formula estimate
              </p>
            ) : null}
            <p className="font-label-sm uppercase tracking-wider text-on-surface-variant">
              Estimated EMI
            </p>
            <p className="font-headline-md text-primary">
              {formatInr(Number(result.estimatedEmi))}
            </p>
            {result.eligible != null ? (
              <p className="font-label-md text-on-surface">
                {result.eligible ? "Within common affordability guide" : "May stretch affordability"}
              </p>
            ) : null}
            <p className="font-body-sm text-on-surface">{result.analysis}</p>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
