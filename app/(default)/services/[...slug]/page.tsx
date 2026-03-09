'use client'
import { getServiceOffers } from "@/app/actions";
import { use, useEffect, useState } from "react";

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  priceRange: string;
};

export default function Services({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [servicesData, setServicesData] = useState<any>(null);
  const { slug } = use(params);
  const slugKey = Array.isArray(slug) ? slug[0] : slug;

  useEffect(() => {
    getServiceOffers(slugKey).then((res) => {
      if (res.success) {
        setServicesData(res.data);
        setServiceInfo(res.service);
      } else {
        console.error("Failed to fetch service offers:", res.message);
      }
    });
  }, []);

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="capitalize font-extrabold text-3xl">{serviceInfo?.display_name ?? slugKey}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {serviceInfo?.description ?? "Select a service to see details."}
        </p>

        {!servicesData && (
          <div className="mt-6">
            <p>No services found for this category.</p>
          </div>
        )}

        {servicesData && (
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {servicesData.map((item: any, i: number) => (
              <article
                key={item.id}
                className="flex flex-col justify-between border rounded overflow-hidden shadow-sm bg-white"
              >
                <div className="w-full h-60 bg-gray-100">
                  <img
                    src={item.image || `https://picsum.photos/600?random=${i}`}
                    alt={item.title}
                    className="w-full h-full object-cover min-h-60"
                  />
                </div>
                <div className="p-4 h-full flex flex-col gap-3">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-auto">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    {/* <span className='text-sm font-medium'>{item.priceRange}</span> */}
                    <button className="px-3 py-2 rounded bg-primary text-white text-sm w-full hover:cursor-pointer hover:bg-secondary">
                      Inquire
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
