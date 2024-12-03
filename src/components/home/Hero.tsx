'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInUp, staggerChildren } from '@/lib/animations';

export default function Hero() {
  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
    >
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-x-3"
      >
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
          New Feature
        </span>
        <span className="inline-flex items-center space-x-2 text-sm font-medium text-gray-500">
          <span>✨ AI-powered writing suggestions</span>
        </span>
      </motion.div>
      <motion.h1
        variants={fadeInUp}
        className="mt-10 font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
      >
        Your creative writing,{' '}
        <span className="text-indigo-600">beautifully organized</span>
      </motion.h1>
      <motion.p
        variants={fadeInUp}
        className="mt-6 text-lg leading-8 text-gray-600"
      >
        Capture your thoughts, quotes, and creative pieces in a beautiful space. Let your ideas flow while we handle the organization.
      </motion.p>
      <motion.div
        variants={fadeInUp}
        className="mt-10 flex items-center gap-x-6"
      >
        <Link
          href="/dashboard"
          className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
        >
          Start writing
        </Link>
        <Link 
          href="/about" 
          className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors duration-200"
        >
          Learn more <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
