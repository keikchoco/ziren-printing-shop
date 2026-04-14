"use client"

import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type FaqItem = {
  _id: string
  question: string
  answer: string
}

export function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadFaqs() {
      try {
        const response = await fetch("/api/getFaqs", { method: "GET" })
        const data = await response.json()

        if (!isMounted) {
          return
        }

        if (response.ok && data.success) {
          setFaqs(data.data as FaqItem[])
        }
      } catch (error) {
        console.error("Failed to load FAQs", error)
      }
    }

    loadFaqs()

    return () => {
      isMounted = false
    }
  }, [])

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
          {faqs.length === 0 ? (
            <p className="text-muted-foreground text-center">No FAQ items available yet.</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq._id || `faq-${index}`}
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
          )}
        </div>
      </div>
    </section>
  )
}
