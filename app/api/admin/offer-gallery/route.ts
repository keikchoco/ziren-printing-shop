import clientPromise from "@/lib/mongodb";
import { del } from "@vercel/blob";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

type OfferGalleryPayload = {
  id?: string;
  offerId?: string;
  service?: string;
  imageUrl?: string;
  pathname?: string;
  alt?: string;
};

const toObjectId = (value: string) => {
  if (!ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
};

const normalizeService = (service: string) => service.toLowerCase().trim();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const offerId = url.searchParams.get("offerId");

    if (!offerId) {
      return NextResponse.json(
        { success: false, message: "Missing offerId parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const items = await db
      .collection("offer-gallery")
      .find({ offerId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error getting gallery images", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OfferGalleryPayload;
    const { offerId, service, imageUrl, pathname, alt } = body;

    if (!offerId || !service || !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const offerObjectId = toObjectId(offerId);
    if (!offerObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid offer id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const offerExists = await db
      .collection("service-offers")
      .findOne({ _id: offerObjectId });

    if (!offerExists) {
      return NextResponse.json(
        { success: false, message: "Offer not found" },
        { status: 404 }
      );
    }

    const result = await db.collection("offer-gallery").insertOne({
      offerId,
      service: normalizeService(service),
      imageUrl,
      pathname: pathname || null,
      alt: alt || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        offerId,
        service: normalizeService(service),
        imageUrl,
        pathname: pathname || null,
        alt: alt || "",
      },
    });
  } catch (error) {
    console.error("Error creating gallery image", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as OfferGalleryPayload;
    const { id, alt } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing image id" },
        { status: 400 }
      );
    }

    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json(
        { success: false, message: "Invalid image id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const result = await db.collection("offer-gallery").updateOne(
      { _id: objectId },
      {
        $set: {
          alt: alt || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating gallery image", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing image id" },
        { status: 400 }
      );
    }

    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json(
        { success: false, message: "Invalid image id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const existing = await db.collection("offer-gallery").findOne({ _id: objectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    await db.collection("offer-gallery").deleteOne({ _id: objectId });

    if (existing.pathname) {
      try {
        await del(existing.pathname);
      } catch (blobError) {
        console.error("Blob delete failed", blobError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery image", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
