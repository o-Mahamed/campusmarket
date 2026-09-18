"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-y-2 border-b border-mist pb-4">
      <Link href="/" className="font-heading text-xl font-semibold text-pine">
        CampusMarket
      </Link>
      <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
        {status === "loading" ? null : session ? (
          <>
            <span className="hidden text-ink/60 sm:inline">Hi, {session.user?.name}</span>
            <Link
              href="/account"
              className="text-ink/70 underline decoration-mist underline-offset-2 hover:text-pine"
            >
              Payouts
            </Link>
            <Link
              href="/listings/new"
              className="rounded-md bg-pine px-3 py-1.5 text-white transition hover:bg-pine-dark"
            >
              + New listing
            </Link>
            <button
              onClick={() => signOut()}
              className="text-ink/70 underline decoration-mist underline-offset-2 hover:text-pine"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-ink/70 underline decoration-mist underline-offset-2 hover:text-pine"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-gold px-3 py-1.5 font-medium text-ink transition hover:brightness-95"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}