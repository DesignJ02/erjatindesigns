import Link from "next/link";
import type { projects } from "@/lib/content";

type Project = (typeof projects)[number];

const accentMap = {
  green: "bg-[linear-gradient(145deg,#0f3d32,#0a241e)]",
  olive: "bg-[linear-gradient(145deg,#1a2a1f,#121a15)]",
  slate: "bg-[linear-gradient(145deg,#171d1b,#101413)]",
};

const mockMap = {
  green: "from-[#1b5c4a] to-[#0d2f27]",
  olive: "from-[#2a4634] to-[#152219]",
  slate: "from-[#2a3330] to-[#151a18]",
};

export function ProjectCard({ project }: { project: Project }) {
  const CardInner = (
    <article
      className={`group relative grid overflow-hidden rounded-[28px] border border-white/10 ${accentMap[project.accent]} p-6 transition duration-300 hover:border-white/20 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:p-8`}
    >
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#c5d4cd]">
            {project.type}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#c5d4cd]">
            {project.status}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#c5d4cd]">
            {project.duration}
          </span>
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--coral)]">
          {project.shortTitle}
        </p>
        <h3 className="max-w-md text-2xl font-semibold tracking-tight text-white md:text-[1.85rem]">
          {project.title}
        </h3>

        <div className="mt-5 space-y-4 text-sm leading-relaxed md:text-[15px]">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--coral)]">
              Problem
            </p>
            <p className="text-[#b7cdc3]">{project.problem}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--coral)]">
              Impact
            </p>
            <p className="text-[#b7cdc3]">{project.impact}</p>
          </div>
        </div>

        {project.available ? (
          <span className="mt-7 inline-flex rounded-full bg-[#1f8f6a] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#27a87c]">
            View Case Study
          </span>
        ) : (
          <span className="mt-7 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[#9aada4]">
            Coming Soon
          </span>
        )}
      </div>

      <div
        className={`mt-6 flex min-h-[220px] items-center justify-center rounded-[22px] border border-white/10 bg-gradient-to-br ${mockMap[project.accent]} p-6 md:mt-0`}
      >
        <PhoneMock title={project.shortTitle} index={project.index} />
      </div>
    </article>
  );

  if (!project.available) {
    return <div id={project.slug === "datum" ? "datum" : undefined}>{CardInner}</div>;
  }

  return (
    <Link href={project.href} className="block">
      {CardInner}
    </Link>
  );
}

function PhoneMock({ title, index }: { title: string; index: string }) {
  return (
    <div className="relative w-[180px] rounded-[28px] border border-white/15 bg-[#0b1210] p-3 shadow-2xl">
      <div className="mb-3 flex justify-center">
        <div className="h-1.5 w-16 rounded-full bg-white/15" />
      </div>
      <div className="rounded-2xl bg-[#12201b] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#6f8379]">
          Project {index}
        </p>
        <p className="mt-2 text-lg font-semibold text-white">{title}</p>
        <div className="mt-4 space-y-2">
          <div className="h-16 rounded-xl bg-gradient-to-br from-[#3dd6a5]/25 to-transparent" />
          <div className="h-2 w-3/4 rounded bg-white/10" />
          <div className="h-2 w-1/2 rounded bg-white/10" />
          <div className="mt-3 h-8 rounded-full bg-[#3dd6a5]/80" />
        </div>
      </div>
    </div>
  );
}
