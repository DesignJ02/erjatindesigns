export const site = {
  name: "Jatin Srivastava",
  role: "UX Designer",
  taglineAccent: "Problem Solver",
  headline: "I design B2B products that riders trust — and brands can verify.",
  headlineParts: {
    before: "I design B2B products that riders ",
    italic1: "trust",
    middle: " — and brands can ",
    italic2: "verify",
    after: ".",
  },
  subhead:
    "3+ years designing platforms end-to-end for B2B brands and consumers. Working closely with PMs and developers — from early research to final handoff.",
  location: "India",
  currently: "LocEarn / Kangaru",
  previously: "Building design systems skills",
  email: "hello@jatinsrivastava.design",
  linkedin: "https://www.linkedin.com/in/",
  resume: "#",
  lookingFor:
    "A collaborative team where great design is valued — Product Designer roles, hybrid or remote.",
};

export const skills = [
  { name: "Figma", tag: "Design" },
  { name: "User Research", tag: "Discovery" },
  { name: "Design Systems", tag: "Scale" },
  { name: "User Flows", tag: "Product" },
  { name: "Wireframing", tag: "Craft" },
  { name: "Prototyping", tag: "Craft" },
  { name: "Developer Handoff", tag: "Delivery" },
  { name: "Stakeholder Design", tag: "Collab" },
  { name: "B2B Platforms", tag: "Domain" },
  { name: "Mobile UX", tag: "Product" },
];

export const projects = [
  {
    slug: "locearn",
    href: "/work/locearn",
    index: "01",
    title: "Helped brands verify outdoor ads through a network of riders",
    shortTitle: "LocEarn",
    type: "B2B / Field ops",
    status: "Shipped",
    duration: "8 weeks",
    problem:
      "Brands pay crores for OOH ads with no independent, real-time proof that campaigns are actually running.",
    impact:
      "Rider app launched in beta across 8 states — 200+ riders, 20+ districts, 3k+ sites monitored.",
    tags: ["Real product", "Shipped"],
    available: true,
    accent: "green" as const,
  },
  {
    slug: "kangaru",
    href: "/work/kangaru",
    index: "02",
    title: "Reduced vehicle costs for last-mile delivery riders",
    shortTitle: "Kangaru",
    type: "B2C / Mobility",
    status: "In development",
    duration: "2 months",
    problem:
      "Last-mile riders had no unified path from KYC to unlocking an EV — and fleet software alone hit a business ceiling.",
    impact:
      "End-to-end booking platform redesigned after investment pivot — from onboarding to first unlock.",
    tags: ["Real product", "In development"],
    available: true,
    accent: "olive" as const,
  },
  {
    slug: "datum",
    href: "#datum",
    index: "03",
    title: "A token-first design system built from scratch, documented for scale",
    shortTitle: "Datum",
    type: "Design system",
    status: "Coming soon",
    duration: "In process",
    problem:
      "Personal project exploring foundations, tokens, and components built for product teams that ship at scale.",
    impact: "Unlocking soon — foundations, components, and documentation.",
    tags: ["Personal project", "Coming soon"],
    available: false,
    accent: "slate" as const,
  },
];

export const nowItems = [
  {
    label: "Looking for",
    title: "A team where design sits upstream of the brief.",
    detail: "UX / Product Designer — collaborative product org",
  },
  {
    label: "Building",
    title: "Design systems skills and shipping case studies properly.",
    detail: "Documenting LocEarn, Kangaru, and Datum for the portfolio",
  },
  {
    label: "Focus",
    title: "B2B products where trust, money, and speed collide.",
    detail: "Field ops, mobility, and systems that riders actually open",
  },
];
