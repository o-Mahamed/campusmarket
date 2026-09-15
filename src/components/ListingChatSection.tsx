"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChatWindow } from "@/components/ChatWindow";

interface ListingChatSectionProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
}

export function ListingChatSection({
  listingId,
  sellerId,
  sellerName,
}: ListingChatSectionProps) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        <Link href="/login" className="underline">
          Log in
        </Link>{" "}
        to message the seller.
      </p>
    );
  }

  if (session.user?.id === sellerId) {
    return <p className="mt-6 text-sm text-gray-500">This is your listing.</p>;
  }

  return <ChatWindow listingId={listingId} otherUserId={sellerId} otherUserName={sellerName} />;
}