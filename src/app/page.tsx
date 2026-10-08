import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { ProjectCard } from "@/components/ProjectCard";
import { nowItems, projects, site } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />

      <section id="work" className="px-4 py-20">
        <div className="mx-auto max-w-[920px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
            Selected work · Recent
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Three problems, solved one layer below the brief.
          </h2>
          <p className="mt-3 max-w-xl text-[#9aada4]">
            One shipped and measured in the field. One redesigned through a
            business pivot. One design system unlocking soon.
          </p>

          <div className="mt-10 space-y-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-16">
        <div className="mx-auto grid max-w-[920px] gap-8 rounded-[28px] border border-white/10 bg-[#0d1411] p-8 md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
              About me
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Hello there, I&apos;m {site.name.split(" ")[0]}.
            </h2>
          </div>
          <div className="space-y-4 text-[#b7cdc3] leading-relaxed">
            <p>
              UX Designer who ships. 3+ years building platforms for B2B brands
              and consumers — working closely with PMs and developers from early
              research to final handoff.
            </p>
            <p>
              I&apos;m currently deepening design systems skills and looking for
              a collaborative team where great design is valued. My recent work
              spans field verification for outdoor ads and EV mobility for
              last-mile riders.
            </p>
            <p className="text-sm text-[#8ea79c]">
              Solo designer on LocEarn. Adapted Kangaru through an investment
              pivot mid-project. Building Datum as a token-first system for
              scale.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-[920px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
            Now
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            What I&apos;m actually up to.
          </h2>
          <p className="mt-3 max-w-xl text-[#9aada4]">
            Updated whenever something changes — which is more often than I&apos;d
            like to admit.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {nowItems.map((item) => (
              <article
                key={item.label}
                className="rounded-[22px] border border-white/10 bg-[#101714] p-5"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-[#6f8379]">
                  {item.label}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#9aada4]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 pt-8">
        <div className="mx-auto max-w-[920px] rounded-[28px] border border-white/10 bg-[#0d1411] p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">
            Design system
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Datum — designed and owned end-to-end.
          </h2>
          <p className="mt-3 max-w-2xl text-[#9aada4]">
            A token-first design system built from scratch and documented for
            scale. Foundations, components, and interaction states — unlocking
            soon.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Token naming",
                items: ["brand.primary", "brand.hover", "surface.card"],
              },
              {
                title: "Component states",
                items: ["Default", "Hover", "Disabled"],
              },
              {
                title: "Spacing scale",
                items: ["space/1", "space/2", "space/4"],
              },
            ].map((block) => (
              <div
                key={block.title}
                className="rounded-2xl border border-white/8 bg-black/20 p-5"
              >
                <p className="text-sm font-medium text-white">{block.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-[#8ea79c]">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
