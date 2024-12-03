'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function SharedPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div
          className="inline-flex p-4 bg-gray-50 rounded-full"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Users className="w-8 h-8 text-gray-600" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-medium text-gray-900">
          Shared Writing
          <span className="inline-block ml-3 text-sm font-normal bg-gray-100 text-gray-600 px-3 py-0.5 rounded-full">
            Coming Soon
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-500 max-w-md mx-auto">
          Soon you'll be able to collaborate with other writers, share your work, and get feedback from the community.
        </p>

        {/* Progress Bar */}
        <div className="max-w-xs mx-auto w-full mt-8">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">In Development</p>
        </div>
      </motion.div>
    </div>
  );
}
