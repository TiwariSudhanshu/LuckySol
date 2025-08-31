"use client"

import { Confetti } from "@/components/confetti"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero/hero"
import { About } from "@/components/sections/about"
import { BottomCTA } from "@/components/sections/cta"
import { FAQ } from "@/components/sections/faq"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Leaderboard } from "@/components/sections/leaderboard"
import { Stats } from "@/components/sections/stats"


export default function Page() {
 return(
  <>
    <main className="relative min-h-dvh bg-black text-white font-sans">
      <Confetti />
      <Header />
      <Hero />
      <Features />
      <Stats />
      <Leaderboard />
      <HowItWorks />
      <About />
      <FAQ />
      <BottomCTA />
      <Footer />
    </main>
    </>
 )
}
