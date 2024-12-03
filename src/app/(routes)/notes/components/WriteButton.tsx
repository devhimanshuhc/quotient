'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import WriteModal from '@/components/modals/WriteModal';

interface WriteButtonProps {
  collections: {
    id: string;
    name: string;
  }[];
}

export function WriteButton({ collections }: WriteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <PenLine className="w-4 h-4" />
        Write Something
      </Button>
      <WriteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collections={collections}
      />
    </>
  );
}
