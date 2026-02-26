import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    // @ts-ignore
    const services = await db.collection("services").find({}).toArray();

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.log("Error in GET services", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
