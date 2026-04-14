'use client'
import { getServiceOffers } from "@/app/actions";
import Link from "next/link";
import { use, useEffect, useState } from "react";

type ServiceOffer = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  galleryImages?: string[];
};

type ServiceInfo = {
  display_name: string;
  description: string;
};

export default function Services({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [servicesData, setServicesData] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { slug } = use(params);
  const slugParts = Array.isArray(slug) ? slug : [slug];
  const serviceKey = slugParts[0];
  const offerId = slugParts[1] ?? null;
  const isGalleryPage = Boolean(offerId);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);

      const res = await getServiceOffers(serviceKey);

      if (!isMounted) {
        return;
      }

      if (res.success) {
        setServicesData((res.data as ServiceOffer[]) || []);
        setServiceInfo((res.service as ServiceInfo) || null);
      } else {
        console.error("Failed to fetch service offers:", res.message);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [serviceKey]);

  const selectedOffer = offerId
    ? servicesData.find((item) => item._id === offerId)
    : null;

  const galleryImages = selectedOffer
    ? [selectedOffer.image, ...(selectedOffer.galleryImages || [])].filter(
        (image): image is string => Boolean(image)
      )
    : [];

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        {!isGalleryPage ? (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="capitalize font-extrabold text-3xl">{serviceInfo?.display_name ?? serviceKey}</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {serviceInfo?.description ?? "Select a service to see details."}
                </p>
              </div>
              <Link
                href="/#services"
                className="px-4 py-2 rounded border text-sm font-medium hover:bg-accent"
              >
                Back to Services
              </Link>
            </div>

            {loading ? (
              <div className="mt-6">
                <p>Loading service offers...</p>
              </div>
            ) : servicesData.length === 0 ? (
              <div className="mt-6">
                <p>No services found for this category.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {servicesData.map((item, i) => (
                  <article
                    key={item._id}
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
                        <Link
                          href={`/services/${encodeURIComponent(serviceKey)}/${encodeURIComponent(item._id)}`}
                          className="px-3 py-2 rounded bg-primary text-white text-sm w-full text-center hover:cursor-pointer hover:bg-secondary"
                        >
                          View Gallery
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-extrabold text-3xl">{selectedOffer?.title ?? "Offer Gallery"}</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedOffer?.description ?? "Browse images for this offer."}
                </p>
              </div>
              <Link
                href={`/services/${encodeURIComponent(serviceKey)}`}
                className="px-4 py-2 rounded border text-sm font-medium hover:bg-accent"
              >
                Back to Offers
              </Link>
            </div>

            {loading ? (
              <div className="mt-6">
                <p>Loading gallery...</p>
              </div>
            ) : !selectedOffer ? (
              <div className="mt-6">
                <p>Offer not found.</p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="mt-6">
                <p>No gallery images available for this offer.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="border rounded overflow-hidden bg-white shadow-sm">
                    <img
                      src={imageUrl}
                      alt={`${selectedOffer.title} gallery image ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
