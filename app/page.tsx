import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { PricingCalculator } from "@/components/pricing-calculator"
import { About } from "@/components/about"
import { FAQ } from "@/components/faq"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <PricingCalculator />
      <About />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}
