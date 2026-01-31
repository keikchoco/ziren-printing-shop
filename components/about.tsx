import { CheckCircle } from "lucide-react"

const features = [
  "High-quality printing equipment",
  "Fast turnaround times",
  "Competitive pricing",
  "Personalized customer service",
  "Eco-friendly options available",
  "100% satisfaction guarantee",
]

export function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
              About Ziren Printing Shop
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 text-pretty">
              With over 5 years of experience in the printing industry, Ziren Printing Shop has
              established itself as a trusted partner for businesses and individuals seeking
              high-quality printing services.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 text-pretty">
              Our commitment to excellence, attention to detail, and customer satisfaction has
              made us the go-to printing solution for countless satisfied clients. We combine
              modern technology with traditional craftsmanship to deliver prints that exceed
              expectations.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-xl">
                  <p className="text-4xl font-bold text-primary mb-2">500+</p>
                  <p className="text-sm text-muted-foreground">Happy Clients</p>
                </div>
                <div className="text-center p-6 bg-secondary/10 rounded-xl">
                  <p className="text-4xl font-bold text-secondary mb-2">5+</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
                <div className="text-center p-6 bg-secondary/10 rounded-xl">
                  <p className="text-4xl font-bold text-secondary mb-2">1000+</p>
                  <p className="text-sm text-muted-foreground">Projects Completed</p>
                </div>
                <div className="text-center p-6 bg-primary/5 rounded-xl">
                  <p className="text-4xl font-bold text-primary mb-2">24/7</p>
                  <p className="text-sm text-muted-foreground">Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
