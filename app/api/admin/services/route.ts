import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type ServicePayload = {
  service?: string;
  display_name?: string;
  description?: string;
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    if (id) {
      const objectId = toObjectId(id);
      if (!objectId) {
        return NextResponse.json(
          { success: false, message: "Invalid service id" },
          { status: 400 }
        );
      }

      const service = await db.collection("services").findOne({ _id: objectId });
      if (!service) {
        return NextResponse.json(
          { success: false, message: "Service not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: service });
    }

    const services = await db.collection("services").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("Error loading services", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ServicePayload;
    const { service, display_name, description } = body;

    if (!service || !display_name || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    // Check if service already exists
    const existing = await db
      .collection("services")
      .findOne({ service: normalizeService(service) });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Service already exists" },
        { status: 400 }
      );
    }

    const result = await db.collection("services").insertOne({
      service: normalizeService(service),
      display_name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        service: normalizeService(service),
        display_name,
        description,
      },
    });
  } catch (error) {
    console.error("Error creating service", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as ServicePayload & { id?: string };
    const { id, service, display_name, description } = body;

    if (!id || !service || !display_name || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json(
        { success: false, message: "Invalid service id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const normalizedService = normalizeService(service);

    const duplicate = await db.collection("services").findOne({
      service: normalizedService,
      _id: { $ne: objectId },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Service key already exists" },
        { status: 400 }
      );
    }

    const existing = await db.collection("services").findOne({ _id: objectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    await db.collection("services").updateOne(
      { _id: objectId },
      {
        $set: {
          service: normalizedService,
          display_name,
          description,
          updatedAt: new Date(),
        },
      }
    );

    if (existing.service !== normalizedService) {
      await db
        .collection("service-offers")
        .updateMany(
          { service: existing.service },
          { $set: { service: normalizedService, updatedAt: new Date() } }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: objectId,
        service: normalizedService,
        display_name,
        description,
      },
    });
  } catch (error) {
    console.error("Error updating service", error);
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
        { success: false, message: "Invalid service id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const service = await db.collection("services").findOne({ _id: objectId });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    const offers = await db
      .collection("service-offers")
      .find({ service: service.service })
      .toArray();
    const offerIds = offers.map((offer) => offer._id);

    if (offerIds.length > 0) {
      await db
        .collection("offer-gallery")
        .deleteMany({ offerId: { $in: offerIds.map((offerId) => String(offerId)) } });
    }

    await db.collection("services").deleteOne({ _id: objectId });

    if (service.service) {
      await db
        .collection("service-offers")
        .deleteMany({ service: service.service });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
