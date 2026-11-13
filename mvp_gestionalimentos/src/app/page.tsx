import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { ProblemStats } from "@/components/landing/ProblemStats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Reviews } from "@/components/landing/Reviews";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemStats />
      <Benefits />
      <HowItWorks />
      <Reviews />
      <FinalCTA />
      <Footer />
    </main>
  );
}
