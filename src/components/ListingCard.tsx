import Link from "next/link";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    condition: string;
    images: string[];
    seller: { name: string | null };
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md"
    >
      <div className="aspect-square w-full bg-gray-100">
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
      <div className="p-3">
        <p className="truncate font-medium">{listing.title}</p>
        <p className="text-sm text-gray-500">
          {listing.category} · {listing.condition}
        </p>
        <p className="mt-1 font-semibold">${(listing.price / 100).toFixed(2)}</p>
        <p className="text-xs text-gray-400">{listing.seller.name}</p>
      </div>
    </Link>
  );
}