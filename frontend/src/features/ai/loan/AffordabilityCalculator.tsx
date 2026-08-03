"use client";

import { useMemo, useState } from "react";
import { LoanAnalysisModal } from "./LoanAnalysisModal";
import { computeEmi, formatInr } from "./emi";

export function AffordabilityCalculator({ propertyPrice }: { propertyPrice: number }) {
  const price = Number.isFinite(propertyPrice) && propertyPrice > 0 ? propertyPrice : 0;
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [aiOpen, setAiOpen] = useState(false);

  const downPayment = (price * downPct) / 100;
  const loanAmount = Math.max(0, price - downPayment);
  const emi = useMemo(
    () => computeEmi(loanAmount, rate, tenure),
    [loanAmount, rate, tenure],
  );
  const monthlyInterestApprox = (loanAmount * (rate / 100)) / 12;
  const principalShare = Math.max(0, emi - monthlyInterestApprox);

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container p-lg">
      <h2 className="mb-lg font-headline-md text-headline-md">Affordability Calculator</h2>
      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
        <div className="space-y-lg">
          <div className="space-y-md">
            <div className="flex justify-between font-label-md">
              <span>Down payment ({downPct}%)</span>
              <span className="text-primary">{formatInr(downPayment)}</span>
            </div>
            <input
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-outline-variant"
              type="range"
              min={10}
              max={60}
              step={1}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              aria-label="Down payment percent"
            />
          </div>
          <div className="space-y-md">
            <div className="flex justify-between font-label-md">
              <span>Interest Rate ({rate}%)</span>
              <span className="text-primary">{rate}%</span>
            </div>
            <input
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-outline-variant"
              type="range"
              min={6}
              max={14}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              aria-label="Interest rate"
            />
          </div>
          <div className="space-y-md">
            <div className="flex justify-between font-label-md">
              <span>Tenure ({tenure} Years)</span>
              <span className="text-primary">{tenure} Years</span>
            </div>
            <input
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-outline-variant"
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              aria-label="Loan tenure years"
            />
          </div>
          <p className="font-body-sm text-on-surface-variant">
            Loan amount: {formatInr(loanAmount)}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-white p-lg text-center">
          <div className="mb-xs font-label-sm uppercase tracking-widest text-on-surface-variant">
            Estimated Monthly EMI
          </div>
          <div className="font-display-lg text-display-lg text-primary">{formatInr(emi)}</div>
          <div className="my-lg h-px w-full bg-outline-variant" />
          <div className="grid w-full grid-cols-2 gap-md text-left">
            <div>
              <div className="font-label-sm text-on-surface-variant">Principal (approx)</div>
              <div className="font-body-md font-semibold">{formatInr(principalShare)}</div>
            </div>
            <div>
              <div className="font-label-sm text-on-surface-variant">Interest (approx)</div>
              <div className="font-body-md font-semibold">{formatInr(monthlyInterestApprox)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="mt-lg flex w-full items-center justify-center gap-xs rounded-lg bg-secondary py-md font-label-md text-white"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden
            >
              auto_awesome
            </span>
            Get AI Loan Analysis
          </button>
        </div>
      </div>

      <LoanAnalysisModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        propertyPrice={price}
        defaultDownPayment={downPayment}
        defaultTenureYears={tenure}
        defaultRate={rate}
      />
    </section>
  );
}
