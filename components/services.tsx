'use client'
import {
  CreditCard,
  FileText,
  ImageIcon,
  Layers,
  Shirt,
  SignpostIcon,
  Stamp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

const services = [
  {
    icon: CreditCard,
    title: "Business Cards",
    description:
      "Premium quality business cards with various finishes including matte, glossy, and textured options.",
  },
  {
    icon: FileText,
    title: "Flyers & Brochures",
    description:
      "Eye-catching flyers and professional brochures to promote your business, events, or services.",
  },
  {
    icon: ImageIcon,
    title: "Banners & Posters",
    description:
      "Large format printing for banners, posters, and signage that make a big impact.",
  },
  {
    icon: Layers,
    title: "Stickers & Labels",
    description:
      "Custom stickers and labels in various shapes, sizes, and materials for any application.",
  },
  {
    icon: Stamp,
    title: "Stamps & Seals",
    description:
      "Professional rubber stamps and embossing seals for official documents and branding.",
  },
  {
    icon: Shirt,
    title: "Custom Apparels",
    description:
      "T-shirt printing and custom apparel with high-quality prints that last.",
  },
  {
    icon: SignpostIcon,
    title: "Signages",
    description:
      "Durable and vibrant signage solutions for indoor and outdoor use, including yard signs and directional signs.",
  },
];

export function Services() {
  const router = useRouter();


  return (
    <>
      <section id="services" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
              We offer a comprehensive range of printing services to meet all
              your business and personal needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                className="bg-card border-border hover:border-primary/50 group hover:cursor-pointer hover:scale-104 transition-all"
                onClick={() => router.push(`/services/${service.title.toLowerCase().replace(/\s+/g, "-")}`)}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
