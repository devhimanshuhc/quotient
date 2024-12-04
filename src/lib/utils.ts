import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the estimated reading time for a given text
 * @param text The content to calculate reading time for
 * @param wordsPerMinute Average reading speed (default: 200 words per minute)
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function calculateReadTime(text: string, wordsPerMinute: number = 200): string {
  // Remove extra whitespace and split into words
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
