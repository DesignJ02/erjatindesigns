"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { site } from "@/lib/content";

const MAX_TILT = 8;

export function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 40 });
  const [hovering, setHovering] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * (MAX_TILT * 2);
    const rotateX = (0.5 - py) * (MAX_TILT * 2);

    setTilt({ x: rotateX, y: rotateY });
    setGlow({ x: px * 100, y: py * 100 });
  }, []);

  const handleLeave = useCallback(() => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 40 });
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-28 md:pt-32">
      {/* Page-level ambient background motion */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-page-grid absolute inset-0 opacity-40" />
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </div>

      <div className="mx-auto max-w-[920px]" style={{ perspective: "1200px" }}>
        <div
          ref={cardRef}
          onMouseEnter={() => setHovering(true)}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="hero-card fade-up relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,#0f3d32_0%,#0a2a22_55%,#081c18_100%)] px-6 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] will-change-transform md:px-12 md:py-14"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.015 : 1})`,
            transition: hovering
              ? "transform 0.12s ease-out"
              : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Animated grid inside card */}
          <div className="hero-card-grid pointer-events-none absolute inset-0 opacity-50" />

          {/* Cursor-follow glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: hovering ? 1 : 0.55,
              background: `radial-gradient(520px circle at ${glow.x}% ${glow.y}%, rgba(142,227,196,0.18), transparent 55%)`,
            }}
          />

          {/* Soft particle field (right side) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%] overflow-hidden">
            <div className="hero-particles absolute inset-0" />
          </div>

          {/* Soft vignette so text stays readable */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,24,0.55)_0%,rgba(8,28,24,0.2)_55%,transparent_100%)]" />

          <div
            className="relative"
            style={{
              transform: "translateZ(28px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-[#c9ddd4]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3dd6a5] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3dd6a5]" />
              </span>
              Available
            </div>

            <p className="mb-4 text-lg font-medium md:text-xl">
              <span className="text-white">Product Designer</span>
            </p>

            <h1 className="max-w-3xl text-[2rem] font-semibold leading-[1.15] tracking-tight text-white md:text-[3.15rem]">
              I make complex B2B products easier to use.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#b7cdc3] md:text-lg">
              3+ years designing B2B and consumer products end-to-end, from
              early product thinking and user flows to shipped experiences.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#work"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a1f18] transition hover:bg-[#e8fff6]"
              >
                See the work
              </Link>
              <Link
                href="/#contact"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Get in touch
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-[#8ea79c]">
              <p>
                Currently{" "}
                <span className="text-[#d7ebe2]">{site.currently}</span>
              </p>
              <p>
                Building{" "}
                <span className="text-[#d7ebe2]">{site.previously}</span>
              </p>
              <p>
                Based in{" "}
                <span className="text-[#d7ebe2]">{site.location}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
