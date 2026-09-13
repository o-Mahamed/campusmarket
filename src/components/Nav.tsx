"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-y-2 border-b border-gray-200 pb-4">
      <Link href="/" className="text-lg font-semibold">
        CampusMarket
      </Link>
      <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
        {status === "loading" ? null : session ? (
          <>
            <span className="hidden text-gray-600 sm:inline">Hi, {session.user?.name}</span>
            <Link href="/listings/new" className="rounded-md bg-black px-3 py-1.5 text-white">
              + New listing
            </Link>
            <button onClick={() => signOut()} className="text-gray-600 underline">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="underline">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-black px-3 py-1.5 text-white">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}