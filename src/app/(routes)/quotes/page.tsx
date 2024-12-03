'use client';

import PageTransition from '@/components/animations/PageTransition';
import RequireAuth from "@/components/auth/RequireAuth";

export default function QuotesPage() {
  return (
    <RequireAuth>
      <PageTransition>
        <main className="min-h-screen pt-24 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold font-fraunces">Quotes</h1>
            {/* Add your quotes content here */}
          </div>
        </main>
      </PageTransition>
    </RequireAuth>
  );
}
