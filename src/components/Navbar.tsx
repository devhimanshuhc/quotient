'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuotientLogo from './QuotientLogo';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
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

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="group relative hover:opacity-80 transition-opacity"
          >
            <QuotientLogo />
          </Link>

          {/* Auth Button */}
          {status === 'loading' ? (
            <div className="w-32 h-10 animate-pulse bg-gray-100 rounded-full" />
          ) : session ? (
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-gray-50">
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
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <motion.button
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-full border border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign out'
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              className="px-5 py-2 text-sm font-medium text-gray-900 rounded-full border border-gray-200 hover:border-gray-900 transition-colors"
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
  );
}
