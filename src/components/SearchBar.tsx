"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const CATEGORIES = ["textbooks", "furniture", "electronics", "clothing", "other"];

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function buildParams() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", String(Math.round(parseFloat(minPrice) * 100)));
    if (maxPrice) params.set("maxPrice", String(Math.round(parseFloat(maxPrice) * 100)));
    return params;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = buildParams();
    startTransition(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    });
  }

  function handleClear() {
    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilters = Boolean(q || category || minPrice || maxPrice);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-[160px] flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
        <input
          type="text"
          placeholder="Search listings..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="w-full sm:w-40">
        <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-28">
        <label className="mb-1 block text-xs font-medium text-gray-600">Min price</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="$0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="w-full sm:w-28">
        <label className="mb-1 block text-xs font-medium text-gray-600">Max price</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Any"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex w-full gap-2 sm:w-auto">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:flex-none"
        >
          {isPending ? "Applying..." : "Apply"}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 disabled:opacity-50 sm:flex-none"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}