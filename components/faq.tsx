import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is the typical turnaround time for orders?",
    answer:
      "Our standard turnaround time is 2-3 business days for most print jobs. Rush orders can be completed within 24 hours for an additional fee. Large format printing and custom projects may require additional time.",
  },
  {
    question: "What file formats do you accept?",
    answer:
      "We accept most common file formats including PDF, AI, PSD, PNG, JPG, and TIFF. For best results, we recommend submitting files in PDF format with fonts embedded and images at 300 DPI or higher.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, credit/debit cards, bank transfers, and popular e-wallet payments. For corporate clients, we also offer invoicing with payment terms.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-card/50 scroll-mt-16 rounded-2xl">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            Find answers to common questions about our printing services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={`faq-${index}-${faq.question.slice(0, 20).replace(/\s/g, "-")}`}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 last:border"
              >
                <AccordionTrigger className="text-foreground hover:text-primary text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
