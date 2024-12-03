'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const footerLinks = [
  { name: 'Collections', href: '/collections' },
  { name: 'About', href: '#' },
  { name: 'Blog', href: '#' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {/* Main Content */}
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Brand */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/" 
              className="text-2xl font-medium tracking-tight text-gray-900 hover:text-gray-600 transition-colors"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="relative font-fraunces">
                Quotient
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-[1px] bg-gray-900"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </span>
            </Link>
            <p className="font-fraunces italic text-2xl text-gray-600">
              Shape your narrative
            </p>
            <p className="text-sm text-gray-500 max-w-sm">
              Everything you need to create
            </p>
          </motion.div>
          {/* Links */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p>&copy; {new Date().getFullYear()} Quotient. All rights reserved.</p>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <Link href="#" className="hover:text-gray-900 transition-colors">Terms</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
