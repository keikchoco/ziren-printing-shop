import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type OptionItem = {
  id?: string;
  label: string;
  basePrice: number;
  multiplier: number;
};

type PricingRulePayload = {
  productType: string;
  enableProductOptions: boolean;
  productOptions?: OptionItem[];
  enableSize: boolean;
  enableQuantity: boolean;
  basePrice?: number;
  multiplier?: number;
};

function ensureNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePayload(payload: PricingRulePayload) {
  const productType = (payload.productType || "").trim();
  const enableProductOptions = Boolean(payload.enableProductOptions);
  const enableSize = Boolean(payload.enableSize);
  const enableQuantity = Boolean(payload.enableQuantity);

  const productOptions = (payload.productOptions || []).map((item, index) => ({
    id: item.id || `opt-${index + 1}`,
    label: (item.label || "").trim(),
    basePrice: ensureNumber(item.basePrice),
    multiplier: ensureNumber(item.multiplier, 1),
  }));

  const basePrice = ensureNumber(payload.basePrice);
  const multiplier = ensureNumber(payload.multiplier, 1);

  return {
    productType,
    enableProductOptions,
    productOptions,
    enableSize,
    enableQuantity,
    basePrice,
    multiplier,
  };
}

function validatePayload(payload: ReturnType<typeof normalizePayload>) {
  if (!payload.productType) {
    return "Product type is required";
  }

  if (payload.enableProductOptions) {
    if (payload.productOptions.length === 0) {
      return "At least one product option is required when options are enabled";
    }

    for (const option of payload.productOptions) {
      if (!option.label) {
        return "Each product option must have a label";
      }

      if (option.basePrice <= 0) {
        return "Each product option must have a base price greater than 0";
      }

      if (option.multiplier <= 0) {
        return "Each product option must have a multiplier greater than 0";
      }
    }
  } else {
    if (payload.basePrice <= 0) {
      return "Base price is required and must be greater than 0 when options are disabled";
    }

    if (payload.multiplier <= 0) {
      return "Multiplier is required and must be greater than 0 when options are disabled";
    }
  }

  return null;
}

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
    console.error("Error in GET admin pricing rules", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PricingRulePayload;
    const normalized = normalizePayload(body);
    const validationError = validatePayload(normalized);

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const result = await db.collection("pricing-rules").insertOne({
      ...normalized,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...normalized,
      },
    });
  } catch (error) {
    console.error("Error creating pricing rule", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as PricingRulePayload & { id?: string };
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing pricing rule id" },
        { status: 400 }
      );
    }

    const normalized = normalizePayload(body);
    const validationError = validatePayload(normalized);

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "main");

    const result = await db.collection("pricing-rules").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...normalized,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Pricing rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating pricing rule", error);
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

    const result = await db
      .collection("pricing-rules")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Pricing rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing rule", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
