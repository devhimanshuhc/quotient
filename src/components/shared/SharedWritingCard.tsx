"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import { Eye, Edit3, ExternalLink, User } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface SharedWritingCardProps {
  writing: SharedWriting;
}

export function SharedWritingCard({ writing }: SharedWritingCardProps) {
  const [contentPreview, setContentPreview] = useState("");
  const router = useRouter();

  // Extract plain text preview from HTML content
  useEffect(() => {
    if (writing.content) {
      const cleanContent = DOMPurify.sanitize(writing.content, {
        ALLOWED_TAGS: [],
      });
      const preview =
        cleanContent.length > 150
          ? cleanContent.substring(0, 150) + "..."
          : cleanContent;
      setContentPreview(preview || "No content yet...");
    } else {
      setContentPreview("No content yet...");
    }
  }, [writing.content]);

  const handleOpenWriting = () => {
    router.push(`/edit/${writing.id}`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "EDITOR":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "EDITOR":
        return <Edit3 className="h-3 w-3 mr-1" />;
      case "VIEWER":
        return <Eye className="h-3 w-3 mr-1" />;
      case "OWNER":
        return <Edit3 className="h-3 w-3 mr-1" />;
      default:
        return <Eye className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col relative group"
        onClick={handleOpenWriting}
      >
        {/* Action Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white hover:bg-blue-50 hover:text-blue-600 border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenWriting();
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1">
          {/* Header with Role Badge */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold line-clamp-2 pr-8">
              {writing.title}
            </h3>
            <Badge
              variant={getRoleBadgeVariant(writing.myRole)}
              className="ml-2 flex-shrink-0"
            >
              {getRoleIcon(writing.myRole)}
              {writing.myRole}
            </Badge>
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Shared by {writing.owner.name || writing.owner.email}</span>
          </div>

          {/* Content Preview */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-4">
            {contentPreview}
          </p>
        </div>

        <div className="mt-auto">
          {/* Collections */}
          {writing.collections.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {writing.collections.map((collection) => (
                <span
                  key={collection.id}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                >
                  {collection.name}
                </span>
              ))}
            </div>
          )}

          {/* Dates */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              Joined {format(new Date(writing.joinedAt), "MMM d, yyyy")}
            </span>
            <span>
              Updated {format(new Date(writing.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
