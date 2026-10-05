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
