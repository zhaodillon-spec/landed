import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import { Tango } from "./Tango";

const links = [
  { href: "/#problem", label: "Why it matters" },
  { href: "/calculator", label: "Calculator" },
  { href: "/compare", label: "Compare" },
  { href: "/rates", label: "Rate table" },
  { href: "/sources", label: "Sources" },
];

function NavLinks({ className }: { className?: string }) {
  const { pathname } = useLocation();
  return (
    <nav className={className}>
      {links.map((link) => {
        const active = link.href.startsWith("/") && pathname === link.href;
        return (
          <Link
            key={link.href}
            to={link.href}
            className={cn("transition-colors hover:text-ink", active ? "text-ink" : "text-muted")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-4 px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <Tango className="h-10 w-10" />
          <span className="font-heading text-[28px] leading-none tracking-[-0.01em]">
            Landed<span className="text-primary">.</span>
          </span>
        </Link>
        <NavLinks className="hidden items-center gap-8 text-sm md:flex" />
        <a
          href="#waitlist"
          className="inline-flex h-12 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          Join the waitlist
        </a>
      </div>
      <NavLinks className="flex gap-5 overflow-x-auto whitespace-nowrap px-6 pb-3 text-sm md:hidden [&>a]:shrink-0" />
    </header>
  );
}
