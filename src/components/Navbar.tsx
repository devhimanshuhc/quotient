"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import QuotientLogo from "./QuotientLogo";
import SearchBar from "./SearchBar";
import MobileSearchModal from "./MobileSearchModal";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Home,
  LogOut,
  Settings,
  User,
  Search,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Only show search on authenticated routes (not home or blogs)
  const shouldShowSearch =
    session && pathname !== "/" && !pathname.startsWith("/blogs");

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    console.error("Failed to load user profile image");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="group relative hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <QuotientLogo />
          </Link>

          {/* Search Bar - Only show for authenticated users on desktop and not on home/blogs */}
          {shouldShowSearch && (
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <SearchBar />
            </div>
          )}

          {/* Auth Button */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {status === "loading" ? (
              <div className="w-32 h-10 animate-pulse bg-gray-100 rounded-full" />
            ) : session ? (
              <motion.div
                className="flex items-center gap-2 lg:gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Mobile Search Button - Only show if search should be available */}
                {shouldShowSearch && (
                  <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="h-5 w-5 text-gray-600" />
                  </button>
                )}

                {/* Mobile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      {session.user?.image && !imageError ? (
                        <motion.div
                          className="relative w-7 h-7"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="rounded-full ring-2 ring-white object-cover"
                            fill
                            sizes="28px"
                            onError={handleImageError}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white">
                          <span className="text-sm font-medium text-gray-600">
                            {session.user?.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                        {session.user?.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoading ? "Signing out..." : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.button
                className="px-4 py-2 text-sm font-medium text-gray-900 rounded-full border border-gray-200 hover:border-gray-900 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/sign-in")}
              >
                Sign in
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal - Only show if search should be available */}
      {shouldShowSearch && (
        <MobileSearchModal
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
        />
      )}
    </motion.nav>
  );
}
