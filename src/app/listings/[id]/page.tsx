import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Nav } from "@/components/Nav";
import { ListingChatSection } from "@/components/ListingChatSection";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await db.listing.findUnique({
    where: { id },
    include: { seller: { select: { id: true, name: true, image: true } } },
  });

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Nav />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          {listing.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 text-xl font-bold">${(listing.price / 100).toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-500">
            {listing.category} · {listing.condition}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-gray-700">{listing.description}</p>
          <p className="mt-4 text-sm text-gray-500">Seller: {listing.seller.name}</p>
          <ListingChatSection
            listingId={listing.id}
            sellerId={listing.seller.id}
            sellerName={listing.seller.name ?? "the seller"}
          />
        </div>
      </div>
    </div>
  );
}