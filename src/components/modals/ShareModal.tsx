"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Copy, UserPlus, Link, X, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Collaborator {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ShareToken {
  id: string;
  token: string;
  expiresAt?: string;
  maxUsers: number;
  createdAt: string;
}

interface ShareModalProps {
  writingId: string;
  writingTitle: string;
  children: React.ReactNode;
}

export default function ShareModal({
  writingId,
  writingTitle,
  children,
}: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shareTokens, setShareTokens] = useState<ShareToken[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [newCollaboratorRole, setNewCollaboratorRole] = useState("EDITOR");
  const [shareTokenExpiry, setShareTokenExpiry] = useState("never");
  const [shareTokenMaxUsers, setShareTokenMaxUsers] = useState("3");

  const { toast } = useToast();

  const fetchCollaborationData = async () => {
    try {
      const response = await fetch(`/api/collaboration/${writingId}`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.writing.collaborators || []);
        setShareTokens(data.writing.shareTokens || []);
      }
    } catch (error) {
      console.error("Error fetching collaboration data:", error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/collaboration/${writingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_collaborator",
          email: newCollaboratorEmail,
          role: newCollaboratorRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators((prev) => [...prev, data.collaborator]);
        setNewCollaboratorEmail("");
        toast({
          title: "Collaborator added",
          description: `${
            data.collaborator.user.name || data.collaborator.user.email
          } has been added as a ${newCollaboratorRole.toLowerCase()}.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add collaborator",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add collaborator",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareToken = async () => {
    setLoading(true);
    try {
      const expiresAt =
        shareTokenExpiry === "never"
          ? null
          : shareTokenExpiry === "1day"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : shareTokenExpiry === "7days"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : shareTokenExpiry === "30days"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;

      const response = await fetch(`/api/collaboration/${writingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_share_token",
          expiresAt,
          maxUsers: parseInt(shareTokenMaxUsers),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareTokens((prev) => [...prev, data.shareToken]);
        toast({
          title: "Share link created",
          description: "Share link has been created successfully.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create share link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const response = await fetch(
        `/api/collaboration/${writingId}?collaboratorId=${collaboratorId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
        toast({
          title: "Collaborator removed",
          description: "Collaborator has been removed successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateShareToken = async (shareTokenId: string) => {
    try {
      const response = await fetch(
        `/api/collaboration/${writingId}?shareTokenId=${shareTokenId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShareTokens((prev) =>
          prev.map((t) =>
            t.id === shareTokenId ? { ...t, isActive: false } : t
          )
        );
        toast({
          title: "Share link deactivated",
          description: "Share link has been deactivated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate share link",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = (token: string) => {
    const shareUrl = `${window.location.origin}/collaborate/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchCollaborationData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{writingTitle}"
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="collaborators"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="links">Share Links</TabsTrigger>
          </TabsList>

          <TabsContent
            value="collaborators"
            className="space-y-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Add Collaborator */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="font-medium">Add Collaborator</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="collaborator@example.com"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newCollaboratorRole}
                    onValueChange={setNewCollaboratorRole}
                    onOpenChange={(open) => {
                      if (!open) {
                        // Prevent event propagation when closing
                        setTimeout(() => {
                          document.addEventListener(
                            "click",
                            (e) => {
                              e.stopPropagation();
                            },
                            { once: true }
                          );
                        }, 0);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddCollaborator();
                }}
                disabled={loading || !newCollaboratorEmail.trim()}
                className="w-full"
              >
                Add Collaborator
              </Button>
            </div>

            {/* Current Collaborators */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Current Collaborators ({collaborators.length})
              </h3>
              {collaborators.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No collaborators yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {collaborator.user.image ? (
                            <img
                              src={collaborator.user.image}
                              alt=""
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {collaborator.user.name?.[0] ||
                                collaborator.user.email[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {collaborator.user.name || collaborator.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {collaborator.role}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveCollaborator(collaborator.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="links"
            className="space-y-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Create Share Link */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span className="font-medium">Create Share Link</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expires</Label>
                  <Select
                    value={shareTokenExpiry}
                    onValueChange={setShareTokenExpiry}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Select
                    value={shareTokenMaxUsers}
                    onValueChange={setShareTokenMaxUsers}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 (Owner + 1)</SelectItem>
                      <SelectItem value="3">3 (Owner + 2)</SelectItem>
                      <SelectItem value="5">5 (Owner + 4)</SelectItem>
                      <SelectItem value="10">10 (Owner + 9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateShareToken();
                }}
                disabled={loading}
                className="w-full"
              >
                Create Share Link
              </Button>
            </div>

            {/* Active Share Links */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Link className="h-4 w-4" />
                Active Share Links ({shareTokens.length})
              </h3>
              {shareTokens.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No share links created yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {shareTokens.map((shareToken) => (
                    <div
                      key={shareToken.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            Share Link
                          </span>
                          {shareToken.expiresAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires{" "}
                              {new Date(
                                shareToken.expiresAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Max {shareToken.maxUsers} users
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyShareLink(shareToken.token);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeactivateShareToken(shareToken.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
