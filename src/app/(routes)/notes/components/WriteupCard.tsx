'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditWriteupModal from '@/components/modals/EditWriteupModal';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';
import { Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

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
}

interface WriteupCardProps {
  writing: Writing;
  collections: Collection[];
}

export function WriteupCard({ writing, collections }: WriteupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [contentPreview, setContentPreview] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const getContentPreview = (content: string) => {
      if (typeof window !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(content);
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        return textContent.length > 150 ? textContent.slice(0, 150) + '...' : textContent;
      }
      return '';
    };

    setContentPreview(getContentPreview(writing.content));
  }, [writing.content]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/writings/${writing.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete write-up');
      }

      toast({
        title: "Success",
        description: "Write-up deleted successfully",
      });

      router.refresh();
    } catch (error) {
      console.error('Error deleting write-up:', error);
      toast({
        title: "Error",
        description: "Failed to delete write-up",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening edit modal when clicking delete button
    if ((e.target as HTMLElement).closest('.delete-button')) {
      e.stopPropagation();
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col relative group"
          onClick={handleCardClick}
        >
          {hasUnsavedChanges && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" 
                 title="Unsaved Changes">
            </div>
          )}

          {/* Delete Button */}
          <Button
            variant="outline"
            size="icon"
            className="delete-button absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-white hover:bg-red-50 hover:text-red-600 border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 pr-8">
              {writing.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-4">
              {contentPreview}
            </p>
          </div>
          
          <div className="mt-auto">
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
            <div className="text-xs text-gray-500">
              {format(new Date(writing.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        </Card>
      </motion.div>
      
      <EditWriteupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        writing={writing}
        collections={collections}
        onUnsavedChanges={setHasUnsavedChanges}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Write-up</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{writing.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              {isDeleting && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
