"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CollaborativeEditor from "@/components/editor/CollaborativeEditor";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Writing {
  id: string;
  title: string;
  content: string;
  userId: string;
}

interface CollaboratorInfo {
  id: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  userId: string;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const writingId = params.writingId as string;
  const [writing, setWriting] = useState<Writing | null>(null);
  const [userRole, setUserRole] = useState<"OWNER" | "EDITOR" | "VIEWER">(
    "VIEWER"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    fetchWriting();
  }, [status, writingId]);

  const fetchWriting = async () => {
    try {
      console.log("Fetching writing for ID:", writingId);
      // Use collaboration API which checks both ownership and collaboration access
      const collabResponse = await fetch(`/api/collaboration/${writingId}`);

      if (collabResponse.ok) {
        const collabData = await collabResponse.json();
        console.log("Collaboration API response:", collabData);
        const writing = collabData.writing;

        console.log("Writing data received:", {
          id: writing.id,
          title: writing.title,
          contentLength: writing.content?.length || 0,
          contentPreview: writing.content?.substring(0, 100) || "No content",
          hasContent: !!writing.content,
        });

        setWriting({
          id: writing.id,
          title: writing.title,
          content: writing.content || "",
          userId: writing.userId,
        });

        // Check if user is owner
        if (writing.userId === session?.user?.id) {
          setUserRole("OWNER");
          console.log("User role set to OWNER");
        } else {
          // Check if user is a collaborator
          const userCollab = writing.collaborators?.find(
            (c: CollaboratorInfo) => c.userId === session?.user?.id
          );

          if (userCollab) {
            setUserRole(userCollab.role);
            console.log("User role set to:", userCollab.role);
          } else {
            console.log("User has no access to this writing");
            setError("You do not have access to this writing");
            return;
          }
        }
      } else {
        const errorData = await collabResponse.json().catch(() => ({}));
        console.error("Collaboration API error:", errorData);
        setError(errorData.error || "Writing not found");
      }
    } catch (error) {
      console.error("Error fetching writing:", error);
      setError("Failed to load writing");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string) => {
    if (!writing || userRole === "VIEWER") return;

    try {
      // Use collaboration API for updates to ensure proper access control
      const response = await fetch(`/api/collaboration/${writingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_content",
          content,
          title: writing.title, // Keep existing title
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save");
      }

      toast({
        title: "Saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving writing:", error);
      toast({
        title: "Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the editor handle it
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!writing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Writing not found</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 mt-20">
      <CollaborativeEditor
        writingId={writing.id}
        writingTitle={writing.title}
        initialContent={writing.content || ""}
        onSave={handleSave}
        userRole={userRole}
      />
    </div>
  );
}
