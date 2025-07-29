"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface AIPromptModalProps {
  onContentGenerated: (content: string) => void;
  currentContent?: string;
}

export default function AIPromptModal({
  onContentGenerated,
  currentContent,
}: AIPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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
          context: currentContent
            ? `Current note content: ${currentContent}`
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate content");
      }

      const data = await response.json();

      // Clean the generated content before passing it to the callback
      const cleanedContent = cleanAIContent(data.content);
      onContentGenerated(cleanedContent);
      setPrompt("");
      setIsOpen(false);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const promptSuggestions = [
    "Write a comprehensive guide about...",
    "Create a summary of...",
    "List the key points about...",
    "Explain the concept of...",
    "Compare and contrast...",
    "Write a step-by-step tutorial for...",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
          AI Generate
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 bg-white overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Content Generator
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
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
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none border-gray-200 focus:border-purple-300 focus:ring-purple-300"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              Tip: Press Ctrl+Enter (or Cmd+Enter) to generate
            </p>
          </div>

          {/* Prompt Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  disabled={isGenerating}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50"
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
              onClick={() => setIsOpen(false)}
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
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </motion.div>
                ) : (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Generate
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
