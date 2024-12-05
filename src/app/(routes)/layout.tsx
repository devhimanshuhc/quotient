'use client';

import Sidebar from "@/components/dashboard/Sidebar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setIsCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main 
        className={cn(
          "min-h-screen bg-gray-50 transition-all duration-200",
          "pt-20 px-4",
          "lg:pt-24 lg:px-8",
          {
            "lg:pl-24": isCollapsed,
            "lg:pl-72": !isCollapsed
          }
        )}
      >
        {children}
      </main>
    </div>
  );
}
