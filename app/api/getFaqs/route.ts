import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const faqs = await db
      .collection("faqs")
      .find({})
      .sort({ sortOrder: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("Error in GET faqs", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
