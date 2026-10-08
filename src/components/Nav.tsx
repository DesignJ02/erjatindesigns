import Link from "next/link";
import { site } from "@/lib/content";

export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <nav className="pointer-events-auto flex w-full max-w-[720px] items-center justify-between rounded-full border border-white/10 bg-[#0d1411]/92 px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <Link
          href="/"
          className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/#about"
            className="rounded-full px-4 py-2 text-sm text-[#c5d4cd] transition hover:bg-white/5 hover:text-white"
          >
            About Me
          </Link>
          <a
            href={site.resume}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Resume ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
