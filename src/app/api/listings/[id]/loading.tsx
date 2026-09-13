export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 h-12 animate-pulse rounded-md bg-gray-100" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-100" />
        <div className="space-y-3">
          <div className="h-7 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-6 w-1/4 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}