'use client';

import { Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import PageTransition from '@/components/animations/PageTransition';
import RequireAuth from "@/components/auth/RequireAuth";
import CreateCollectionModal from "@/components/modals/CreateCollectionModal";
import { useToast } from "@/hooks/use-toast"
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CollectionsByDate {
  [date: string]: Collection[];
}

export default function CollectionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCollectionId, setLoadingCollectionId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCollectionCreated = () => {
    fetchCollections();
  };

  const groupCollectionsByDate = (collections: Collection[]): CollectionsByDate => {
    return collections.reduce((acc: CollectionsByDate, collection) => {
      const date = format(new Date(collection.createdAt), 'MMMM d, yyyy');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(collection);
      return acc;
    }, {});
  };

  const collectionsByDate = groupCollectionsByDate(collections);
  const sortedDates = Object.keys(collectionsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <RequireAuth>
      <PageTransition>
        <main className="min-h-screen px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold font-fraunces">Collections</h1>
                <p className="mt-2 text-gray-200 max-w-xl">Organize and manage your creative work in collections.</p>
              </div>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            </div>

            {/* Create Collection Button */}
            <motion.button 
              onClick={handleCreateCollection}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 transition-all hover:shadow-lg hover:border-gray-300 w-full text-left"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-50 opacity-0 transition-all group-hover:opacity-100" />
              <div className="relative flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="inline-flex rounded-lg bg-gray-100 p-4 text-gray-600 group-hover:bg-gray-200 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Create New Collection</h3>
                  <p className="text-sm text-gray-500 mt-1">Start organizing your creative work</p>
                </div>
              </div>
            </motion.button>

            {/* All Collections */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-fraunces">All Collections</h2>
              
              {isLoading ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">No collections yet. Create your first collection!</p>
                </div>
              ) : (
                <div className="space-y-16">
                  {sortedDates.map((date, dateIndex) => (
                    <motion.div 
                      key={date} 
                      className="space-y-6 pb-20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: dateIndex * 0.1 }}
                    >
                      <div className=" py-2">
                        <h3 className="text-lg font-medium text-gray-900">{date}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collectionsByDate[date].map((collection, index) => (
                          <div 
                            key={collection.id}
                            onClick={() => {
                              setLoadingCollectionId(collection.id);
                              router.push(`/collections/${collection.id}`);
                            }}
                            className="block cursor-pointer"
                          >
                            <motion.div
                              whileHover={{ y: -5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg">
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-50 opacity-0 transition-all group-hover:opacity-100" />
                                <div className="relative space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900">{collection.name}</h4>
                                    {loadingCollectionId === collection.id && (
                                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                    )}
                                  </div>
                                  {collection.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2">{collection.description}</p>
                                  )}
                                  <div className="pt-2 text-xs text-gray-400 border-t border-gray-100">
                                    {format(new Date(collection.createdAt), 'h:mm a')}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CreateCollectionModal 
            isOpen={isCreateModalOpen} 
            onClose={handleCloseModal}
            onSuccess={handleCollectionCreated}
          />
        </main>
      </PageTransition>
    </RequireAuth>
  );
}
