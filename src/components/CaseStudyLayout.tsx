import Link from "next/link";
import { Footer } from "@/components/Footer";
import type { ReactNode } from "react";

type Meta = {
  label: string;
  value: string;
};

export function CaseStudyLayout({
  eyebrow,
  title,
  subtitle,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta: Meta[];
  children: ReactNode;
}) {
  return (
    <>
      <article className="px-4 pb-8 pt-28 md:pt-32">
        <div className="mx-auto max-w-[820px]">
          <Link
            href="/#work"
            className="inline-flex text-sm text-[#8ea79c] transition hover:text-white"
          >
            ← Back to work
          </Link>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,#0f3d32,#0a1f1a)] p-8 md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#b7cdc3]">{subtitle}</p>

            <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 md:grid-cols-4">
              {meta.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#6f8379]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="prose-case mt-10 space-y-12 text-[#c5d4cd]">
            {children}
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}

export function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
          {label}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101714] p-5 text-[#b7cdc3]">
      {children}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: { value: string; label: string; detail: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-[#101714] p-5"
        >
          <p className="text-3xl font-semibold text-[var(--mint)]">
            {item.value}
          </p>
          <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
          <p className="mt-1 text-sm text-[#8ea79c]">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function BeforeAfter({
  before,
  after,
}: {
  before: string[];
  after: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-[#151a18] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e07a7a]">
          V1 · Before
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#b7cdc3]">
          {before.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e07a7a]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#10201a] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mint)]">
          V2 · After
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#b7cdc3]">
          {after.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mint)]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Quote({ quote, translation }: { quote: string; translation: string }) {
  return (
    <blockquote className="rounded-2xl border border-white/10 bg-[#101714] p-5">
      <p className="text-lg italic text-white">“{quote}”</p>
      <p className="mt-2 text-sm text-[#8ea79c]">{translation}</p>
    </blockquote>
  );
}
