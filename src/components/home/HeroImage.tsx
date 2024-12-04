'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeroImage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartWriting = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/sign-in');
    }
  };
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Write your story,{' '}
          <span className="text-gray-400 font-fraunces font-normal italic">shape your narrative</span>
        </motion.h1>
        
        <motion.p 
          className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          A minimalist writing platform designed for creativity. Organize your thoughts, track your progress, and share your journey.
        </motion.p>
        
        <motion.div 
          className="mt-10 flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div 
            onClick={handleStartWriting}
            className="rounded-full cursor-pointer bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Start writing
          </div>
          {/* <a 
            href="#"
            className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
          >
            Learn more →
          </a> */}
        </motion.div>
      </div>
    </div>
  );
}
