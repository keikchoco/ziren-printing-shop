import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const toSafeSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const service = (formData.get("service") as string) || "unknown-service";
    const offerId = (formData.get("offerId") as string) || "unknown-offer";

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const filename = `${Date.now()}-${file.name}`;
        const blob = await put(
          `offers/${toSafeSegment(service)}/${toSafeSegment(offerId)}/${filename}`,
          file,
          {
            access: "public",
            addRandomSuffix: true,
          }
        );

        return {
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType,
          size: file.size,
          originalName: file.name,
        };
      })
    );

    return NextResponse.json({ success: true, data: uploads });
  } catch (error) {
    console.error("Error uploading gallery images", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload images" },
      { status: 500 }
    );
  }
}
