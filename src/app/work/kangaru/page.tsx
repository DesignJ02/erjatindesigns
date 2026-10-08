import type { Metadata } from "next";
import {
  Callout,
  CaseStudyLayout,
  Section,
} from "@/components/CaseStudyLayout";

export const metadata: Metadata = {
  title: "Kangaru Case Study | Jatin Srivastava",
  description:
    "Vehicle booking platform for last-mile delivery riders — UX case study by Jatin Srivastava.",
};

export default function KangaruPage() {
  return (
    <CaseStudyLayout
      eyebrow="Project 02 · Kangaru"
      title="Designed a vehicle booking platform for last-mile delivery riders"
      subtitle="From onboarding to unlocking their first EV — redesigned mid-project when investment shifted the company from software-for-fleets to owning the fleet."
      meta={[
        { label: "Duration", value: "2 months · brief to final" },
        { label: "Role", value: "Solo Designer" },
        {
          label: "Scope",
          value: "Research, personas, flows, UI",
        },
        { label: "Status", value: "Real product · Not yet live" },
      ]}
    >
      <Section label="Context" title="What we initially thought riders needed">
        <p>
          Last-mile delivery riders working across Swiggy, Zomato, and Blinkit
          had fragmented tools — no unified earnings view, no EV-specific
          charging guidance, and no early warning on vehicle health.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            [
              "No unified earnings",
              "Riders switched between three apps just to know what they made that day.",
            ],
            [
              "No EV charging guidance",
              "Maps didn’t show active chargers, wait times, or EV-specific routing.",
            ],
            [
              "No vehicle health visibility",
              "Riders found out about breakdowns when they happened — mid-shift, stranded.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-[#101714] p-4"
            >
              <p className="font-medium text-white">{title}</p>
              <p className="mt-2 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section label="V1 thinking" title="Fleet companies owned the infra. Nobody was building the software.">
        <p>
          EV adoption in last-mile delivery was growing fast in India — but the
          focus was almost entirely on hardware. We planned to own the software
          layer: charging behaviour, battery anxiety, earnings per shift, route
          efficiency on limited range.
        </p>
        <Callout>
          Everyone was building the vehicle. We were building what runs on top
          of it.
        </Callout>
      </Section>

      <Section label="Pivot" title="The product worked — the business had a ceiling">
        <p>
          Software sold to fleet companies is only as big as the number of fleet
          companies willing to buy it. Any fleet could hire two developers and
          rebuild us overnight. So while building V1, we looked for investment —
          not to save what we had, but to unlock what we couldn&apos;t build
          without backing.
        </p>
        <p>
          Investment confirmed the bigger opportunity: own the vehicles, and
          build the software on top. Four things changed — ownership,
          relationship, revenue, and brand. The design problems stayed the same.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [
              "Ownership",
              "V1: fleet companies owned vehicles. V2: Kangaru owned the fleet.",
            ],
            [
              "Relationship",
              "V1: rider used a white-labeled app. V2: rider opens Kangaru.",
            ],
            [
              "Revenue",
              "V1: monthly subscription to fleets. V2: 3% per delivery from riders.",
            ],
            [
              "Brand",
              "V1: Kangaru was invisible. V2: Kangaru became the face of the experience.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-[#101714] p-4"
            >
              <p className="font-medium text-white">{title}</p>
              <p className="mt-2 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Principle" title="If a rider doesn't earn, we don't earn">
        <p>
          Competitors charge riders even on bad days with no deliveries. We
          decided early: no delivery, no fee. That business model decision
          shaped the entire product — especially deposit transparency and the
          wallet.
        </p>
      </Section>

      <Section label="Key screens" title="Designing for riders who need to feel safe enough to act">
        <div className="space-y-4">
          {[
            [
              "Onboarding & KYC",
              "Getting a rider verified mattered more than getting them in fast. Progress bar for goal-gradient effect. Instructions before capture. Camera or upload for static IDs — no forced live capture.",
            ],
            [
              "Homepage",
              "Nearest hub auto-selected. Map over list — humans think spatially. Hub cards show distance, time, and vehicle count before tap. One clear CTA per card.",
            ],
            [
              "Vehicle selection",
              "Available/Charging badges. Ghost button on charging vehicles. CTA on every card so riders book in one tap — choice without confusion.",
            ],
            [
              "Security deposit",
              "Lead with “Pay once, top up only when needed.” Payment breakdown over a single total. Refund message before the amount. Transparency as the decision.",
            ],
            [
              "Booking confirmation",
              "Transaction ID upfront. All details in one place. “Ready to unlock” hint so confirmation is the start of the next step — not a dead end.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-[#101714] p-5"
            >
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Learnings" title="Kangaru taught me that design doesn't start with screens">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Business model is a design problem</strong>{" "}
            — the deposit, the 3% fee, wallet transparency. I couldn&apos;t
            separate the two — and shouldn&apos;t have to.
          </li>
          <li>
            <strong className="text-white">Ambiguity is the job</strong> — V1
            became V2 mid-project. No brief. No playbook. That&apos;s the work.
          </li>
          <li>
            <strong className="text-white">The rider is always the starting point</strong>{" "}
            — every screen came back to one question: does this make the rider
            feel safe enough to act?
          </li>
        </ul>
      </Section>
    </CaseStudyLayout>
  );
}
