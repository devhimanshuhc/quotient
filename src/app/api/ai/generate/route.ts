import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to clean up AI-generated content formatting issues
function cleanGeneratedContent(content: string): string {
  let cleaned = content;

  // Remove excessive empty paragraphs and line breaks
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");
  cleaned = cleaned.replace(/<p>\s*&nbsp;\s*<\/p>/g, "");
  cleaned = cleaned.replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>");

  // Remove empty list items
  cleaned = cleaned.replace(/<li>\s*<\/li>/g, "");
  cleaned = cleaned.replace(/<li>\s*&nbsp;\s*<\/li>/g, "");

  // Remove empty ul/ol tags
  cleaned = cleaned.replace(/<ul>\s*<\/ul>/g, "");
  cleaned = cleaned.replace(/<ol>\s*<\/ol>/g, "");

  // Clean up multiple consecutive line breaks
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

  // Remove trailing and leading whitespace from list items
  cleaned = cleaned.replace(/<li>\s+/g, "<li>");
  cleaned = cleaned.replace(/\s+<\/li>/g, "</li>");

  // Remove trailing and leading whitespace from paragraphs
  cleaned = cleaned.replace(/<p>\s+/g, "<p>");
  cleaned = cleaned.replace(/\s+<\/p>/g, "</p>");

  // Remove multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ");

  // Clean up any malformed HTML
  cleaned = cleaned.replace(/<([^>]+)>\s*<\/\1>/g, "");

  // Ensure proper spacing around block elements
  cleaned = cleaned.replace(/><h/g, ">\n<h");
  cleaned = cleaned.replace(/><p/g, ">\n<p");
  cleaned = cleaned.replace(/><ul/g, ">\n<ul");
  cleaned = cleaned.replace(/><ol/g, ">\n<ol");

  return cleaned.trim();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, context } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Create a system message to guide the AI
    const systemMessage = `You are a helpful AI assistant that generates well-structured, informative notes based on user prompts. 

STRICT FORMATTING REQUIREMENTS:
1. Use clean, semantic HTML structure
2. NO empty paragraphs (<p></p>) or empty list items (<li></li>)
3. NO excessive line breaks or spacing
4. Each bullet point MUST contain actual content
5. Use proper paragraph breaks only when starting new topics

HTML Structure Guidelines:
- Use <h1>, <h2> for headings (only when needed)
- Use <p> for paragraphs with actual content
- Use <ul> and <li> for bullet points (each <li> must have content)
- Use <ol> and <li> for numbered lists (each <li> must have content)
- Use <strong> for bold text, <em> for italic text
- Use <blockquote> for quotes

Content Guidelines:
- Be informative and comprehensive
- Use professional tone
- Include relevant examples when appropriate
- Organize information logically
- Avoid redundant content

EXAMPLE OF GOOD FORMATTING:
<h2>Main Topic</h2>
<p>This is a paragraph with actual content explaining the main topic.</p>
<ul>
<li>First bullet point with meaningful content</li>
<li>Second bullet point with actual information</li>
<li>Third bullet point with relevant details</li>
</ul>
<p>Another paragraph continuing the discussion.</p>

DO NOT CREATE:
- Empty paragraphs: <p></p>
- Empty list items: <li></li>
- Multiple consecutive line breaks
- Excessive spacing between elements
    
    ${context ? `Additional context: ${context}` : ""}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Using a more stable model
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return new NextResponse("Failed to generate content", { status: 500 });
    }

    // Clean up the generated content to remove formatting issues
    const cleanedContent = cleanGeneratedContent(generatedContent);

    return NextResponse.json({
      content: cleanedContent,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Error generating AI content:", error);

    if (error instanceof Error) {
      return new NextResponse(`AI Generation Error: ${error.message}`, {
        status: 500,
      });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
