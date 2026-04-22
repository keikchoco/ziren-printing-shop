"use server";

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  service?: unknown;
};

const getBaseUrl = () => process.env.NEXT_PUBLIC_BASE_URL;

async function apiRequest<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = getBaseUrl();

    if (!baseUrl) {
      return {
        success: false,
        message: "Missing NEXT_PUBLIC_BASE_URL configuration",
      };
    }

    const response = await fetch(`${baseUrl}${path}`, options);
    const data = await response.json();

    if (data.success) {
      return data;
    }

    return { success: false, message: data.message || "Request failed" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function getServices() {
  return apiRequest("/api/getServices", { method: "GET" });
}

export async function getServiceOffers(serviceId: string) {
  return apiRequest(
    `/api/getServiceOffers?id=${encodeURIComponent(serviceId)}`,
    {
      method: "GET",
    },
  );
}

export async function addService(payload: {
  service: string;
  display_name: string;
  description: string;
}) {
  return apiRequest("/api/admin/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateService(payload: {
  id: string;
  service: string;
  display_name: string;
  description: string;
}) {
  return apiRequest("/api/admin/services", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteService(id: string) {
  return apiRequest(`/api/admin/services?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getServiceById(id: string) {
  return apiRequest(`/api/admin/services?id=${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function addServiceOffer(payload: {
  title: string;
  description: string;
  image: string;
  service: string;
}) {
  return apiRequest("/api/admin/service-offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateServiceOffer(payload: {
  id: string;
  title: string;
  description: string;
  image: string;
  service: string;
}) {
  return apiRequest("/api/admin/service-offers", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteServiceOffer(id: string) {
  return apiRequest(`/api/admin/service-offers?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getServiceOfferById(id: string) {
  return apiRequest(`/api/admin/service-offers?id=${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function getAdminServiceOffers(service: string) {
  return apiRequest(
    `/api/admin/service-offers?service=${encodeURIComponent(service)}`,
    { method: "GET" }
  );
}

export async function getOfferGallery(offerId: string) {
  return apiRequest(`/api/admin/offer-gallery?offerId=${encodeURIComponent(offerId)}`, {
    method: "GET",
  });
}

export async function addOfferGalleryImage(payload: {
  offerId: string;
  service: string;
  imageUrl: string;
  pathname?: string;
  alt?: string;
}) {
  return apiRequest("/api/admin/offer-gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateOfferGalleryImage(payload: {
  id: string;
  alt: string;
}) {
  return apiRequest("/api/admin/offer-gallery", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteOfferGalleryImage(id: string) {
  return apiRequest(`/api/admin/offer-gallery?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadOfferGalleryImages(payload: {
  service: string;
  offerId: string;
  files: File[];
}) {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Missing NEXT_PUBLIC_BASE_URL configuration",
      } as ApiResponse;
    }

    const formData = new FormData();
    formData.append("service", payload.service);
    formData.append("offerId", payload.offerId);

    payload.files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${baseUrl}/api/admin/offer-gallery/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data as ApiResponse<
        Array<{
          url: string;
          pathname: string;
          contentType?: string;
          size?: number;
          originalName?: string;
        }>
      >;
    }

    return { success: false, message: data.message || "Upload failed" } as ApiResponse;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    } as ApiResponse;
  }
}
