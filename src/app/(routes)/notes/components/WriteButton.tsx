"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenLine, Sparkles, ChevronDown } from "lucide-react";
import WriteModal from "@/components/modals/WriteModal";
import AIWriteModal from "@/components/modals/AIWriteModal";

interface WriteButtonProps {
  collections: {
    id: string;
    name: string;
  }[];
}

export function WriteButton({ collections }: WriteButtonProps) {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isAIWriteModalOpen, setIsAIWriteModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            <PenLine className="w-4 h-4 mr-2" />
            Write Something
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => setIsWriteModalOpen(true)}
            className="cursor-pointer"
          >
            <PenLine className="w-4 h-4 mr-2" />
            Write Manually
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsAIWriteModalOpen(true)}
            className="cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        collections={collections}
      />

      <AIWriteModal
        isOpen={isAIWriteModalOpen}
        onClose={() => setIsAIWriteModalOpen(false)}
        collections={collections}
      />
    </>
  );
}
