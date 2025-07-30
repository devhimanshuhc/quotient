"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2 } from "lucide-react";
import { SharedWritingCard } from "@/components/shared/SharedWritingCard";

interface Collection {
  id: string;
  name: string;
}

interface Owner {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface SharedWriting {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  owner: Owner;
  myRole: "OWNER" | "EDITOR" | "VIEWER";
  joinedAt: Date;
  lastActive?: Date;
  collections: Collection[];
}

export default function SharedPage() {
  const [sharedWritings, setSharedWritings] = useState<SharedWriting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedWritings();
  }, []);

  const fetchSharedWritings = async () => {
    try {
      const response = await fetch("/api/shared");
      if (response.ok) {
        const data = await response.json();
        setSharedWritings(data.sharedWritings || []);
      } else {
        setError("Failed to fetch shared writings");
      }
    } catch (error) {
      console.error("Error fetching shared writings:", error);
      setError("Failed to fetch shared writings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="text-gray-500">Loading shared writings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4">
          <Users className="w-8 h-8 text-red-500 mx-auto" />
          <h1 className="text-2xl font-medium text-gray-900">Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (sharedWritings.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <motion.div
            className="inline-flex p-4 bg-gray-50 rounded-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Users className="w-8 h-8 text-gray-600" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-medium text-gray-900">
            No Shared Writings Yet
          </h1>

          {/* Description */}
          <p className="text-gray-500 max-w-md mx-auto">
            When someone adds you as a collaborator to their writing, it will
            appear here. You'll be able to view and edit shared documents based
            on your permissions.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">Shared With Me</h1>
          </div>
          <p className="text-gray-600">
            Writings that have been shared with you as a collaborator (
            {sharedWritings.length})
          </p>
        </div>

        {/* Shared Writings Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {sharedWritings.map((writing, index) => (
            <motion.div
              key={writing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SharedWritingCard writing={writing} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
