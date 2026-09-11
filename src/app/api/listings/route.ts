import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, ListingStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const condition = searchParams.get("condition");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  if (q) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`status = 'ACTIVE'`,
      Prisma.sql`search_vector @@ websearch_to_tsquery('english', ${q})`,
    ];
    if (category) conditions.push(Prisma.sql`category = ${category}`);
    if (condition) conditions.push(Prisma.sql`condition = ${condition}`);
    if (minPrice) conditions.push(Prisma.sql`price >= ${parseInt(minPrice, 10)}`);
    if (maxPrice) conditions.push(Prisma.sql`price <= ${parseInt(maxPrice, 10)}`);

    const whereClause = Prisma.join(conditions, " AND ");

    const ranked = await db.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "Listing"
      WHERE ${whereClause}
      ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', ${q})) DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const ids = ranked.map((r) => r.id);
    if (ids.length === 0) {
      return NextResponse.json({ listings: [], page, limit });
    }

    const listings = await db.listing.findMany({
      where: { id: { in: ids } },
      include: { seller: { select: { id: true, name: true, image: true } } },
    });

    const byId = new Map(listings.map((l) => [l.id, l]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

    return NextResponse.json({ listings: ordered, page, limit });
  }

  const where: Prisma.ListingWhereInput = { status: ListingStatus.ACTIVE };
  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice, 10);
    if (maxPrice) where.price.lte = parseInt(maxPrice, 10);
  }

  const listings = await db.listing.findMany({
    where,
    include: { seller: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return NextResponse.json({ listings, page, limit });
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