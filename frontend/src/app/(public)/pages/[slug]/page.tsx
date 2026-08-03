"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppError, getPublishedPage, type CmsPage } from "@/lib/api";
import { Loader } from "@/components/states";

export default function PublicCmsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [page, setPage] = useState<CmsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    getPublishedPage(slug)
      .then((p) => {
        if (!cancelled) {
          setPage(p);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPage(null);
          setError(err instanceof AppError ? err.message : "Page not found");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const html =
    page?.sections && typeof page.sections.html === "string"
      ? (page.sections.html as string)
      : null;

  return (
    <main className="mx-auto max-w-3xl px-md py-xl md:px-xl">
      <Link href="/" className="font-label-md text-primary hover:underline">
        ← Home
      </Link>
      {loading ? (
        <div className="py-xl">
          <Loader label="Loading page…" />
        </div>
      ) : error || !page ? (
        <p className="mt-lg text-body-md text-error" role="alert">
          {error ?? "Page not found"}
        </p>
      ) : (
        <article className="mt-lg space-y-md">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{page.title}</h1>
          {html ? (
            <div
              className="prose max-w-none text-body-md text-on-surface"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="overflow-auto rounded-lg bg-surface-container p-md text-body-sm">
              {JSON.stringify(page.sections, null, 2)}
            </pre>
          )}
        </article>
      )}
    </main>
  );
}
