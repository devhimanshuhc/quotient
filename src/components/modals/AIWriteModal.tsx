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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Send, FileText, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Collection {
  id: string;
  name: string;
}

interface AIWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onSuccess?: () => void;
}

export default function AIWriteModal({
  isOpen,
  onClose,
  collections,
  onSuccess,
}: AIWriteModalProps) {
  const [step, setStep] = useState<"prompt" | "review">("prompt");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Function to clean AI-generated content
  const cleanAIContent = (content: string): string => {
    let cleaned = content;

    // Remove excessive empty paragraphs and line breaks
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");
    cleaned = cleaned.replace(/<p>\s*&nbsp;\s*<\/p>/g, "");
    cleaned = cleaned.replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>");

    // Remove empty list items
    cleaned = cleaned.replace(/<li>\s*<\/li>/g, "");
    cleaned = cleaned.replace(/<li>\s*&nbsp;\s*<\/li>/g, "");

    // Remove empty ul/ol tags
    cleaned = cleaned.replace(/<ul>\s*<\/ul>/g, "");
    cleaned = cleaned.replace(/<ol>\s*<\/ol>/g, "");

    // Remove trailing and leading whitespace from list items
    cleaned = cleaned.replace(/<li>\s+/g, "<li>");
    cleaned = cleaned.replace(/\s+<\/li>/g, "</li>");

    // Remove trailing and leading whitespace from paragraphs
    cleaned = cleaned.replace(/<p>\s+/g, "<p>");
    cleaned = cleaned.replace(/\s+<\/p>/g, "</p>");

    // Remove multiple consecutive spaces
    cleaned = cleaned.replace(/\s{2,}/g, " ");

    // Clean up any malformed HTML
    cleaned = cleaned.replace(/<([^>]+)>\s*<\/\1>/g, "");

    return cleaned.trim();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate content",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate content");
      }

      const data = await response.json();

      // Clean the generated content before setting it
      const cleanedContent = cleanAIContent(data.content);
      setGeneratedContent(cleanedContent);

      // Auto-generate a title from the prompt
      const promptWords = prompt.trim().split(" ");
      const autoTitle =
        promptWords.length > 6
          ? promptWords.slice(0, 6).join(" ") + "..."
          : prompt.trim();
      setTitle(autoTitle);

      setStep("review");

      toast({
        title: "Success",
        description: "AI content generated successfully!",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/writings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: generatedContent,
          collectionId: selectedCollection || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create write-up");
      }

      toast({
        title: "Success",
        description: "AI-generated write-up created successfully",
      });

      // Reset form
      setStep("prompt");
      setPrompt("");
      setTitle("");
      setGeneratedContent("");
      setSelectedCollection("");

      onClose();
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
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setStep("prompt");
  };

  const handleClose = () => {
    setStep("prompt");
    setPrompt("");
    setTitle("");
    setGeneratedContent("");
    setSelectedCollection("");
    onClose();
  };

  const promptSuggestions = [
    "Write a comprehensive guide about productivity tips for remote workers",
    "Create a detailed explanation of blockchain technology for beginners",
    "Write a creative story about a time traveler who visits ancient civilizations",
    "Explain the benefits and techniques of mindfulness meditation",
    "Create a step-by-step tutorial for learning a new programming language",
    "Write about the history and cultural impact of jazz music",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-0 bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {step === "prompt" ? "Generate with AI" : "Review & Save"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "prompt" ? (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="prompt"
                    className="text-sm font-medium text-gray-700"
                  >
                    What would you like me to write about?
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what kind of content you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                    disabled={isGenerating}
                  />
                </div>

                {/* Prompt Suggestions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Quick suggestions:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(suggestion)}
                        disabled={isGenerating}
                        className="text-left text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors disabled:opacity-50 border border-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isGenerating}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
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
                    placeholder="Give your AI-generated writing a title"
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  <label className="text-sm font-medium text-gray-700">
                    Generated Content Preview
                  </label>
                  <div
                    className="max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                  />
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSaving}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSaving}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !title.trim()}
                      className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Write-up
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
