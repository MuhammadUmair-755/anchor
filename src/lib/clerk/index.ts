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
