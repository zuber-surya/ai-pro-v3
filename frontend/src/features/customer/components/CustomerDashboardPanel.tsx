"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AppError,
  getCustomerDashboard,
  getCustomerProfile,
  listCustomerInquiries,
  listNotifications,
  type CustomerDashboard,
  type CustomerInquiry,
  type CustomerProfile,
  type NotificationItem,
} from "@/lib/api";
import { MediaImage } from "@/components/ui";
import { ErrorState, Loader } from "@/components/states";
import { CustomerShell } from "./CustomerShell";
import { RequirementProfileEditor } from "./RequirementProfileEditor";
import { SavedSearchesPanel } from "./SavedSearchesPanel";

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  if (!Number.isFinite(n)) return `${currency} ${price}`;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${price}`;
  }
}

export function CustomerDashboardPanel() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [dash, setDash] = useState<CustomerDashboard | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, p, i, n] = await Promise.all([
          getCustomerDashboard(),
          getCustomerProfile(),
          listCustomerInquiries({ page: 1, pageSize: 5 }),
          listNotifications({ page: 1, pageSize: 5 }),
        ]);
        if (cancelled) return;
        setDash(d);
        setProfile(p);
        setInquiries(i.data);
        setNotifications(n.data);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof AppError ? err.message : "Could not load dashboard.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <CustomerShell>
        <div className="flex justify-center py-xl">
          <Loader />
        </div>
      </CustomerShell>
    );
  }

  if (status === "error" || !dash || !profile) {
    return (
      <CustomerShell>
        <ErrorState
          title="Dashboard unavailable"
          message={error ?? "Failed to load"}
          onRetry={() => window.location.reload()}
        />
      </CustomerShell>
    );
  }

  return (
    <CustomerShell welcomeName={dash.welcomeName}>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-12">
        <section
          id="saved"
          className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-lg shadow-[0px_2px_4px_rgba(0,0,0,0.05)] md:col-span-8"
        >
          <div className="mb-lg flex items-start justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Saved Properties</h3>
              <p className="font-body-md text-on-surface-variant">
                You have {dash.favoritesCount} properties tracked in your wishlist.
              </p>
            </div>
            <span className="rounded-full bg-primary-container px-4 py-2 font-label-md font-bold text-primary">
              {dash.favoritesCount} Properties
            </span>
          </div>
          {dash.recentProperties.length === 0 ? (
            <p className="font-body-md text-on-surface-variant">
              No favorites yet.{" "}
              <Link href="/search" className="text-primary hover:underline">
                Browse listings
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
              {dash.recentProperties.map((p) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg"
                  >
                    <MediaImage
                      src={p.coverImageUrl}
                      seed={p.id}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-sm">
                      <p className="truncate font-label-sm text-white">{p.title}</p>
                      <p className="font-label-sm text-white/80">
                        {formatPrice(p.price, p.currency)}
                      </p>
                    </div>
                  </Link>
              ))}
            </div>
          )}
        </section>

        <RequirementProfileEditor
          profile={profile}
          onSaved={(next) => setProfile(next)}
        />

        <section
          id="inquiries"
          className="rounded-xl bg-surface-container-lowest p-lg shadow-[0px_2px_4px_rgba(0,0,0,0.05)] md:col-span-7"
        >
          <div className="mb-lg flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md">Recent Inquiries</h3>
            <span className="font-label-md font-bold text-primary">
              {dash.inquiriesCount} total
            </span>
          </div>
          {inquiries.length === 0 ? (
            <p className="font-body-md text-on-surface-variant">
              No inquiries yet. Open a property and tap Inquire.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant">
              {inquiries.map((inq) => (
                <div key={inq.id} className="group flex items-center justify-between py-md">
                  <div className="flex items-center gap-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
                      <span className="material-symbols-outlined" aria-hidden>
                        apartment
                      </span>
                    </div>
                    <div>
                      {inq.propertyId ? (
                        <Link
                          href={`/properties/${inq.propertyId}`}
                          className="font-body-md font-medium text-on-surface transition-colors group-hover:text-primary"
                        >
                          {inq.propertyTitle ?? "Property inquiry"}
                        </Link>
                      ) : (
                        <p className="font-body-md font-medium text-on-surface">
                          {inq.propertyTitle ?? "General inquiry"}
                        </p>
                      )}
                      <p className="font-body-sm text-on-surface-variant">
                        {new Date(inq.createdAt).toLocaleDateString()}
                        {inq.message ? ` · ${inq.message.slice(0, 60)}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-container-high px-sm py-1 font-label-sm font-medium text-on-surface-variant">
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          id="notifications"
          className="rounded-xl bg-surface-container-lowest p-lg shadow-[0px_2px_4px_rgba(0,0,0,0.05)] md:col-span-5"
        >
          <div className="mb-lg flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md">Notifications</h3>
          </div>
          <div className="space-y-md">
            {notifications.length === 0 ? (
              <div className="flex gap-md rounded-xl border border-secondary/20 bg-ai-accent/10 p-md">
                <div className="text-secondary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    aria-hidden
                  >
                    auto_awesome
                  </span>
                </div>
                <div>
                  <p className="font-body-md font-bold text-ai-accent">
                    {dash.savedSearchesCount} saved search
                    {dash.savedSearchesCount === 1 ? "" : "es"} ready
                  </p>
                  <p className="font-body-sm text-ai-accent opacity-80">
                    No new alerts. Use the bell for your in-app feed.
                  </p>
                  <Link
                    href="#saved-searches"
                    className="mt-2 inline-block rounded-lg bg-secondary px-4 py-1.5 font-label-sm font-bold text-on-secondary shadow-sm hover:brightness-110"
                  >
                    Review saved searches
                  </Link>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={[
                    "rounded-xl border px-md py-sm",
                    n.read
                      ? "border-outline-variant bg-surface-container-low"
                      : "border-primary/20 bg-primary/5",
                  ].join(" ")}
                >
                  <p className="font-label-md font-bold text-on-surface">{n.title}</p>
                  {n.body ? (
                    <p className="font-body-sm text-on-surface-variant">{n.body}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <div id="saved-searches" className="md:col-span-12">
          <SavedSearchesPanel />
        </div>
      </div>
    </CustomerShell>
  );
}
