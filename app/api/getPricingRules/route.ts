import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const data = await db
      .collection("pricing-rules")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in GET pricing rules", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
