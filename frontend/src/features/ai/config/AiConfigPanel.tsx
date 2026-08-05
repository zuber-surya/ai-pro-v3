"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { ErrorState, Loader } from "@/components/states";
import {
  AppError,
  getAiConfig,
  previewAiConfig,
  updateAiConfig,
  type AiConfig,
  type AiFaq,
} from "@/lib/api";

type Device = "phone" | "desktop" | "tablet";
type Tone = "friendly" | "professional" | "concise";

export function AiConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const [greeting, setGreeting] = useState("");
  const [faqs, setFaqs] = useState<AiFaq[]>([]);
  const [threshold, setThreshold] = useState(3);
  const [onHumanRequest, setOnHumanRequest] = useState(true);
  const [tone, setTone] = useState<Tone>("friendly");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelLabel, setModelLabel] = useState("gemini");

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqEditIndex, setFaqEditIndex] = useState<number | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [faqError, setFaqError] = useState<string | null>(null);

  const [device, setDevice] = useState<Device>("desktop");
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [previewMessages, setPreviewMessages] = useState<{ role: "user" | "assistant"; text: string }[]>(
    [],
  );
  const [previewSending, setPreviewSending] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const applyConfig = useCallback((cfg: AiConfig) => {
    setGreeting(cfg.greeting);
    setFaqs(cfg.faqs);
    setThreshold(cfg.escalation.failedResponseThreshold);
    setOnHumanRequest(cfg.escalation.onExplicitHumanRequest);
    setTone((cfg.tone as Tone) || "friendly");
    setSystemPrompt(cfg.systemPrompt ?? "");
    setModelLabel(cfg.modelLabel || "gemini");
    setPreviewMessages([{ role: "assistant", text: cfg.greeting }]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      applyConfig(await getAiConfig());
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to load AI config");
    } finally {
      setLoading(false);
    }
  }, [applyConfig]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function openAddFaq() {
    setFaqEditIndex(null);
    setFaqQ("");
    setFaqA("");
    setFaqError(null);
    setFaqModalOpen(true);
  }

  function openEditFaq(index: number) {
    const item = faqs[index];
    if (!item) return;
    setFaqEditIndex(index);
    setFaqQ(item.q);
    setFaqA(item.a);
    setFaqError(null);
    setFaqModalOpen(true);
  }

  function saveFaq(e: FormEvent) {
    e.preventDefault();
    const q = faqQ.trim();
    const a = faqA.trim();
    if (!q || !a) {
      setFaqError("Question and answer are required");
      return;
    }
    setFaqs((prev) => {
      const next = [...prev];
      if (faqEditIndex == null) next.push({ q, a });
      else next[faqEditIndex] = { q, a };
      return next;
    });
    setFaqModalOpen(false);
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave() {
    if (!greeting.trim()) {
      setError("Greeting is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await updateAiConfig({
        greeting: greeting.trim(),
        faqs,
        escalation: {
          failedResponseThreshold: threshold,
          onExplicitHumanRequest: onHumanRequest,
        },
        tone,
        systemPrompt: systemPrompt.trim() || undefined,
        modelLabel,
        provider: "gemini",
      });
      applyConfig(saved);
      setToast(true);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to save AI config");
    } finally {
      setSaving(false);
    }
  }

  async function onPreviewSend(e: FormEvent) {
    e.preventDefault();
    const prompt = previewPrompt.trim();
    if (!prompt || previewSending) return;
    setPreviewSending(true);
    setPreviewError(null);
    setPreviewMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setPreviewPrompt("");
    try {
      const res = await previewAiConfig(prompt, {
        greeting: greeting.trim(),
        faqs,
        tone,
        systemPrompt: systemPrompt.trim() || undefined,
      });
      setPreviewMessages((prev) => [...prev, { role: "assistant", text: res.output }]);
    } catch (err) {
      setPreviewError(err instanceof AppError ? err.message : "Preview failed");
    } finally {
      setPreviewSending(false);
    }
  }

  if (loading) {
    return (
      <div className="py-xl">
        <Loader label="Loading AI configuration…" />
      </div>
    );
  }

  if (error && !greeting) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  const previewWidth =
    device === "phone" ? "max-w-[280px]" : device === "tablet" ? "max-w-[360px]" : "max-w-full";

  return (
    <div className="relative flex flex-col gap-xl lg:flex-row">
      <div className="max-w-3xl flex-1 space-y-xl">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              AI Chatbot Configuration
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Train and customize your property concierge assistant.
            </p>
          </div>
          <Button type="button" variant="primary" disabled={saving} onClick={() => void onSave()}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        {error ? (
          <p className="rounded-lg bg-error-container px-md py-sm text-body-sm text-on-error-container" role="alert">
            {error}
          </p>
        ) : null}

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-1)]">
          <div className="mb-md flex items-center gap-md">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden
              >
                waving_hand
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md">Greeting</h2>
          </div>
          <label className="mb-2 block font-label-sm text-on-surface-variant" htmlFor="ai-greeting">
            Welcome Message
          </label>
          <textarea
            id="ai-greeting"
            className="h-32 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-md text-body-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            value={greeting}
            onChange={(e) => {
              setGreeting(e.target.value);
              setPreviewMessages((prev) => {
                if (prev.length === 1 && prev[0]?.role === "assistant") {
                  return [{ role: "assistant", text: e.target.value || "Enter a welcome message…" }];
                }
                return prev;
              });
            }}
            placeholder="Enter the initial message users see…"
          />
          <p className="mt-2 text-body-sm text-on-surface-variant">
            This message triggers automatically when the widget is opened.
          </p>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-1)]">
          <div className="mb-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <div className="rounded-lg bg-secondary/10 p-2">
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden
                >
                  library_books
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md">FAQ Library</h2>
            </div>
            <button
              type="button"
              onClick={openAddFaq}
              className="flex items-center gap-2 rounded-lg px-md py-2 font-label-md font-bold text-primary hover:bg-primary/5"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                add
              </span>
              Add FAQ
            </button>
          </div>
          {faqs.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No FAQs yet. Add common questions.</p>
          ) : (
            <div className="space-y-md">
              {faqs.map((faq, index) => (
                <div
                  key={`${faq.q}-${index}`}
                  className="flex items-start justify-between gap-md rounded-lg border border-outline-variant bg-surface-container-low p-md"
                >
                  <div className="space-y-1">
                    <p className="font-label-md font-bold text-on-surface">Q: {faq.q}</p>
                    <p className="text-body-sm text-on-surface-variant">A: {faq.a}</p>
                  </div>
                  <div className="flex gap-xs">
                    <button
                      type="button"
                      className="text-outline hover:text-primary"
                      aria-label={`Edit FAQ ${index + 1}`}
                      onClick={() => openEditFaq(index)}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      className="text-outline hover:text-error"
                      aria-label={`Delete FAQ ${index + 1}`}
                      onClick={() => removeFaq(index)}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-1)]">
          <div className="mb-md flex items-center gap-md">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden
              >
                priority_high
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md">Escalation Rules</h2>
          </div>
          <div className="space-y-lg">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div className="space-y-1">
                <p className="font-label-md font-bold text-on-surface">Auto-Escalation Threshold</p>
                <p className="text-body-sm text-on-surface-variant">
                  Number of unrecognized inputs before human handoff.
                </p>
              </div>
              <div className="flex items-center gap-md">
                <span className="text-body-sm text-on-surface-variant">Escalate after</span>
                <input
                  className="h-10 w-16 rounded-lg border border-outline-variant text-center text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  type="number"
                  min={1}
                  max={20}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value) || 1)}
                  aria-label="Escalation threshold"
                />
                <span className="text-body-sm text-on-surface-variant">failed responses</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-md border-t border-outline-variant pt-md">
              <div className="space-y-1">
                <p className="font-label-md font-bold text-on-surface">
                  Escalate on explicit human request
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Triggers when user says &quot;Agent&quot;, &quot;Help&quot;, or &quot;Human&quot;.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-sm">
                <span className="sr-only">Escalate on human request</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={onHumanRequest}
                  onChange={(e) => setOnHumanRequest(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--pv-shadow-level-1)]">
          <div className="mb-md flex items-center gap-md">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden
              >
                tune
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md">Tone &amp; Prompts</h2>
          </div>
          <div className="space-y-md">
            <label className="flex flex-col gap-xs">
              <span className="font-label-md text-on-surface">Tone</span>
              <select
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="concise">Concise</option>
              </select>
            </label>
            <label className="flex flex-col gap-xs">
              <span className="font-label-md text-on-surface">Model</span>
              <select
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={modelLabel}
                onChange={(e) => setModelLabel(e.target.value)}
              >
                <option value="gemini">Gemini</option>
              </select>
              <span className="text-body-sm text-on-surface-variant">Gemini only — no provider switch.</span>
            </label>
            <label className="flex flex-col gap-xs">
              <span className="font-label-md text-on-surface">System prompt</span>
              <textarea
                className="h-28 w-full rounded-lg border border-outline-variant p-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="w-full shrink-0 lg:sticky lg:top-xl lg:w-96 lg:self-start">
        <div className="relative flex h-[calc(100vh-10rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-lg">
          <div className="absolute left-0 top-0 h-1 w-full bg-secondary" />
          <div className="mb-lg flex items-center justify-between">
            <h2 className="font-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Live Preview
            </h2>
            <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
              Active
            </span>
          </div>

          <div
            className={`mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-xl ${previewWidth}`}
          >
            <div className="flex items-center gap-md bg-primary p-md text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden
                >
                  psychology
                </span>
              </div>
              <div>
                <p className="font-label-md font-bold">PropVista AI</p>
                <p className="text-[10px] opacity-80">Always Online</p>
              </div>
              <button
                type="button"
                className="ml-auto opacity-60 hover:opacity-100"
                aria-label="Reset preview chat"
                onClick={() => {
                  setPreviewMessages([{ role: "assistant", text: greeting || "Hello!" }]);
                  setPreviewPrompt("");
                  setPreviewError(null);
                }}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
              </button>
            </div>
            <div className="flex-1 space-y-md overflow-y-auto bg-[#F9FAFB] p-md">
              {previewMessages.map((m, i) =>
                m.role === "assistant" ? (
                  <div key={i} className="flex gap-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span
                        className="material-symbols-outlined text-[16px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden
                      >
                        psychology
                      </span>
                    </div>
                    <div className="rounded-xl rounded-tl-none border border-outline-variant bg-white p-md shadow-sm">
                      <p className="text-body-sm leading-relaxed text-on-surface">{m.text}</p>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl rounded-tr-none bg-primary px-md py-sm text-body-sm text-on-primary">
                      {m.text}
                    </div>
                  </div>
                ),
              )}
              {previewSending ? (
                <div className="ml-10 flex items-center gap-1" aria-label="Assistant typing">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-outline-variant" />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-outline-variant"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-outline-variant"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              ) : null}
            </div>
            <form onSubmit={onPreviewSend} className="flex items-center gap-sm border-t border-outline-variant p-md">
              <input
                className="flex-1 rounded-full border-none bg-surface-container-low px-4 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your message…"
                value={previewPrompt}
                onChange={(e) => setPreviewPrompt(e.target.value)}
                disabled={previewSending}
              />
              <button
                type="submit"
                disabled={previewSending || !previewPrompt.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
                aria-label="Send preview message"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  send
                </span>
              </button>
            </form>
            {previewError ? (
              <p className="px-md pb-sm text-body-sm text-error" role="alert">
                {previewError}
              </p>
            ) : null}
          </div>

          <div className="mt-lg flex justify-center gap-md">
            {(
              [
                ["phone", "smartphone"],
                ["desktop", "desktop_windows"],
                ["tablet", "tablet_mac"],
              ] as const
            ).map(([id, icon]) => (
              <button
                key={id}
                type="button"
                aria-label={`${id} preview`}
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full border shadow-[var(--pv-shadow-level-1)]",
                  device === id
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-white text-on-surface-variant hover:text-primary",
                ].join(" ")}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  {icon}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <Modal
        open={faqModalOpen}
        title={faqEditIndex == null ? "Add FAQ" : "Edit FAQ"}
        onClose={() => setFaqModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setFaqModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="ai-faq-form" variant="primary">
              Save FAQ
            </Button>
          </>
        }
      >
        <form id="ai-faq-form" onSubmit={saveFaq} className="space-y-md">
          <Input label="Question" name="faqQ" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} required />
          <label className="flex w-full flex-col gap-xs">
            <span className="font-label-md text-label-md text-on-surface">Answer</span>
            <textarea
              name="faqA"
              className="min-h-24 w-full rounded-[var(--pv-radius-control)] border border-border-subtle bg-surface-container-lowest px-md py-sm text-body-md focus:border-2 focus:border-primary focus:outline-none"
              value={faqA}
              onChange={(e) => setFaqA(e.target.value)}
              required
            />
          </label>
          {faqError ? (
            <p className="text-body-sm text-error" role="alert">
              {faqError}
            </p>
          ) : null}
        </form>
      </Modal>

      {toast ? (
        <div
          className="fixed bottom-lg right-lg z-[100] flex items-center gap-md rounded-lg bg-inverse-surface px-lg py-md text-inverse-on-surface shadow-2xl"
          role="status"
        >
          <span className="material-symbols-outlined text-[#4CAF50]" aria-hidden>
            check_circle
          </span>
          <div>
            <p className="font-label-md font-bold">Settings saved</p>
            <p className="text-body-sm opacity-80">Changes are live for new conversations.</p>
          </div>
          <button type="button" className="ml-xl hover:opacity-60" aria-label="Dismiss" onClick={() => setToast(false)}>
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
