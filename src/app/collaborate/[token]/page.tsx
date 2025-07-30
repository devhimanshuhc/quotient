"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Clock, FileText, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareTokenInfo {
  writing: {
    id: string;
    title: string;
    createdAt: string;
  };
  creator: {
    name: string;
    email: string;
  };
  currentCollaborators: number;
  maxUsers: number;
  expiresAt?: string;
  canJoin: boolean;
}

export default function CollaboratePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const token = params.token as string;
  const [shareInfo, setShareInfo] = useState<ShareTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    fetchShareTokenInfo();
  }, [status, token]);

  const fetchShareTokenInfo = async () => {
    try {
      const response = await fetch(`/api/collaboration/join/${token}`);

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || "Invalid share link");
        return;
      }

      const data = await response.json();
      setShareInfo(data);
    } catch (error) {
      setError("Failed to load share information");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCollaboration = async () => {
    if (!shareInfo) return;

    setJoining(true);
    try {
      const response = await fetch(`/api/collaboration/join/${token}`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        });

        // Redirect to the writing
        router.push(`/edit/${shareInfo.writing.id}`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join collaboration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join collaboration",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            Loading collaboration details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              Invalid Share Link
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shareInfo) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Join Collaboration</CardTitle>
          </div>
          <CardDescription>
            You've been invited to collaborate on a writing
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Writing Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">{shareInfo.writing.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Created by {shareInfo.creator.name || shareInfo.creator.email}
              </span>
              <span>•</span>
              <span>
                {new Date(shareInfo.writing.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Collaboration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">
                  {shareInfo.currentCollaborators} / {shareInfo.maxUsers}
                </p>
                <p className="text-sm text-muted-foreground">Collaborators</p>
              </div>
            </div>

            {shareInfo.expiresAt ? (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">
                    {new Date(shareInfo.expiresAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Expires</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">No Expiry</p>
                  <p className="text-sm text-muted-foreground">
                    Permanent Access
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Join Status */}
          <div className="text-center space-y-4">
            {shareInfo.canJoin ? (
              <div className=" flex flex-col items-center">
                <Button
                  size="lg"
                  onClick={handleJoinCollaboration}
                  disabled={joining}
                  className="w-full md:w-auto px-8"
                >
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Collaboration"
                  )}
                </Button>
              </div>
            ) : (
              <>
                <Badge variant="secondary" className="mb-4">
                  Collaboration Full
                </Badge>
                <p className="text-muted-foreground">
                  This collaboration has reached its maximum number of users.
                </p>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
