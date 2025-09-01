"use client";

import type React from "react";
import BgElements from "../bgElements";

import { SwapCard } from "./swap-card";

export function Hero() {
  return (
    <section className="relative z-10">
      <BgElements />
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 relative z-10 md:pt-50 md:pb-50">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[55%_45%]">
          <div className="text-center sm:text-left py-10 sm:py-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-400">
              Team up with LuckySol
            </p>
            <h1 className="text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              Get your slice of the solana gaming pie
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
             LuckySol is a fair, transparent Solana-based lottery where you can play, win, and get instant payouts , all on-chain with verifiable randomness. Your luck, your rules
            </p>

            <div className="mt-4 ">
              <button
                type="button"
                onClick={() => {}}
                className=" rounded- cursor-pointer bg-lime-500 px-20 rounded-3xl py-3 text-lg font-semibold text-black transition hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black"
              >
               Launch
              </button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <OrbitBorder>
              <SwapCard />
            </OrbitBorder>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrbitBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group/orbit">
      <div className="relative z-10">{children}</div>
      <svg
        className="pointer-events-none absolute inset-0 -m-2"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="softGlowLime"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2"
              floodColor="rgb(163,230,53)"
              floodOpacity="0.55"
            />
          </filter>
          <filter
            id="softGlowViolet"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2"
              floodColor="rgb(167,139,250)"
              floodOpacity="0.5"
            />
          </filter>
          <filter
            id="softGlowPink"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2"
              floodColor="rgb(244,114,182)"
              floodOpacity="0.5"
            />
          </filter>
        </defs>

        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="8"
          fill="none"
          stroke="none"
          pathLength={100}
        />

        <rect
          className="orbit orbit--lime"
          x="2"
          y="2"
          width="96"
          height="96"
          rx="8"
          fill="none"
          stroke="rgb(163,230,53)"
          strokeWidth="1.25"
          pathLength={100}
          filter="url(#softGlowLime)"
        />
        <rect
          className="orbit orbit--violet"
          x="2"
          y="2"
          width="96"
          height="96"
          rx="8"
          fill="none"
          stroke="rgb(167,139,250)"
          strokeWidth="1.25"
          pathLength={100}
          filter="url(#softGlowViolet)"
        />
        <rect
          className="orbit orbit--pink"
          x="2"
          y="2"
          width="96"
          height="96"
          rx="8"
          fill="none"
          stroke="rgb(244,114,182)"
          strokeWidth="1.25"
          pathLength={100}
          filter="url(#softGlowPink)"
        />
      </svg>

      <style jsx>{`
        .orbit {
          vector-effect: non-scaling-stroke;
          stroke-linecap: round;
          stroke-dasharray: 18 100;
          animation: orbit-spin 7s linear infinite;
          opacity: 0.95;
        }
        .orbit--violet {
          animation-delay: -2.3s;
        }
        .orbit--pink {
          animation-delay: -4.6s;
        }

        .group\\/orbit:hover .orbit {
          opacity: 1;
          filter: drop-shadow(0 0 6px currentColor);
        }

        @keyframes orbit-spin {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -100;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit {
            animation: none !important;
            stroke-dasharray: none !important;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
