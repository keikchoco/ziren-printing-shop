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

export async function deleteService(id: string) {
  return apiRequest(`/api/admin/services?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
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

export async function deleteServiceOffer(id: string) {
  return apiRequest(`/api/admin/service-offers?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function updateServiceOffer(payload: {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  galleryImages?: string[];
}) {
  return apiRequest("/api/admin/service-offers", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
