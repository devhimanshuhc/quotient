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
                variant="outline"
                size="sm"
                className="h-12 px-4 bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 group rounded-lg"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  handleOpenChange(true);
                  fetchVersions();
                }}
              >
                <History className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent className="bg-gray-900 text-white border-gray-700 shadow-lg">
            <p className="text-xs">View version history</p>
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
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">
                    Loading versions...
                  </p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    No previous versions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Versions will appear here after you make edits to your note.
                  </p>
                </div>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Version {version.versionNumber}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {format(
                            new Date(version.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version)}
                        className="h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md group rounded-lg"
                      >
                        <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                        <span className="ml-1.5 text-xs font-medium">
                          Restore
                        </span>
                      </Button>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold mb-2 break-words text-gray-900 text-sm">
                        {version.title}
                      </p>
                      <div className="prose prose-sm max-w-none">
                        <div
                          className="max-h-[100px] overflow-y-auto break-words whitespace-pre-wrap text-gray-700 text-xs leading-relaxed scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2"
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
