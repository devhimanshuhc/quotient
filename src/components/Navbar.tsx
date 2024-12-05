'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuotientLogo from './QuotientLogo';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, LogOut, Menu, Settings, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load user profile image');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={toggleMenu}
                className="p-1.5 rounded-lg border-none hover:bg-gray-100 transition-colors lg:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Logo */}
              <Link 
                href="/" 
                className="group relative hover:opacity-80 transition-opacity"
              >
                <QuotientLogo />
              </Link>
            </div>

            {/* Auth Button */}
            {status === 'loading' ? (
              <div className="w-32 h-10 animate-pulse bg-gray-100 rounded-full" />
            ) : session ? (
              <motion.div
                className="flex items-center gap-2 lg:gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
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
                            alt={session.user.name || 'User'}
                            className="rounded-full ring-2 ring-white object-cover"
                            fill
                            sizes="28px"
                            onError={handleImageError}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white">
                          <span className="text-sm font-medium text-gray-600">
                            {session.user?.name?.[0]?.toUpperCase() || 'U'}
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
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoading ? 'Signing out...' : 'Sign out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.button
                className="px-4 py-2 text-sm font-medium text-gray-900 rounded-full border border-gray-200 hover:border-gray-900 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/sign-in')}
              >
                Sign in
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40",
          isMenuOpen ? "block" : "hidden"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMenuOpen ? 1 : 0 }}
        onClick={toggleMenu}
      />

      {/* Mobile Menu Content */}
      <motion.div
        className={cn(
          "fixed top-[65px] left-0 bottom-0 w-64 bg-white z-40 border-r border-gray-100 transform transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        initial={{ x: "-100%" }}
        animate={{ x: isMenuOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col p-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={toggleMenu}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            href="/blogs" 
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={toggleMenu}
          >
            <User className="h-4 w-4" />
            Blogs
          </Link>
          <Link 
            href="/settings" 
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={toggleMenu}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </motion.div>
    </>
  );
}
