'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function CallToAction() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartWriting = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/sign-in');
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation config
  const springConfig = { damping: 25, stiffness: 120 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  // Generate background lines
  const lines = Array.from({ length: 8 });

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50">
        <div className="absolute inset-0">
          {/* Vertical lines */}
          <div className="absolute inset-0 flex justify-around">
            {lines.map((_, i) => (
              <motion.div
                key={`v-${i}`}
                className="h-full w-[1px] bg-gray-200"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ 
                  scaleY: 1, 
                  opacity: 0.5,
                }}
                style={{
                  x: useTransform(springX, [0, 1], [-20, 20])
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Horizontal lines */}
          <div className="absolute inset-0 flex flex-col justify-around">
            {lines.map((_, i) => (
              <motion.div
                key={`h-${i}`}
                className="w-full h-[1px] bg-gray-200"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ 
                  scaleX: 1, 
                  opacity: 0.5,
                }}
                style={{
                  y: useTransform(springY, [0, 1], [-20, 20])
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-white/0 to-white/80"
            style={{
              scale: useTransform(springX, [0, 1], [1.1, 0.9]),
              opacity: useTransform(springY, [0, 1], [0.8, 1]),
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[80vh] flex items-center justify-center"
      >
        <div className="text-center space-y-12 px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-medium text-gray-900 tracking-tight">
              Ready to{' '}
              <span className="font-fraunces italic inline-block">
                write
                <motion.div
                  className="h-[1px] bg-gray-900 mt-1"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                />
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Join our community of writers and start crafting your narrative today
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.button
              className="group relative px-8 py-4 text-lg font-medium text-white bg-gray-900 rounded-full overflow-hidden"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0 }}
                variants={{
                  hover: {
                    scale: 1.5,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }
                }}
              />
              <motion.span 
              onClick={handleStartWriting}
                className="relative z-10 flex items-center justify-center gap-2"
                variants={{
                  hover: {
                    x: [-2, 4],
                    transition: { duration: 0.4, ease: "easeOut" }
                  }
                }}
              >
                Sign In
                <motion.svg
                  className="w-4 h-4"
                  variants={{
                    hover: {
                      x: [0, 4],
                      transition: { duration: 0.4, ease: "easeOut" }
                    }
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </motion.span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
