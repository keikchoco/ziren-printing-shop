// Types of Requests
// POST - Create
// GET - Read
// UPDATE - Update
// PATCH - Update
// DELETE - Delete
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// localhost:3000/api/userlogin?id=12345

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const client = await clientPromise;
    const db = client.db("main");
    if (!id) {
        return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400 }
      );
    }
    
    // @ts-ignore
    const [service, offers] = await Promise.all([
      db.collection("services").findOne({ service: id }),
      db.collection("service-offers").find({service: id}).toArray()
    ]);
    
    return NextResponse.json({ success: true, data: offers, service: service });
  } catch (error) {
    console.log("Error in GET service offers", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
