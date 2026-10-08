import type { Metadata } from "next";
import {
  BeforeAfter,
  Callout,
  CaseStudyLayout,
  Quote,
  Section,
  StatGrid,
} from "@/components/CaseStudyLayout";

export const metadata: Metadata = {
  title: "LocEarn Case Study | Jatin Srivastava",
  description:
    "Helping brands verify outdoor ads through a network of riders — UX case study by Jatin Srivastava.",
};

export default function LocEarnPage() {
  return (
    <CaseStudyLayout
      eyebrow="Project 01 · LocEarn"
      title="Helping brands verify outdoor ads through a network of riders"
      subtitle="Designed an end-to-end experience for out-of-home ad verification — helping brands get real-time, geo-tagged proof of their campaigns."
      meta={[
        { label: "Duration", value: "8 weeks · brief to shipped" },
        { label: "Role", value: "Solo UX Designer" },
        {
          label: "Scope",
          value: "Research, flows, UI, DS, handoff",
        },
        { label: "Outcome", value: "Beta across 8 states" },
      ]}
    >
      <Section label="Context" title="How do brands know their ads are actually running?">
        <p>
          Brands pay crores for OOH ads. They have no idea if those ads are
          actually running. The problem isn&apos;t just trust — it&apos;s that
          brands have no way to act before it&apos;s too late.
        </p>
        <Callout>
          I was the solo designer on this project. Responsibilities included
          ideation, problem framing, user flows, wireframing, product decisions,
          visual design, and collaborating with the tech team to ship a seamless
          production experience.
        </Callout>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">No independent proof</strong> —
            everything brands know comes from the vendor running the campaign.
          </li>
          <li>
            <strong className="text-white">No real-time verification</strong> —
            checking every site physically doesn&apos;t scale.
          </li>
          <li>
            <strong className="text-white">By the time they find out, it&apos;s over</strong>{" "}
            — campaign windows are short; week-one spend is already gone.
          </li>
        </ul>
      </Section>

      <Section label="Opportunity" title="Who verifies sites — fast, affordably, at scale?">
        <p>
          We explored four options: vendor networks (same trust problem), hired
          field agents (too expensive), delivery-company partnerships (not
          scalable), and everyday people incentivised with money.
        </p>
        <Callout>
          We chose incentivised everyday people. Thousands already move through
          these cities daily — they just needed a reason to stop and look. 400+
          riders were onboarded via Instagram & Facebook ads.
        </Callout>
      </Section>

      <Section label="Proof system" title="Trust had to be tamper-proof">
        <p>
          Brands don&apos;t trust vendor photos. GPS confirmed location.
          Timestamp confirmed timing. Live capture meant no pre-shot photos. We
          extended an existing monitoring engine into LocEarn — same proof
          system, different user.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Right place", "GPS confirms the photo was taken at the contracted site."],
            ["Right time", "Timestamped at capture. No backdating."],
            ["Can't be staged", "Gallery upload blocked. Show up or don't submit."],
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

      <Section label="Research" title="V1 was a reality check — not a launch">
        <p>
          One week. Three screens. We went straight into high-fidelity to
          communicate the product vision fast. We didn&apos;t plan to test it —
          but we couldn&apos;t ignore what riders said when they saw the screens.
        </p>
        <div className="space-y-3">
          <Quote
            quote="Isme data bohot hai, thodi confusion ho rahi hai."
            translation="There's too much data here, it's getting confusing."
          />
          <Quote
            quote="Yaar itna padhna padega? Muje toh bss ye jaana hai ki paise kitne milenge aur site kitni door hai."
            translation="Do I have to read all this? I just want to know how much I'll earn and how far the site is."
          />
          <Quote
            quote="Sab tasks ek jaisa dikh raha hai — kaise pata chalega maine kal kaunsa kiya tha?"
            translation="All tasks look the same — how do I find what I did yesterday?"
          />
        </div>
      </Section>

      <Section label="Iteration" title="So we rebuilt it">
        <p>
          V1 wasn&apos;t built to ship. It was built to get everyone on the same
          page. Once we knew the direction, the job was clear: build something a
          rider would open willingly — and a brand would actually believe.
        </p>
        <BeforeAfter
          before={[
            "12+ fields, reward buried",
            "No distance filter",
            "CTA at the bottom",
            "Two competing CTAs on task details",
            "Identical history rows, no rejection reason",
          ]}
          after={[
            "Amount visible on every card",
            "Real site photo + distance slider",
            "One tap to book",
            "Timer front and centre, single CTA",
            "Unique codes, thumbnails, status + rejection inline",
          ]}
        />
      </Section>

      <Section label="Design decisions" title="Every element was a conscious call">
        <div className="space-y-4">
          {[
            [
              "Homepage",
              "Reward first so riders decide in 3 seconds. Mode switch separates Monitor vs Add Sites. Distance slider respects fuel cost. Real site photos set expectations before booking.",
            ],
            [
              "Task in progress",
              "Timer front and centre. Buffer time grouped with the clock. One CTA — “I’ve arrived.” Cancel demoted to a text link on purpose.",
            ],
            [
              "Submit proof",
              "Live capture only. Report Site built in. Thumbnail tray before submit. CTA activates only when captures are complete.",
            ],
            [
              "Sites history",
              "Unique site codes, real thumbnails, three clear status tags, and rejection reasons inline so riders never feel cheated.",
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

      <Section label="Brand side" title="Dashboard for campaign managers">
        <p>
          While riders are on the ground, brands verify geo-tagged proof in real
          time — all site context in one place, approved proof flagged instantly,
          no vendor in the loop.
        </p>
      </Section>

      <Section label="Impact" title="Riders earned. Brands verified.">
        <StatGrid
          items={[
            {
              value: "200+",
              label: "Riders deployed",
              detail: "Recruited via social ads, onboarded one by one",
            },
            {
              value: "20+",
              label: "Districts covered",
              detail: "Nearly all areas of West Bengal in one push",
            },
            {
              value: "3k+",
              label: "Sites monitored",
              detail: "Shipped in beta; scaled under real-world pressure",
            },
          ]}
        />
      </Section>

      <Section label="Reflection" title="What I'd do differently">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Onboarding was too long</strong> —
            start with a phone number; collect the rest after the first ₹35.
          </li>
          <li>
            <strong className="text-white">Buffer time placement</strong> — put
            it inside the timer card, where riders look when they&apos;re late.
          </li>
          <li>
            <strong className="text-white">Submission screen</strong> — design
            for 42° heat on the road: one big button, framing guide, nothing else.
          </li>
          <li>
            <strong className="text-white">Wallet</strong> — make withdraw the
            first thing riders see. They&apos;re here to earn.
          </li>
        </ul>
      </Section>
    </CaseStudyLayout>
  );
}
