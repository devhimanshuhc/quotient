'use client';

import PageTransition from "@/components/animations/PageTransition";
import { BookOpen, FileText, Loader, Loader2, PenLine, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DashboardData } from "@/types/dashboard";
import { useState, useEffect } from "react";
import CreateCollectionModal from "@/components/modals/CreateCollectionModal";
import WriteModal from "@/components/modals/WriteModal";
import { useToast } from "@/hooks/use-toast";
import { useSession } from 'next-auth/react';

async function getDashboardData(): Promise<DashboardData> {
 
  try {
    const res = await fetch(`/api/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      collections: { total: 0, items: [] },
      writings: { total: 0 },
      recentActivity: []
    };
  }
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    collections: { total: 0, items: [] },
    writings: { total: 0 },
    recentActivity: []
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen p-4 bg-gray-50/30">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-xl bg-gray-900 p-8 text-white">
            <div className="relative z-10">
              <h1 className="text-3xl font-semibold font-fraunces">Welcome back, {session?.user?.name}!</h1>
              <p className="mt-2 text-gray-200">Manage your collections and write-ups.</p>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Write Something Button */}
                <button 
                  onClick={() => setIsWriteModalOpen(true)}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 w-full text-left"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-50 opacity-0 transition-all group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-lg bg-gray-50 p-3 text-gray-900">
                      <PenLine className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Write Something</h3>
                    <p className="mt-2 text-sm text-gray-600">Share your thoughts and ideas</p>
                  </div>
                </button>

                {/* Create New Collection Button */}
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 w-full text-left"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-50 opacity-0 transition-all group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-lg bg-gray-50 p-3 text-gray-900">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Create Collection</h3>
                    <p className="mt-2 text-sm text-gray-600">Start organizing your write-ups</p>
                  </div>
                </button>
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recently Updated</h2>
                  <Link href="/collections" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 animate-pulse" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
                            <div className="h-3 bg-gray-50 rounded animate-pulse w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : data.recentActivity.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <div className="mx-auto w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h3>
                      <p className="text-sm text-gray-500">Create your first collection to get started!</p>
                    </div>
                  ) : (
                    data.recentActivity.map((activity) => (
                      <div key={activity.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center">
                            {activity.collection ? (
                              <BookOpen className="h-6 w-6 text-gray-600" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <span className="text-xs text-gray-500">
                                {format(new Date(activity.updatedAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {activity.collection ? (
                                <>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                    Collection
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    in {activity.collection}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                  Write-up
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards - Right Column */}
            <div className="lg:col-span-4 space-y-4">
              {/* Total Collections */}
              <button
                onClick={() => router.push('/collections')}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 w-full text-left"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-50 opacity-0 transition-all group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 inline-flex rounded-lg bg-gray-50 p-3 text-gray-900">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Collections</h3>
                  <div className="mt-2">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-gray-900">{data.collections.total}</p>
                        <span className="text-sm text-gray-500">collections</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Total Writeups */}
              <button
                onClick={() => router.push('/notes')}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200 w-full text-left"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-50 opacity-0 transition-all group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 inline-flex rounded-lg bg-gray-50 p-3 text-gray-900">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Writeups</h3>
                  <div className="mt-2">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-gray-900">{data.writings.total}</p>
                        <span className="text-sm text-gray-500">writeups</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <CreateCollectionModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchData();
          }}
        />

        <WriteModal
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          collections={data.collections.items}
          onSuccess={() => {
            setIsWriteModalOpen(false);
            fetchData();
          }}
        />
      </main>
    </PageTransition>
  );
}
