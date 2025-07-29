"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EditWriteupModal from "./modals/EditWriteupModal";

interface Collection {
  id: string;
  name: string;
}

interface Writing {
  id: string;
  title: string;
  content: string;
  collections: Collection[];
  createdAt: Date;
  updatedAt: Date;
}

interface AutoOpenNoteProps {
  writings: Writing[];
  collections: Collection[];
}

export default function AutoOpenNote({
  writings,
  collections,
}: AutoOpenNoteProps) {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);

  useEffect(() => {
    const openWritingId = searchParams.get("open");

    if (openWritingId) {
      const writing = writings.find((w) => w.id === openWritingId);
      if (writing) {
        setSelectedWriting(writing);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, writings]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWriting(null);

    // Remove the 'open' parameter from URL without causing a page reload
    const url = new URL(window.location.href);
    url.searchParams.delete("open");
    window.history.replaceState({}, "", url.toString());
  };

  if (!selectedWriting) {
    return null;
  }

  return (
    <EditWriteupModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      writing={selectedWriting}
      collections={collections}
    />
  );
}
