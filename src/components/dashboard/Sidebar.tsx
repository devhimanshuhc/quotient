"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChartBar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Menu,
  Quote,
  Settings,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const SIDEBAR_STATE_CHANGE = "sidebarStateChange";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: {
    text: string;
    className: string;
  };
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Notes",
    href: "/notes",
    icon: FileText,
  },
  {
    title: "Collections",
    href: "/collections",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: ChartBar,
  },
  {
    title: "Shared",
    href: "/shared",
    icon: Users,
  },
  // {
  //   title: 'Quotes',
  //   href: '/quotes',
  //   icon: Quote,
  // },
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  // },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const event = new CustomEvent(SIDEBAR_STATE_CHANGE, {
      detail: { isCollapsed },
    });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
      >
        <Menu className="h-5 w-5" />
      </button>

      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "256px",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed left-0 h-screen border-r border-gray-200 bg-white transition-all duration-300 z-40",
          isCollapsed ? "w-20" : "w-64",
          // Desktop: Always visible
          "hidden lg:block",
          // Mobile: Show/hide based on menu state
          isMobileMenuOpen ? "block" : "hidden"
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
                      "group flex items-center rounded-lg px-3 py-2 transition-all duration-200 hover:bg-gray-100",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-900"
                        )}
                      />
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
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
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
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
