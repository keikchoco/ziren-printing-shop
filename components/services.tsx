"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getServices } from "@/app/actions";

type ServiceItem = {
  service: string;
  display_name: string;
  description: string;
};

const services: ServiceItem[] = [
  {
    service: "business-cards",
    display_name: "Business Cards",
    description:
      "Premium quality business cards with various finishes including matte, glossy, and textured options.",
  },
  {
    service: "flyers-brochures",
    display_name: "Flyers & Brochures",
    description:
      "Eye-catching flyers and professional brochures to promote your business, events, or services.",
  },
  {
    service: "banners-posters",
    display_name: "Banners & Posters",
    description:
      "Large format printing for banners, posters, and signage that make a big impact.",
  },
  {
    service: "stickers-labels",
    display_name: "Stickers & Labels",
    description:
      "Custom stickers and labels in various shapes, sizes, and materials for any application.",
  },
  {
    service: "stamps-seals",
    display_name: "Stamps & Seals",
    description:
      "Professional rubber stamps and embossing seals for official documents and branding.",
  },
  {
    service: "custom-apparels",
    display_name: "Custom Apparels",
    description:
      "T-shirt printing and custom apparel with high-quality prints that last.",
  },
  {
    service: "signages",
    display_name: "Signages",
    description:
      "Durable and vibrant signage solutions for indoor and outdoor use, including yard signs and directional signs.",
  },
];

export function Services() {
  const [servicesData, setServicesData] = useState<ServiceItem[]>(services);
  const router = useRouter();

  useEffect(() => {
    getServices().then((res) => {
      if (res.success) {
        setServicesData((res.data as ServiceItem[]) || []);
      } else {
        console.error("Failed to fetch services:", res.message);
      }
    });
  }, []);

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesData.map((service) => (
              <Card
                key={service.service}
                className="bg-card border-border hover:border-primary/50 group hover:cursor-pointer hover:scale-103 transition-all rounded-2xl"
                onClick={() =>
                  router.push(
                    `/services/${service.service.toLowerCase().replace(/\s+/g, "-")}`,
                  )
                }
              >
                <CardHeader>
                  {/* <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div> */}
                  <CardTitle className="text-foreground">
                    {service.display_name}
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
