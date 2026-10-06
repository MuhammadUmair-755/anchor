/**
 * Unified client-side API fetch utility with error resilience and type safety.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      console.warn(`[API] ${endpoint} returned ${res.status}: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API] ${endpoint} request failed:`, err);
    return null;
  }
}

/**
 * Strict variant for writes and pages that must show real data: throws with the
 * server's error message instead of returning null, so failures are never hidden
 * behind mock fallbacks.
 */
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body && (body.error || body.message)) || `Request failed (${res.status})`);
  }
  return body as T;
}
