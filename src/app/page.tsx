import { Suspense } from "react";
import { getListings } from "@/lib/listings";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import { Nav } from "@/components/Nav";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const { listings } = await getListings({
    q: params.q,
    category: params.category,
    minPrice: params.minPrice ? parseInt(params.minPrice, 10) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice, 10) : undefined,
  });

  const hasFilters = Boolean(params.q || params.category || params.minPrice || params.maxPrice);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Nav />
      <h1 className="mb-4 text-2xl font-semibold">Browse listings</h1>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-gray-100" />}>
        <SearchBar />
      </Suspense>
      {listings.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
        🔍
      </div>
      <p className="font-medium text-gray-700">
        {hasFilters ? "No listings match your filters" : "No listings yet"}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {hasFilters
          ? "Try adjusting your search or clearing filters."
          : "Be the first to post something."}
      </p>
    </div>
  );
}