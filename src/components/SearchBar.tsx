"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, FolderOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/hooks/useSearch";
import { format } from "date-fns";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { query, results, isLoading, updateQuery, clearSearch } =
    useSearch(300);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }

      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (type: "writing" | "collection", id: string) => {
    if (type === "writing") {
      // Navigate to notes page with the specific writing ID as a query parameter
      router.push(`/notes?open=${id}`);
    } else {
      // Navigate to collection page
      router.push(`/collections/${id}`);
    }
    setIsOpen(false);
    setIsFocused(false);
    clearSearch();
  };

  const showResults = isOpen && (query.length >= 2 || results.total > 0);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search notes and collections... (⌘K)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (query.length > 0) setIsOpen(true);
          }}
          className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full 
                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 
                   focus:border-transparent transition-all duration-200"
        />

        {/* Clear button */}
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 
                     rounded-xl shadow-lg max-h-96 overflow-y-auto z-50"
          >
            {isLoading && query.length >= 2 ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            ) : results.total === 0 && query.length >= 2 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  No results found for "{query}"
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Collections */}
                {results.collections.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Collections ({results.collections.length})
                    </div>
                    {results.collections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() =>
                          handleResultClick("collection", collection.id)
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <FolderOpen className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {collection.name}
                            </p>
                            {collection.description && (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {collection.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {collection._count.writings}{" "}
                                {collection._count.writings === 1
                                  ? "note"
                                  : "notes"}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                {format(
                                  new Date(collection.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Writings */}
                {results.writings.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Notes ({results.writings.length})
                    </div>
                    {results.writings.map((writing) => (
                      <button
                        key={writing.id}
                        onClick={() => handleResultClick("writing", writing.id)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <FileText className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {writing.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {writing.preview}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {writing.collections.length > 0 && (
                                <>
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {writing.collections[0].name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                </>
                              )}
                              <span className="text-xs text-gray-400">
                                {format(
                                  new Date(writing.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
