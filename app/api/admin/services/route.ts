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
    const db = client.db("main");

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
    console.log("Error creating service", error);
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
    const db = client.db("main");

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
    const service = await db.collection("services").findOne({
      _id: new ObjectId(id),
    });

    if (service) {
      await db
        .collection("service-offers")
        .deleteMany({ service: service.service });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting service", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
