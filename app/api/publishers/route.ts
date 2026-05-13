import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Publisher from "../../lib/models/Publisher";

// GET /api/publishers
export async function GET() {
  try {
    await connectDB();

    const publishers = await Publisher.find().sort({ createdAt: -1 });

    return NextResponse.json(publishers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch publishers" },
      { status: 500 }
    );
  }
  
}

// POST /api/publishers (optional but useful)
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const publisher = await Publisher.create({
      name: body.name,
      source: body.source,
      verticals: body.verticals,
      status: body.status || "active",
    });

    return NextResponse.json(publisher);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create publisher" },
      { status: 500 }
    );
  }
}