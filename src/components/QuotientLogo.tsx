'use client';

import { motion } from 'framer-motion';

export default function QuotientLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Animated Logo Mark */}
      <div className="relative w-7 h-7">
        {/* Writing line animation */}
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] bg-gray-900"
          initial={{ width: 0 }}
          animate={{
            width: ["0%", "100%", "0%"],
            left: ["0%", "0%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Pen tip */}
        <motion.div
          className="absolute top-[6px] right-[6px] w-[14px] h-[14px]"
          style={{ 
            clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)" 
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          // className="bg-gray-900"
        />
      </div>

      {/* Text with animated underline */}
      <div className="relative">
        <motion.span 
          className="text-xl font-medium text-gray-900 font-fraunces"
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Quotient
        </motion.span>
        <motion.div
          className="absolute -bottom-px left-0 h-[1px] bg-gray-900"
          animate={{
            scaleX: [0, 1, 0],
            originX: ["0%", "100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
