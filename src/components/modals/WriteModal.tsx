"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import TipTapEditor from "../editor/TipTapEditor";

interface Collection {
  id: string;
  name: string;
}

interface WriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onSuccess?: () => void;
}

export default function WriteModal({
  isOpen,
  onClose,
  collections,
  onSuccess,
}: WriteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/writings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || "",
          collectionId: selectedCollection || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create write-up");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Write-up created successfully",
      });
      onClose();
      // Reset form
      setTitle("");
      setContent("");
      setSelectedCollection("");
      // Call onSuccess if provided
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error creating write-up:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create write-up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-fraunces">
            Write Something
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 space-y-4 flex-1 overflow-y-auto"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your writing a title"
                disabled={isLoading}
                className="border-gray-200 focus:border-gray-300 focus:ring-gray-300 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="collection"
                className="text-sm font-medium text-gray-700"
              >
                Collection (Optional)
              </label>
              <Select
                value={selectedCollection}
                onValueChange={setSelectedCollection}
              >
                <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:ring-gray-300">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <TipTapEditor content={content} onChange={setContent} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Write-up
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
