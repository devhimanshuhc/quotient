import { useState, useEffect, useCallback, useRef } from "react";

interface SearchResult {
  writings: Array<{
    id: string;
    title: string;
    preview: string;
    createdAt: string;
    collections: Array<{ id: string; name: string }>;
    type: "writing";
  }>;
  collections: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    _count: { writings: number };
    type: "collection";
  }>;
  total: number;
}

export function useSearch(delay: number = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    writings: [],
    collections: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({ writings: [], collections: [], total: 0 });
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResult = await response.json();
      setResults(data);
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults({ writings: [], collections: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since we're not using any external values

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [query, delay, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim().length >= 2) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setQuery("");
    setResults({ writings: [], collections: [], total: 0 });
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    query,
    results,
    isLoading,
    error,
    updateQuery,
    clearSearch,
  };
}
