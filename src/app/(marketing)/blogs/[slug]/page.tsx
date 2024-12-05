'use client';

import { motion } from 'framer-motion';
import PageTransition from '@/components/animations/PageTransition';
import { calculateReadTime } from '@/lib/utils';

// This would typically come from your database or CMS
const blogPosts = {
  'words-code-and-everything-in-between': {
    title: "Words, Code, and Everything In Between: How I Built a Platform for Writers",
    content: `Hi, I'm Himanshu Chauhan, a developer with a lifelong passion for writing. I hail from the serene city of Dehradun, Uttarakhand, and I'm currently pursuing my graduation from Nagpur. While my days are spent balancing books, code, and caffeine, my story goes way back to when I first discovered my love for words—and later, my interest in engineering.

# From Scribbles to Software

I started writing when I was 15, back in 9th grade. It began with random poems and deep quotes that made me feel like a philosophical prodigy (spoiler: I wasn't). Writing quickly became my safe space—a way to capture fleeting thoughts and emotions.

Fast forward a few years, I found myself drawn to engineering. It was a stark contrast to writing, but there was something about building things that excited me. Little did I know, these two passions would one day collide in the best way possible.

# Why Build Something for Writers?

If you're a writer, you know the struggle. Half-written drafts, misplaced ideas, and that one gem you wrote down on the back of a grocery list—it's chaos. I've been there. I wanted a space where I could organize my work, not just dump it in random folders labeled "New Folder (12)."

As I learned to code, the idea hit me: Why not build a platform for writers like me? A place where they could write, organize, and revisit their work. A place designed for those who lose sleep over the perfect opening line.

# The Journey of Building My Dream

Creating this platform wasn't just a technical challenge; it was personal. I wanted it to reflect the struggles and joys of being a writer. So, I set out to build features that would make life easier:

Smart Collections: Group your write-ups in ways that make sense (because we're not animals).
Clean Writing Interface: No ads, no distractions—just you and your thoughts.
Effortless Organization: Find what you need when you need it.

It hasn't been a walk in the park. There were times I thought, "Maybe I should just stick to Google Docs." But then I'd remember my 15-year-old self, dreaming of a place where writers could thrive, and I'd keep going.

# Why This Matters to Me

This platform isn't just an app; it's a love letter to every writer out there. It's for the midnight poets, the overthinking storytellers, and anyone who's ever poured their soul onto a blank page.

So, if you're a writer—or even just someone with a lot of thoughts—I hope this platform becomes your creative haven.

Cheers to words, ideas, and the infinite possibilities they bring!

- Himanshu`,
    author: "Himanshu Chauhan",
    date: "Dec 5, 2023",
    category: "Personal Journey"
  }
};

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog post not found</h1>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content);
  // Split by both regular newlines and markdown headers
  const paragraphs = post.content
    .split(/\n\n/)
    .map(para => {
      // Check if the paragraph is a header
      if (para.startsWith('# ')) {
        return `<h2 class="text-2xl font-bold font-fraunces mt-12 mb-6">${para.substring(2)}</h2>`;
      }
      return `<p class="mb-6 text-gray-600 leading-relaxed">${para}</p>`;
    });

  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-16 sm:pt-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-4 sm:mt-0"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500 mb-6">
                <span>{post.category}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{readTime}</span>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold font-fraunces tracking-tight text-gray-900"
              >
                {post.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 flex items-center justify-center"
              >
                <span className="text-gray-600">By {post.author}</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="relative overflow-hidden py-12 sm:py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 via-gray-50 to-gray-50/0" />
          <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8"
          >
            <div 
              className="prose prose-lg prose-gray mx-auto prose-headings:font-fraunces prose-headings:text-2xl sm:prose-headings:text-3xl prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: paragraphs.join('\n')
              }}
            />
          </motion.article>
        </section>
      </main>
    </PageTransition>
  );
}
