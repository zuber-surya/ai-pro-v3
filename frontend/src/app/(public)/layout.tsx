import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 lg:pb-0">
      <header className="sticky top-0 z-50 w-full bg-surface shadow-sm">
        <div className="mx-auto flex max-w-container-max items-center justify-between px-lg py-md">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            PropVista CRM
          </Link>
          <nav className="hidden gap-lg md:flex" aria-label="Primary">
            <Link
              href="/search"
              className="border-b-2 border-primary pb-1 font-body-md text-body-md text-primary"
            >
              Properties
            </Link>
            <Link
              href="/search"
              className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              Search
            </Link>
          </nav>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-md py-xs font-label-md text-on-primary hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </header>
      {children}
      <footer className="mt-xl w-full border-t border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-md px-lg py-xl md:flex-row">
          <div className="flex flex-col gap-xs">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              PropVista CRM
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} PropVista CRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
