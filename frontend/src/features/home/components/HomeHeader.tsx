import Link from "next/link";
import { HomeAuthCtas } from "./HomeAuthCtas";

export function HomeHeader() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-xl">
        <div className="flex items-center gap-lg">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            PropVista CRM
          </Link>
          <div className="hidden gap-md md:flex" aria-label="Primary">
            <Link
              href="/search?q=buy"
              className="cursor-pointer border-b-2 border-primary pb-1 font-body-md text-body-md font-bold text-primary"
            >
              Buy
            </Link>
            <Link
              href="/search?q=rent"
              className="cursor-pointer font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              Rent
            </Link>
            <Link
              href="/search"
              className="cursor-pointer font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              Agents
            </Link>
            <Link
              href="/search"
              className="cursor-pointer font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              About
            </Link>
          </div>
        </div>
        <HomeAuthCtas />
      </div>
    </nav>
  );
}
