"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoutButton } from "@/features/auth";
import { NotificationsBell } from "@/features/notifications";

const NAV = [
  { href: "/customer", label: "Dashboard", icon: "dashboard", hash: "" },
  { href: "/customer#saved", label: "Saved Properties", icon: "favorite", hash: "saved" },
  {
    href: "/customer#requirements",
    label: "Requirement Profile",
    icon: "person_search",
    hash: "requirements",
  },
  { href: "/customer#inquiries", label: "Inquiry History", icon: "history", hash: "inquiries" },
  {
    href: "/customer#notifications",
    label: "Notification Preferences",
    icon: "notifications",
    hash: "notifications",
  },
] as const;

export function CustomerShell({
  children,
  welcomeName,
}: {
  children: ReactNode;
  welcomeName?: string;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-on-surface">
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-outline-variant bg-surface py-xl transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-xl flex items-start justify-between gap-sm px-lg">
          <div>
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
              PropVista CRM
            </Link>
            <p className="font-label-sm text-on-surface-variant">Customer Portal</p>
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
        <nav className="flex-1 space-y-1" aria-label="Customer">
          {NAV.map((item) => {
            const active = pathname === "/customer" && item.href === "/customer" && !item.hash;
            const base =
              "flex items-center gap-3 px-4 py-3 font-label-md transition-colors duration-200";
            const activeCls =
              "border-r-4 border-primary bg-surface-container-high font-bold text-primary scale-[0.98]";
            const idleCls =
              "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={`${base} ${item.href === "/customer" && !item.hash ? (pathname === "/customer" ? activeCls : idleCls) : idleCls}`}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active ? null : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-sm px-lg">
          <Link
            href="/search"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-on-primary shadow-md hover:opacity-90"
          >
            <span className="material-symbols-outlined" aria-hidden>
              add
            </span>
            New Inquiry
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-md bg-surface-container-lowest px-md shadow-sm lg:px-lg">
          <div className="flex min-w-0 items-center gap-md">
            <button
              type="button"
              className="rounded-lg p-sm text-on-surface-variant hover:bg-surface-container-high lg:hidden"
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                menu
              </span>
            </button>
            <h2 className="truncate font-headline-md text-headline-md font-bold text-primary">
              Welcome back{welcomeName ? `, ${welcomeName}` : ""}
            </h2>
          </div>
          <div className="flex items-center gap-md lg:gap-lg">
            <NotificationsBell />
            <Link
              href="/#contact"
              className="hidden rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-high sm:inline-flex"
              aria-label="Help"
            >
              <span className="material-symbols-outlined" aria-hidden>
                help
              </span>
            </Link>
            <Link
              href="/customer#requirements"
              className="hidden rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-high sm:inline-flex"
              aria-label="Settings"
            >
              <span className="material-symbols-outlined" aria-hidden>
                settings
              </span>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container font-label-md text-primary">
              {(welcomeName || "C").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl space-y-lg p-md lg:p-lg">{children}</div>
      </div>
    </div>
  );
}
