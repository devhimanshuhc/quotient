import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { MDXComponents } from 'mdx/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { calculateReadTime } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  badge: string;
  content: string;
  readTime: string;
}

// Blog content
const himanshuBlogContent = `
# From Scribbles to Software

I started writing when I was 15, back in 9th grade. It began with random poems and deep quotes that made me feel like a philosophical prodigy (spoiler: I wasn't). Writing quickly became my safe space—a way to capture fleeting thoughts and emotions.

Fast forward a few years, I found myself drawn to engineering. It was a stark contrast to writing, but there was something about building things that excited me. Little did I know, these two passions would one day collide in the best way possible.

# Why Build Something for Writers?

If you're a writer, you know the struggle. Half-written drafts, misplaced ideas, and that one gem you wrote down on the back of a grocery list—it's chaos. I've been there. I wanted a space where I could organize my work, not just dump it in random folders labeled "New Folder (12)."

As I learned to code, the idea hit me: Why not build a platform for writers like me? A place where they could write, organize, and revisit their work. A place designed for those who lose sleep over the perfect opening line.

# The Journey of Building My Dream

Creating this platform wasn't just a technical challenge; it was personal. I wanted it to reflect the struggles and joys of being a writer. So, I set out to build features that would make life easier:

- Smart Collections: Group your write-ups in ways that make sense (because we're not animals).
- Version History: Because sometimes your first draft was better.
- Clean Interface: No distractions, just you and your words.

It hasn't been a walk in the park. There were times I thought, "Maybe I should just stick to Google Docs." But then I'd remember my 15-year-old self, dreaming of a place where writers could thrive, and I'd keep going.

# Why This Matters to Me

This platform isn't just an app; it's a love letter to every writer out there. It's for the midnight poets, the overthinking storytellers, and anyone who's ever poured their soul onto a blank page.

So, if you're a writer—or even just someone with a lot of thoughts—I hope this platform becomes your creative haven.`;

const alchemyBlogContent = `"You don't write because you want to say something, you write because you have something to say."
F. Scott Fitzgerald

# The Art of Weaving Words 

Writing is an art form, a dance of words on a blank canvas. It's the ability to conjure worlds, breathe life into characters, and evoke emotions with the stroke of a pen. It's a journey into the depths of the human experience, a quest to understand ourselves and the world around us.

Every writer, be it a seasoned author or a budding wordsmith, embarks on this journey with a unique perspective, a distinct voice. Some find solace in the rhythm of prose, while others revel in the power of poetry. The process of writing is as diverse as the writers themselves. Some may prefer the solitude of a quiet room, their thoughts flowing onto paper like a gentle stream. Others may find inspiration in the hustle and bustle of a coffee shop, the chatter of strangers fueling their imagination. Some may outline their work meticulously, plotting every twist and turn, while others may let their words guide them, trusting in the flow of creativity.

But no matter the approach, the heart of writing lies in the power of words. A single word can evoke a thousand emotions, paint a vivid picture, or spark a revolution. It's the ability to connect with readers on a deep level, to transport them to other worlds, to make them feel, to make them think.

# An Act of Communication

At its core, writing is about communication. It's the way we share ideas, feelings, and experiences with others. The best writing doesn't just convey information—it evokes emotions, paints pictures, and provokes thought. This dual-purpose nature of writing is what makes it an art form.

One key element of strong writing is understanding your audience. Who are you writing for? What do they need to know or feel? What emotions do you want to invoke in them? Tailoring your writing to suit the needs and expectations of your audience will ensure that your message lands in the right way. But the point is, do we always need an audience? Some pieces are just for ourselves, written in the memory of someone, a personal tale, a fleeting thought you want to hold onto a little longer. But every piece you write must have a purpose, whether it's to inform, entertain, persuade, or inspire.

# Finding the Voice

Every writer has a unique voice—a distinctive style, tone, and perspective that shapes their work. Developing your voice is one of the most exciting parts of writing. It's what sets you apart from other writers and allows your personality to shine through your work. It's how you differentiate colours in the evening sky, how your tea tastes, how your mother's laugh sounds or how portray characters of mundane life.

Your voice may evolve over time, influenced by experiences, reading, and practice. The more you write, the clearer and stronger your voice will become. It's not something that can be forced; it emerges naturally just like a bud, with time. To find your voice, focus on authenticity, what makes you feel things. For once, let it be the way it is, let it be real, let it be you. The more honest you are with your writing, the more your voice will resonate with others. Find that voice within you, call for it, desire it. The world is waiting for your unique story.

Let's write something. Let's give the world something to read. Let's create a tale.
Happy writing!`;

const blogs: BlogPost[] = [
  {
    id: 'alchemy-of-words',
    title: 'The Alchemy of Words: The Potion for Writers',
    description: 'A journey into the art of writing, finding your voice, and crafting stories that resonate.',
    author: 'Aparupa Nayak',
    date: '05 Dec 2024',
    badge: "Personal Journey",
    content: alchemyBlogContent,
    readTime: calculateReadTime(alchemyBlogContent),
  },
  {
    id: 'from-scribbles-to-software',
    title: 'From Scribbles to Software: A Writer\'s Journey',
    description: 'From writer to developer, merging two passions to create something beautiful.',
    author: 'Himanshu Chauhan',
    date: '04 Dec 2024',
    badge: "Writer",
    content: himanshuBlogContent,
    readTime: calculateReadTime(himanshuBlogContent),
  }
];

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = blogs.find((blog) => blog.id === params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | Quotient',
    };
  }

  return {
    title: `${blog.title} | Quotient`,
    description: blog.description,
  };
}

const components: MDXComponents = {
  h1: (props) => (
    <h1 className="text-3xl font-fraunces text-gray-900 mt-12 mb-6" {...props} />
  ),
  p: (props) => (
    <p className="text-gray-600 leading-relaxed mb-6" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc list-inside space-y-2 mb-6 text-gray-600" {...props} />
  ),
  li: (props) => (
    <li className="leading-relaxed" {...props} />
  ),
};

export default function BlogPost({ params }: Props) {
  const blog = blogs.find((blog) => blog.id === params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        
        <article className="prose prose-gray lg:prose-lg max-w-none">
          <div className="mb-12">
            <h1 className="text-4xl font-fraunces mb-4 !mt-0">{blog.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{blog.author}</span>
              <span>•</span>
              <span>{blog.date}</span>
              <span>•</span>
              <span>{blog.readTime}</span>
            </div>
          </div>
          
          <MDXRemote 
            source={blog.content} 
            components={components}
          />
        </article>
      </div>
    </div>
  );
}
