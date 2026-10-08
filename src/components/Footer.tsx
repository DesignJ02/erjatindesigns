import { CopyEmail } from "@/components/CopyEmail";
import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer id="contact" className="px-4 pb-16 pt-8">
      <div className="mx-auto max-w-[920px] overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,#0f3d32,#0a1f1a)] px-6 py-12 md:px-12">
        <p className="text-sm uppercase tracking-[0.18em] text-[#8ea79c]">
          Contact
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Let&apos;s shape the next experience together.
        </h2>
        <p className="mt-4 max-w-xl text-[#b7cdc3]">
          Have feedback on a case study, or looking for a designer who ships with
          PMs and engineers? I&apos;d love to hear from you.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a1f18] transition hover:bg-[#e8fff6]"
          >
            {site.email}
          </a>
          <CopyEmail email={site.email} />
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-[920px] text-center text-xs text-[#5f7268]">
        © {new Date().getFullYear()} {site.name}. Designed & built as a portfolio.
      </p>
    </footer>
  );
}
