'use client';

import { useRouter } from "next/navigation";
import "./landing.css";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { LogosSection } from "../components/landing/LogosSection";
import { Features } from "../components/landing/Features";
import { DemoSection } from "../components/landing/DemoSection";
import { Differentiator } from "../components/landing/Differentiator";
import { Metrics } from "../components/landing/Metrics";
import { Pricing } from "../components/landing/Pricing";
import { Testimonials } from "../components/landing/Testimonials";
import { Integrations } from "../components/landing/Integrations";
import { FAQ } from "../components/landing/FAQ";
import { FinalCTA } from "../components/landing/FinalCTA";

export default function App() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === "login") {
      router.push("/login");
      return;
    }

    if (page === "register") {
      router.push("/register");
      return;
    }

    router.push("/");
  };

  return (
    <div className="landing-theme min-h-screen bg-white">
      <Header onNavigate={handleNavigate} />
      <Hero onNavigate={handleNavigate} />
      <LogosSection />
      <Features />
      <DemoSection />
      <Differentiator />
      <Metrics />
      <Pricing />
      <Testimonials />
      <Integrations />
      <FAQ />
      <FinalCTA />
    </div>
  );
}





