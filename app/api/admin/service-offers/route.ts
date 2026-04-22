import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type ServiceOfferPayload = {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  service?: string;
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
    const id = url.searchParams.get("id");
    const service = url.searchParams.get("service");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    if (id) {
      const objectId = toObjectId(id);
      if (!objectId) {
        return NextResponse.json(
          { success: false, message: "Invalid offer id" },
          { status: 400 }
        );
      }

      const offer = await db.collection("service-offers").findOne({ _id: objectId });
      if (!offer) {
        return NextResponse.json(
          { success: false, message: "Offer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: offer });
    }

    const query = service ? { service: normalizeService(service) } : {};
    const offers = await db
      .collection("service-offers")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error loading service offers", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ServiceOfferPayload;
    const { title, description, image, service } = body;

    if (!title || !description || !service) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    // Check if service exists
    const serviceExists = await db
      .collection("services")
      .findOne({ service: normalizeService(service) });

    if (!serviceExists) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 400 }
      );
    }

    const result = await db.collection("service-offers").insertOne({
      title,
      description,
      image: image || "",
      service: normalizeService(service),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        title,
        description,
        image: image || "",
        service: normalizeService(service),
      },
    });
  } catch (error) {
    console.error("Error creating service offer", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as ServiceOfferPayload;
    const { id, title, description, image, service } = body;

    if (!id || !title || !description || !service) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json(
        { success: false, message: "Invalid offer id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const serviceExists = await db
      .collection("services")
      .findOne({ service: normalizeService(service) });

    if (!serviceExists) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 400 }
      );
    }

    const result = await db.collection("service-offers").updateOne(
      { _id: objectId },
      {
        $set: {
          title,
          description,
          image: image || "",
          service: normalizeService(service),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: objectId,
        title,
        description,
        image: image || "",
        service: normalizeService(service),
      },
    });
  } catch (error) {
    console.error("Error updating service offer", error);
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
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }

    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json(
        { success: false, message: "Invalid offer id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const result = await db
      .collection("service-offers")
      .deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Offer not found" },
        { status: 404 }
      );
    }

    await db.collection("offer-gallery").deleteMany({ offerId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service offer", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
