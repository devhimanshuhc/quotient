"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Users, Wifi, WifiOff, Eye, Edit3, Share2 } from "lucide-react";
import ShareModal from "@/components/modals/ShareModal";

interface CollaborativeEditorProps {
  writingId: string;
  writingTitle: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  shareToken?: string;
  userRole?: "OWNER" | "EDITOR" | "VIEWER";
}

interface ConnectedUser {
  id: string;
  name: string;
  color: string;
  isOnline: boolean;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function CollaborativeEditor({
  writingId,
  writingTitle,
  initialContent = "",
  onSave,
  shareToken,
  userRole = "OWNER",
}: CollaborativeEditorProps) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(true); // Simplified for now
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isReadOnly = userRole === "VIEWER";

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(() => {
      if (editor && !isReadOnly) {
        handleSave();
      }
    }, 2000),
    []
  );

  const editor = useEditor({
    extensions: [StarterKit],
    editable: !isReadOnly,
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Auto-save on changes (debounced)
      if (!isReadOnly) {
        debouncedSave();
      }
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== undefined && initialContent !== null) {
      const currentContent = editor.getHTML();

      // Only update if the content is actually different
      if (currentContent !== initialContent) {
        // If initialContent is not empty, or if current content is empty/default
        if (
          initialContent.trim() !== "" ||
          currentContent === "<p></p>" ||
          currentContent.trim() === ""
        ) {
          editor.commands.setContent(initialContent);
        }
      }
    }
  }, [editor, initialContent]);

  useEffect(() => {
    // Simulate fetching collaborators
    fetchCollaborators();

    // Set up periodic collaborator updates
    const interval = setInterval(fetchCollaborators, 30000);

    return () => clearInterval(interval);
  }, [writingId]);
  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/collaboration/${writingId}`);
      if (response.ok) {
        const data = await response.json();
        const users: ConnectedUser[] =
          data.writing.collaborators?.map((collab: any) => ({
            id: collab.userId,
            name: collab.user.name || collab.user.email,
            color: getUserColor(collab.userId),
            isOnline:
              collab.lastActive &&
              new Date(collab.lastActive) >
                new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
          })) || [];
        setConnectedUsers(users);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  const handleSave = async () => {
    if (!editor || !onSave || saving || isReadOnly) return;

    const content = editor.getHTML();
    setSaving(true);

    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const getUserColor = (userId: string): string => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#FFB6C1",
      "#87CEEB",
      "#F0E68C",
      "#FFA07A",
    ];
    const index = parseInt(userId, 36) % colors.length;
    return colors[index];
  };

  const getRandomColor = (): string => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#FFB6C1",
      "#87CEEB",
      "#F0E68C",
      "#FFA07A",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{writingTitle}</h1>

          {/* Role Badge */}
          <Badge
            variant={
              userRole === "OWNER"
                ? "default"
                : userRole === "EDITOR"
                ? "secondary"
                : "outline"
            }
          >
            {userRole === "VIEWER" ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Viewer
              </>
            ) : (
              <>
                <Edit3 className="h-3 w-3 mr-1" />
                {userRole}
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Disconnected</span>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Connected Users */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {connectedUsers.filter((u) => u.isOnline).length + 1} user
              {connectedUsers.filter((u) => u.isOnline).length !== 0 ? "s" : ""}
            </span>

            {/* User Avatars */}
            <div className="flex -space-x-2">
              {/* Current User */}
              <div
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: getRandomColor() }}
                title={session?.user?.name || "You"}
              >
                {(session?.user?.name?.[0] || "Y").toUpperCase()}
              </div>

              {/* Other Users */}
              {connectedUsers
                .filter((u) => u.isOnline)
                .slice(0, 3)
                .map((user) => (
                  <div
                    key={user.id}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.name[0]?.toUpperCase() || "?"}
                  </div>
                ))}

              {connectedUsers.filter((u) => u.isOnline).length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs">
                  +{connectedUsers.filter((u) => u.isOnline).length - 3}
                </div>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            )}

            {userRole === "OWNER" && (
              <ShareModal writingId={writingId} writingTitle={writingTitle}>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </ShareModal>
            )}
          </div>
        </div>
      </div>

      {/* Save Status */}
      {lastSaved && !isReadOnly && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Editor */}
      <div className="border rounded-lg overflow-hidden">
        <EditorContent
          editor={editor}
          className={`prose prose-sm max-w-none p-6 min-h-[500px] focus:outline-none ${
            isReadOnly ? "bg-muted/30" : "bg-background"
          }`}
        />
      </div>

      {/* Editor Toolbar */}
      {!isReadOnly && editor && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Button
            variant={editor.isActive("bold") ? "default" : "outline"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Bold
          </Button>
          <Button
            variant={editor.isActive("italic") ? "default" : "outline"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Italic
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 1 }) ? "default" : "outline"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 2 }) ? "default" : "outline"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </Button>
          <Button
            variant={editor.isActive("bulletList") ? "default" : "outline"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            List
          </Button>
        </div>
      )}
    </div>
  );
}
