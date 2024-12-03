'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Quote,
  Settings,
  Users,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const SIDEBAR_STATE_CHANGE = 'sidebarStateChange';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Collections',
    href: '/collections',
    icon: BookOpen,
  },
  // {
  //   title: 'Quotes',
  //   href: '/quotes',
  //   icon: Quote,
  // },
  {
    title: 'Notes',
    href: '/notes',
    icon: FileText,
  },
  {
    title: 'Shared',
    href: '/shared',
    icon: Users,
    badge: {
      text: 'Coming Soon',
      className: 'bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2'
    }
  },
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  // },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const event = new CustomEvent(SIDEBAR_STATE_CHANGE, { 
      detail: { isCollapsed } 
    });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "256px",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed left-0 h-screen border-r border-gray-200 bg-white transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-8 pt-20">
            {/* Logo and Toggle */}
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-bold font-fraunces"
                >
                  Quotient
                </motion.span>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-lg px-3 py-2 transition-all duration-200 hover:bg-gray-100',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      <Icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
                      )} />
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className={item.badge.className}>
                              {item.badge.text}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            className="group flex items-center rounded-lg px-3 py-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
          >
            <div className="flex items-center gap-x-3">
              <LogOut className="h-5 w-5 text-gray-500 group-hover:text-gray-900" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign Out
                </motion.span>
              )}
            </div>
          </button>
        </div>
      </motion.div>
      
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
