'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const features = [
  {
    title: 'Write & Create',
    description: 'Craft your stories with powerful writing tools and a distraction-free environment.',
    icon: ({ isActive }: { isActive: boolean }) => (
      <motion.div className="w-12 h-12 relative">
        {/* Pen body */}
        <motion.div
          className="absolute top-1/2 left-1/2 h-1 w-8 bg-gray-900 origin-left"
          initial={{ rotate: -45, x: '-50%', y: '-50%' }}
          animate={{ 
            rotate: isActive ? [-45, 0, -45] : -45,
            x: isActive ? ['-50%', '0%', '-50%'] : '-50%',
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
        {/* Pen tip */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 border-2 border-gray-900"
          initial={{ rotate: -45, x: '-50%', y: '-50%' }}
          animate={{ 
            rotate: isActive ? [-45, 0, -45] : -45,
            scale: isActive ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      </motion.div>
    ),
  },
  {
    title: 'Organize',
    description: 'Keep your writing organized with smart collections and tags.',
    icon: ({ isActive }: { isActive: boolean }) => (
      <motion.div className="w-12 h-12 relative">
        {/* Folder shape */}
        <motion.div
          className="absolute inset-0 border-2 border-gray-900 rounded-lg"
          initial={{ scaleY: 0.7 }}
          animate={{ 
            scaleY: isActive ? [0.7, 1, 0.7] : 0.7,
            y: isActive ? [0, -4, 0] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
        {/* Papers inside */}
        <motion.div
          className="absolute left-1/2 bottom-1 w-6 h-4 bg-gray-900"
          initial={{ x: '-50%' }}
          animate={{ 
            y: isActive ? [-4, -8, -4] : -4,
            scale: isActive ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      </motion.div>
    ),
  },
  {
    title: 'Collaborate',
    description: 'Share your work and collaborate with other writers in real-time.',
    icon: ({ isActive }: { isActive: boolean }) => (
      <motion.div className="w-12 h-12 relative">
        {/* Connection lines */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: isActive ? [0.5, 1, 0.5] : 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2 h-[1px] w-8 bg-gray-900"
            initial={{ rotate: -45, x: '-50%', y: '-50%' }}
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.5, 1, 0.5] : 0.5,
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 h-[1px] w-8 bg-gray-900"
            initial={{ rotate: 45, x: '-50%', y: '-50%' }}
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.5, 1, 0.5] : 0.5,
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
        {/* Nodes */}
        <motion.div
          className="absolute top-0 left-0 w-2 h-2 bg-gray-900 rounded-full"
          animate={{ 
            scale: isActive ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-2 h-2 bg-gray-900 rounded-full"
          animate={{ 
            scale: isActive ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1, delay: 0.5 }}
        />
      </motion.div>
    ),
  },
  {
    title: 'Publish',
    description: 'Share your stories with the world through beautiful, customizable formats.',
    icon: ({ isActive }: { isActive: boolean }) => (
      <motion.div className="w-12 h-12 relative">
        {/* Paper */}
        <motion.div
          className="absolute inset-0 border-2 border-gray-900 rounded-lg"
          animate={{ 
            scale: isActive ? [1, 1.1, 1] : 1,
            rotate: isActive ? [0, 5, 0] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
        {/* Lines */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-2 h-[1px] w-6 bg-gray-900"
            initial={{ y: 3 + i * 3 }}
            animate={{ 
              scaleX: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.5, 1, 0.5] : 0.5,
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: i * 0.2 }}
          />
        ))}
        {/* Publish arrow */}
        <motion.div
          className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-900"
          initial={{ rotate: 45 }}
          animate={{ 
            scale: isActive ? [1, 1.2, 1] : 1,
            rotate: isActive ? [45, 90, 45] : 45,
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      </motion.div>
    ),
  },
];

function FeatureSection({ feature, isActive }: { feature: typeof features[0], isActive: boolean }) {
  return (
    <motion.div
      className={`absolute inset-0 mt-10 flex items-center justify-center transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Icon */}
          <feature.icon isActive={isActive} />
          
          {/* Title */}
          <motion.h3 
            className="text-2xl font-medium text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {feature.title}
          </motion.h3>
          
          {/* Description */}
          <motion.p
            className="text-gray-500 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {feature.description}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const isVisible = rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2;
      setIsInView(isVisible);

      if (isVisible) {
        const progress = (windowHeight / 2 - rect.top) / rect.height;
        const newIndex = Math.floor(progress * features.length);
        if (newIndex >= 0 && newIndex < features.length) {
          setActiveIndex(newIndex);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative bg-white" ref={containerRef}>
      <div className="relative min-h-screen">
        {/* Title */}
        <div 
          className={`${
            isInView ? 'fixed z-20' : 'absolute'
          } top-0 left-0 w-full bg-white/80 backdrop-blur-sm py-16 pointer-events-none`}
        >
          <div className="mx-auto max-w-4xl text-center px-6">
            <div className="relative pt-16 md:pt-24">
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 tracking-tight"
                animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                transition={{ duration: 0.5 }}
              >
                Everything you need to{" "}
                <span className="font-fraunces italic relative inline-block">
                  create
                  <motion.div
                    className="absolute -bottom-1 left-0 w-full h-[1px] bg-gray-900"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: isInView ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </span>
              </motion.h2>
            </div>
          </div>
        </div>

        {/* Scroll Sections */}
        <div style={{ height: `${features.length * 100}vh`, marginTop: '8rem' }}>
          {features.map((_, index) => (
            <div
              key={index}
              className="h-screen"
            />
          ))}
        </div>

        {/* Fixed Content Container */}
        <div 
          className={`${
            isInView ? 'fixed' : 'absolute'
          } top-0 left-0 w-full h-screen pt-36`}
          style={{
            top: isInView ? '0' : '',
            bottom: !isInView && activeIndex === features.length - 1 ? '0' : ''
          }}
        >
          {features.map((feature, index) => (
            <FeatureSection
              key={feature.title}
              feature={feature}
              isActive={isInView && index === activeIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
