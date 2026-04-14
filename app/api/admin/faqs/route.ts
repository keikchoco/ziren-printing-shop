import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer, sortOrder } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    let nextSortOrder = 0;
    if (typeof sortOrder === "number") {
      nextSortOrder = sortOrder;
    } else {
      const lastItem = await db
        .collection("faqs")
        .find({})
        .sort({ sortOrder: -1 })
        .limit(1)
        .toArray();
      nextSortOrder = ((lastItem[0]?.sortOrder as number | undefined) ?? -1) + 1;
    }

    const result = await db.collection("faqs").insertOne({
      question,
      answer,
      sortOrder: nextSortOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        question,
        answer,
        sortOrder: nextSortOrder,
      },
    });
  } catch (error) {
    console.error("Error creating faq", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, question, answer, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing faq id" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof question === "string") {
      updateFields.question = question;
    }

    if (typeof answer === "string") {
      updateFields.answer = answer;
    }

    if (typeof sortOrder === "number") {
      updateFields.sortOrder = sortOrder;
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const result = await db.collection("faqs").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating faq", error);
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

    const result = await db.collection("faqs").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting faq", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
