import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids } = body as { ids?: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing ids array" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const operations = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: {
          $set: {
            sortOrder: index,
            updatedAt: new Date(),
          },
        },
      },
    }));

    await db.collection("faqs").bulkWrite(operations);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering faqs", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
