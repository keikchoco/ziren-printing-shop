"use server";

export async function getServices() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getServices`,
      {
        method: "GET",
      },
    );

    const data = await response.json();

    // console.log("UserLogin response data:", data);
    if (data.success) {
      return data;
    }

    return { success: false, message: data.message };
  } catch (error) {
    return { success: false, message: error };
  }
}

export async function getServiceOffers(serviceId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getServiceOffers?id=${serviceId}`,
      {
        method: "GET",
      },
    );
    const data = await response.json();

    if (data.success) {
      return data;
    }

    return { success: false, message: data.message };
  } catch (error) {
    return { success: false, message: error };
  }
}
