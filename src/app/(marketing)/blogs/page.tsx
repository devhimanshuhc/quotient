'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PageTransition from '@/components/animations/PageTransition';
import { calculateReadTime } from '@/lib/utils';

// Blog content
const blogContent = `Hi, I'm Himanshu Chauhan, a writer-turned-developer with a knack for merging creativity and logic. I hail from the serene city of Dehradun, Uttarakhand, and I'm currently pursuing my graduation from Nagpur. While my days are spent balancing books, code, and caffeine, my story goes way back to when I first discovered my love for words—and later, my interest in engineering.

From Scribbles to Software
I started writing when I was 15, back in 9th grade. It began with random poems and deep quotes that made me feel like a philosophical prodigy (spoiler: I wasn't). Writing quickly became my safe space—a way to capture fleeting thoughts and emotions.

Fast forward a few years, I found myself drawn to engineering. It was a stark contrast to writing, but there was something about building things that excited me. Little did I know, these two passions would one day collide in the best way possible.

Why Build Something for Writers?
If you're a writer, you know the struggle. Half-written drafts, misplaced ideas, and that one gem you wrote down on the back of a grocery list—it's chaos. I've been there. I wanted a space where I could organize my work, not just dump it in random folders labeled "New Folder (12)."

As I learned to code, the idea hit me: Why not build a platform for writers like me? A place where they could write, organize, and revisit their work. A place designed for those who lose sleep over the perfect opening line.

The Journey of Building My Dream
Creating this platform wasn't just a technical challenge; it was personal. I wanted it to reflect the struggles and joys of being a writer. So, I set out to build features that would make life easier:

Smart Collections: Group your write-ups in ways that make sense (because we're not animals).
Clean Writing Interface: No ads, no distractions—just you and your thoughts.
Effortless Organization: Find what you need when you need it.

It hasn't been a walk in the park. There were times I thought, "Maybe I should just stick to Google Docs." But then I'd remember my 15-year-old self, dreaming of a place where writers could thrive, and I'd keep going.

Why This Matters to Me
This platform isn't just an app; it's a love letter to every writer out there. It's for the midnight poets, the overthinking storytellers, and anyone who's ever poured their soul onto a blank page.

So, if you're a writer—or even just someone with a lot of thoughts—I hope this platform becomes your creative haven.

Cheers to words, ideas, and the infinite possibilities they bring!

- Himanshu`;

const blogs = [
  {
    id: 1,
    slug: 'words-code-and-everything-in-between',
    title: "Words, Code, and Everything In Between: How I Built a Platform for Writers",
    excerpt: "A personal journey from a 15-year-old aspiring writer to a developer building tools for creative minds. From random poems to random functions, here's my story.",
    author: "Himanshu Chauhan",
    date: "Dec 5, 2023",
    readTime: calculateReadTime(blogContent),
    category: "Personal Journey",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BlogPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl font-bold font-fraunces tracking-tight text-gray-900 sm:text-6xl"
              >
                Insights & Stories
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600"
              >
                Explore our collection of articles about creative writing, storytelling, and the craft of bringing ideas to life.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 via-gray-50 to-gray-50/0" />
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative mx-auto max-w-7xl px-6 lg:px-8"
          >
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <motion.div key={blog.id} variants={item}>
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="group relative flex flex-col space-y-4 rounded-2xl border border-gray-200/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm hover:border-gray-300 hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-gray-100/80 px-3 py-1 text-sm font-medium text-gray-600">
                        {blog.category}
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gray-600" />
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-bold font-fraunces text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
                        {blog.title}
                      </h2>
                      <p className="mt-2 text-gray-600 line-clamp-3 group-hover:text-gray-500">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">{blog.author}</span>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{blog.date}</span>
                        <span>•</span>
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </PageTransition>
  );
}
