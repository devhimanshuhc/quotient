"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, FolderOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/hooks/useSearch";
import { format } from "date-fns";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchModal({
  isOpen,
  onClose,
}: MobileSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { query, results, isLoading, updateQuery, clearSearch } =
    useSearch(300);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuery(e.target.value);
  };

  const handleResultClick = (type: "writing" | "collection", id: string) => {
    if (type === "writing") {
      router.push(`/notes?open=${id}`);
    } else {
      router.push(`/collections/${id}`);
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-20 left-4 right-4 bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notes and collections..."
                value={query}
                onChange={handleInputChange}
                className="flex-1 text-base bg-transparent border-0 outline-none placeholder-gray-500"
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && query.length >= 2 ? (
                <div className="p-6 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-3" />
                  <span className="text-gray-500">Searching...</span>
                </div>
              ) : results.total === 0 && query.length >= 2 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No results found for "{query}"
                  </p>
                </div>
              ) : query.length < 2 ? (
                <div className="p-6 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Start typing to search your notes and collections
                  </p>
                </div>
              ) : (
                <div>
                  {/* Collections */}
                  {results.collections.length > 0 && (
                    <div>
                      <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                        Collections ({results.collections.length})
                      </div>
                      {results.collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() =>
                            handleResultClick("collection", collection.id)
                          }
                          className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <FolderOpen className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {collection.name}
                              </p>
                              {collection.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {collection.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
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
                      <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                        Notes ({results.writings.length})
                      </div>
                      {results.writings.map((writing) => (
                        <button
                          key={writing.id}
                          onClick={() =>
                            handleResultClick("writing", writing.id)
                          }
                          className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <FileText className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {writing.title}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                {writing.preview}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {writing.collections.length > 0 && (
                                  <>
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
