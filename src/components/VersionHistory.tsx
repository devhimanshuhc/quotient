import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { History, Loader2, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Version {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  versionNumber: number;
}

interface VersionHistoryProps {
  writingId: string;
  onRestoreVersion: (content: string, title: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export function VersionHistory({
  writingId,
  onRestoreVersion,
  onOpenChange,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/writings/${writingId}/versions`);
      if (!response.ok) throw new Error("Failed to fetch versions");
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (version: Version) => {
    onRestoreVersion(version.content, version.title);
    handleOpenChange(false);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="default"
                className="h-10 px-4 bg-gray-900 hover:bg-gray-800 text-white transition-colors flex items-center gap-2 group"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  handleOpenChange(true);
                  fetchVersions();
                }}
              >
                <History className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>History</span>
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent className="bg-gray-800 text-white">
            <p>Version History</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Access your recent document versions. Only the last 3 versions are
              preserved for quick restoration.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4 mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No previous versions found
                </div>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          Version {version.versionNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(version.createdAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm bg-muted p-3 rounded">
                      <p className="font-medium mb-2 break-words">
                        {version.title}
                      </p>
                      <div className="prose prose-sm max-w-none">
                        <div
                          className="max-h-[120px] overflow-y-auto break-words whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2"
                          dangerouslySetInnerHTML={{ __html: version.content }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
