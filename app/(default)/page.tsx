import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { PricingCalculator } from "@/components/pricing-calculator";
import { About } from "@/components/about";
import { FAQ } from "@/components/faq";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="max-w-6xl mx-auto px-4">
        <Services />
        <PricingCalculator />
        <About />
        <FAQ />
        <Contact />
      </div>
    </>
  );
}
