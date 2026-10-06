"use client";

import { useUser, useClerk } from "@clerk/nextjs";

export interface UserProfileInfo {
  displayName: string;
  avatarLetter: string;
  avatarUrl?: string;
  isGoogle: boolean;
  email: string;
  tierLabel: string;
  isLoaded: boolean;
  openUserProfile: () => void;
}

/**
 * Custom hook to retrieve user profile data according to authentication method:
 * - Google OAuth: Uses Google account profile image (DP) and full name.
 * - Email Login: Uses first character of email as DP (Avatar letter) and truncated email as display name.
 */
export function useUserProfile(): UserProfileInfo {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  const handleOpenProfile = () => {
    try {
      clerk.openUserProfile?.();
    } catch {
      // noop
    }
  };

  // If user is not yet loaded or not signed in via Clerk (e.g. local dev session)
  if (!isLoaded || !isSignedIn || !user) {
    return {
      displayName: "Anchor Commander",
      avatarLetter: "A",
      avatarUrl: undefined,
      isGoogle: false,
      email: "commander@anchor.io",
      tierLabel: "Executive Tier",
      isLoaded,
      openUserProfile: handleOpenProfile,
    };
  }

  // Check if the user authenticated with Google OAuth
  const googleAccount = user.externalAccounts?.find(
    (acc) =>
      acc.provider === "google" ||
      acc.verification?.strategy === "oauth_google"
  );
  const isGoogle = Boolean(googleAccount);

  const email = user.primaryEmailAddress?.emailAddress || "";
  const fullName =
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim();

  // Truncate email username for email logins (e.g. "alexander.vance" -> "alexander.va..." if > 14 chars)
  const emailPrefix = email ? email.split("@")[0] : "";
  const truncatedEmail =
    emailPrefix.length > 14
      ? `${emailPrefix.slice(0, 12)}...`
      : emailPrefix || "User";

  let displayName: string;
  let avatarUrl: string | undefined;
  let avatarLetter: string;

  if (isGoogle) {
    // Google Account: Profile picture from Google and full name of user
    displayName = fullName || truncatedEmail || "Google User";
    avatarUrl = googleAccount?.imageUrl || user.imageUrl || undefined;
    avatarLetter = (displayName || "G").charAt(0).toUpperCase();
  } else {
    // Email Account: First character of email as DP, truncated email as display name
    displayName = truncatedEmail;
    avatarUrl = undefined; // Force initial letter DP (no Google profile photo)
    avatarLetter = (email.charAt(0) || "U").toUpperCase();
  }

  return {
    displayName,
    avatarLetter,
    avatarUrl,
    isGoogle,
    email,
    tierLabel: isGoogle ? "Google Account" : "Executive Tier",
    isLoaded: true,
    openUserProfile: handleOpenProfile,
  };
}
