import { Prisma, ListingStatus } from "@prisma/client";
import { db } from "@/lib/db";

export interface ListingFilters {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function getListings(filters: ListingFilters) {
  const { q, category, condition, minPrice, maxPrice } = filters;
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  if (q) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`status = 'ACTIVE'`,
      Prisma.sql`search_vector @@ websearch_to_tsquery('english', ${q})`,
    ];
    if (category) conditions.push(Prisma.sql`category = ${category}`);
    if (condition) conditions.push(Prisma.sql`condition = ${condition}`);
    if (minPrice) conditions.push(Prisma.sql`price >= ${minPrice}`);
    if (maxPrice) conditions.push(Prisma.sql`price <= ${maxPrice}`);

    const whereClause = Prisma.join(conditions, " AND ");

    const ranked = await db.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "Listing"
      WHERE ${whereClause}
      ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', ${q})) DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const ids = ranked.map((r) => r.id);
    if (ids.length === 0) return { listings: [], page, limit };

    const listings = await db.listing.findMany({
      where: { id: { in: ids } },
      include: { seller: { select: { id: true, name: true, image: true } } },
    });

    const byId = new Map(listings.map((l) => [l.id, l]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));

    return { listings: ordered, page, limit };
  }

  const where: Prisma.ListingWhereInput = { status: ListingStatus.ACTIVE };
  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  const listings = await db.listing.findMany({
    where,
    include: { seller: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return { listings, page, limit };
}