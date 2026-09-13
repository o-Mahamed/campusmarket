"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <Link href="/" className="text-lg font-semibold">
        CampusMarket
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {status === "loading" ? null : session ? (
          <>
            <span className="text-gray-600">Hi, {session.user?.name}</span>
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