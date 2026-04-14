import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      .findOne({ service: service.toLowerCase() });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Service already exists" },
        { status: 400 }
      );
    }

    const result = await db.collection("services").insertOne({
      service: service.toLowerCase(),
      display_name,
      description,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        service: service.toLowerCase(),
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const service = await db.collection("services").findOne({
      _id: new ObjectId(id),
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    // Delete the service
    const result = await db
      .collection("services")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    // Also delete all offers for this service
    await db
      .collection("service-offers")
      .deleteMany({ service: service.service });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, service, display_name, description } = body;

    if (!id || !service || !display_name || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedService = service.toLowerCase();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const current = await db.collection("services").findOne({
      _id: new ObjectId(id),
    });

    if (!current) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    if (current.service !== normalizedService) {
      const duplicate = await db.collection("services").findOne({
        service: normalizedService,
        _id: { $ne: new ObjectId(id) },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Service key already exists" },
          { status: 400 }
        );
      }
    }

    const result = await db.collection("services").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          service: normalizedService,
          display_name,
          description,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    if (current.service !== normalizedService) {
      await db.collection("service-offers").updateMany(
        { service: current.service },
        { $set: { service: normalizedService } }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating service", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
