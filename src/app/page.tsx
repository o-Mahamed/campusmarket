import { Suspense } from "react";
import { getListings } from "@/lib/listings";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import { Nav } from "@/components/Nav";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const { listings } = await getListings({
    q: params.q,
    category: params.category,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Nav />
      <h1 className="mb-4 text-2xl font-semibold">Browse listings</h1>
      <Suspense fallback={<div className="h-10" />}>
        <SearchBar />
      </Suspense>
      {listings.length === 0 ? (
        <p className="mt-8 text-gray-500">No listings found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}