"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";
import { NotificationsBell } from "@/features/notifications";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/properties", label: "Properties", icon: "home_work" },
  { href: "/admin/leads", label: "Leads", icon: "person_search" },
  { href: "/admin/agents", label: "Agents", icon: "badge" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/ai-config", label: "AI Configuration", icon: "psychology" },
  { href: "/admin/cms", label: "CMS", icon: "rebase_edit" },
  { href: "/admin/reports", label: "Reports", icon: "bar_chart" },
  {
    href: "/admin/notification-rules",
    label: "Notification Rules",
    icon: "notifications_active",
  },
] as const;

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** SCR-CMD admin chrome — sidebar + top search bar (drawer below lg) */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const user = getCurrentUser();
  const displayName = user?.fullName?.trim() || user?.email || "Admin";
  const roleLabel =
    user?.role === "super_admin"
      ? "Super Admin"
      : user?.role === "agent"
        ? "Agent"
        : "Admin";

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  function onAdminSearch(e: FormEvent) {
    e.preventDefault();
    const q = adminQuery.trim();
    if (!q) return;
    router.push(`/properties?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant bg-surface-container-lowest px-md py-lg transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-md flex items-start justify-between gap-sm px-sm">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              PropVista CRM
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
              Premium Admin Panel
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-sm text-on-surface-variant hover:bg-surface-container-high lg:hidden"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-xs"
          aria-label="Admin"
        >
          {NAV.map((item) => {
            const active = navActive(pathname, item.href, "exact" in item && item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md rounded-lg px-md py-1.5 font-label-md text-label-md transition-all duration-150 ease-in-out ${
                  active
                    ? "scale-95 bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    item.icon === "psychology" && !active ? "text-secondary" : ""
                  }`}
                  aria-hidden
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 space-y-sm border-t border-outline-variant px-sm pt-md">
          <Link
            href="/properties"
            className="flex w-full items-center justify-center gap-xs rounded-xl bg-primary px-lg py-sm font-label-md text-label-md text-on-primary shadow-sm transition-all hover:opacity-90"
          >
            <span className="material-symbols-outlined" aria-hidden>
              add
            </span>
            New Listing
          </Link>
          <div className="flex items-center gap-md rounded-lg px-sm py-sm">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest">
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden>
                account_circle
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-label-md text-label-md text-on-surface">
                {displayName}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{roleLabel}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-md border-b border-outline-variant bg-surface/80 px-md shadow-sm backdrop-blur-md lg:px-xl">
          <div className="flex min-w-0 flex-1 items-center gap-md">
            <button
              type="button"
              className="rounded-lg p-sm text-on-surface-variant hover:bg-surface-container-low lg:hidden"
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                menu
              </span>
            </button>
            <form className="relative w-full max-w-md" onSubmit={onAdminSearch}>
              <span
                className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
                aria-hidden
              >
                search
              </span>
              <input
                className="w-full rounded-full border border-outline-variant bg-surface-container-low py-2 pr-4 pl-10 font-body-sm text-body-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                placeholder="Search leads, properties, or tasks..."
                type="search"
                aria-label="Search leads, properties, or tasks"
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
              />
            </form>
          </div>
          <div className="flex shrink-0 items-center gap-md">
            <NotificationsBell />
            <Link
              href="/pages/privacy"
              className="hidden rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-low sm:inline-flex"
              aria-label="Help"
              title="Help"
            >
              <span className="material-symbols-outlined" aria-hidden>
                help
              </span>
            </Link>
            <div className="mx-2 hidden h-8 w-px bg-outline-variant sm:block" />
            <span
              className="material-symbols-outlined text-[32px] text-on-surface-variant"
              aria-hidden
            >
              account_circle
            </span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
