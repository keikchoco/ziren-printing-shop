import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    // @ts-ignore
    const services = await db.collection("services").find({}).toArray();

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("Error in GET services", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
