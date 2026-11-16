import { Link } from "react-router-dom";
import { Tango } from "./Tango";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-page px-6 py-12 md:px-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <Tango className="h-10 w-10" />
            <span className="font-heading text-[28px] leading-none tracking-[-0.01em]">
              Landed<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="mt-4 text-muted">Import-cost intelligence for independent fashion brands.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm md:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted">
            <Link to="/calculator" className="hover:text-primary">
              Calculator
            </Link>
            <Link to="/compare" className="hover:text-primary">
              Compare
            </Link>
            <Link to="/rates" className="hover:text-primary">
              Rate table
            </Link>
            <Link to="/sources" className="hover:text-primary">
              Sources
            </Link>
            <a href="#waitlist" className="hover:text-primary">
              Join the waitlist
            </a>
          </div>
          <a href="mailto:hello@example.com" className="inline-flex min-h-12 items-center hover:text-primary">
            hello@example.com
          </a>
          <p className="mono-label">Estimates as of 15 Nov 2026. Not customs advice.</p>
          <p className="mono-label">© 2026 Landed. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
