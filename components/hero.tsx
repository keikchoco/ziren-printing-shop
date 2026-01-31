import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Printer, Zap, Award } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Fast Turnaround Time
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
              Professional Printing Services for{" "}
              <span className="text-primary">Every Need</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
              From business cards to large format banners, we deliver high-quality prints with
              exceptional attention to detail. Your vision, perfectly printed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" asChild className="text-base">
                <Link href="#pricing">
                  Get Instant Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="#services">View Our Services</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Printer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Projects Done</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">5 Years</p>
                  <p className="text-sm text-muted-foreground">Experience</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-secondary/30 rounded-3xl blur-3xl" />
              <div className="relative bg-card rounded-3xl p-8 border border-border h-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Ziren Printing Shop"
                  width={320}
                  height={320}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
