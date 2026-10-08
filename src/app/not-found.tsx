import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 | Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-page-grid absolute inset-0 opacity-40" />
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </div>

      <div className="fade-up text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
          Error
        </p>
        <h1 className="mt-3 text-[7rem] font-semibold leading-none tracking-tight text-white md:text-[11rem]">
          404
        </h1>
        <p className="mt-4 text-xl font-medium text-white">Page not found.</p>
        <p className="mx-auto mt-2 max-w-md text-[#9aada4]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a1f18] transition hover:bg-[#e8fff6]"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
