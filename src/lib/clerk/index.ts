import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Returns the current authenticated user session on the server.
 */
export async function getSession() {
  return await auth();
}

/**
 * Returns the current user profile on the server.
 */
export async function getCurrentUser() {
  return await currentUser();
}

/**
 * Returns the current JWT access token for the authenticated session.
 * Used for communicating with protected backend services, Supabase, or external APIs.
 *
 * @param template Optional Clerk JWT template name if configured in Clerk Dashboard
 */
export async function getAuthToken(template?: string) {
  const session = await auth();
  if (!session.userId) return null;
  return await session.getToken(template ? { template } : undefined);
}

/**
 * Asserts the request is authenticated on the server.
 * Throws an Error if no valid session JWT is present.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized: Active session required");
  }
  return session;
}
