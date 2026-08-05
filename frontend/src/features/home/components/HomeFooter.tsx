import Link from "next/link";

export function HomeFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-surface-container-highest">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-lg px-xl py-xl md:grid-cols-4">
        <div>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            PropVista CRM
          </span>
          <p className="font-body-sm mt-md text-on-surface-variant">
            The future of real estate is intelligent. We leverage advanced AI to connect the right
            people with the right properties.
          </p>
        </div>
        <div className="space-y-sm">
          <h4 className="font-label-md uppercase tracking-wider text-on-surface">Company</h4>
          <ul className="space-y-xs">
            <li>
              <Link
                href="/search"
                className="font-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
              >
                About Us
              </Link>
            </li>
            <li>
              <span className="font-body-sm text-on-surface-variant">Careers</span>
            </li>
            <li>
              <span className="font-body-sm text-on-surface-variant">Press</span>
            </li>
            <li>
              <Link
                href="/#contact"
                className="font-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Contact Support
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-sm">
          <h4 className="font-label-md uppercase tracking-wider text-on-surface">Resources</h4>
          <ul className="space-y-xs">
            <li>
              <Link
                href="/search"
                className="font-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Blog
              </Link>
            </li>
            <li>
              <span className="font-body-sm text-on-surface-variant">Market Trends</span>
            </li>
            <li>
              <span className="font-body-sm text-on-surface-variant">Pro Guides</span>
            </li>
            <li>
              <span className="font-body-sm text-on-surface-variant">Accessibility</span>
            </li>
          </ul>
        </div>
        <div className="space-y-sm">
          <h4 className="font-label-md uppercase tracking-wider text-on-surface">Legal</h4>
          <ul className="space-y-xs">
            <li>
              <Link
                href="/pages/privacy"
                className="font-body-sm text-on-surface-variant underline transition-colors hover:text-on-surface"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/pages/terms"
                className="font-body-sm text-on-surface-variant underline transition-colors hover:text-on-surface"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/pages/privacy"
                className="font-body-sm text-on-surface-variant underline transition-colors hover:text-on-surface"
              >
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-container-max border-t border-outline-variant/30 px-xl py-lg text-center">
        <p className="font-body-sm text-on-surface-variant opacity-70">
          © {year} PropVista CRM. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
