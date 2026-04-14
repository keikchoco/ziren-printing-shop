import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Image must be 5MB or smaller" },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const pathname = `offers/${Date.now()}-${sanitizedName || "image"}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
      },
    });
  } catch (error) {
    console.error("Error uploading offer image", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
