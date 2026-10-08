import { skills } from "@/lib/content";

export function Marquee() {
  const items = [...skills, ...skills];

  return (
    <section className="relative overflow-hidden border-y border-white/5 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />
      <div className="marquee-track flex w-max gap-3">
        {items.map((skill, i) => (
          <div
            key={`${skill.name}-${i}`}
            className="flex items-center gap-2 rounded-full border border-white/8 bg-[#101714] px-4 py-2 text-sm whitespace-nowrap"
          >
            <span className="font-medium text-white">{skill.name}</span>
            <span className="text-[11px] uppercase tracking-wide text-[#6f8379]">
              {skill.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
