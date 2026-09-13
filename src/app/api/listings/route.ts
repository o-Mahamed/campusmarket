import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getListings } from "@/lib/listings";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const result = await getListings({
    q: searchParams.get("q")?.trim() || undefined,
    category: searchParams.get("category") || undefined,
    condition: searchParams.get("condition") || undefined,
    minPrice: searchParams.get("minPrice")
      ? parseInt(searchParams.get("minPrice")!, 10)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!, 10)
      : undefined,
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined,
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, price, category, condition, images } = body;

  if (!title || !description || typeof price !== "number" || !category || !condition) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!Number.isInteger(price) || price <= 0) {
    return NextResponse.json(
      { error: "Price must be a positive integer, in cents" },
      { status: 400 }
    );
  }

  const listing = await db.listing.create({
    data: {
      title,
      description,
      price,
      category,
      condition,
      images: Array.isArray(images) ? images : [],
      sellerId: session.user.id,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}