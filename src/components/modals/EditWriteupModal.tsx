'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, FileDown } from "lucide-react";
import TipTapEditor from '../editor/TipTapEditor';
import { VersionHistory } from '@/components/VersionHistory';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import DOMPurify from 'isomorphic-dompurify';

interface Collection {
  id: string;
  name: string;
}

interface Writing {
  id: string;
  title: string;
  content: string;
  collections: Collection[];
}

interface EditWriteupModalProps {
  isOpen: boolean;
  onClose: () => void;
  writing: Writing;
  collections: Collection[];
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export default function EditWriteupModal({
  isOpen,
  onClose,
  writing,
  collections,
  onUnsavedChanges
}: EditWriteupModalProps) {
  const [title, setTitle] = useState(writing.title);
  const [content, setContent] = useState(writing.content);
  const [selectedCollection, setSelectedCollection] = useState(writing.collections[0]?.id || 'uncategorized');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isViewingVersions, setIsViewingVersions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(writing.title);
      setContent(writing.content);
      setSelectedCollection(writing.collections[0]?.id || 'uncategorized');
      setHasUnsavedChanges(false);
      setIsViewingVersions(false);
    }
  }, [isOpen, writing]);

  // Track unsaved changes
  useEffect(() => {
    if (isViewingVersions) return;
    
    const hasChanges = 
      title !== writing.title || 
      content !== writing.content || 
      selectedCollection !== (writing.collections[0]?.id || 'uncategorized');
    
    if (!isViewingVersions) {
      setHasUnsavedChanges(hasChanges);
      onUnsavedChanges?.(hasChanges);
    }
  }, [title, content, selectedCollection, writing, onUnsavedChanges, isViewingVersions]);

  const handleClose = () => {
    if (hasUnsavedChanges && !isViewingVersions) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    setIsViewingVersions(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewingVersions) return;

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/writings/${writing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          collectionId: selectedCollection === 'uncategorized' ? undefined : selectedCollection,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update write-up');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Write-up updated successfully",
      });
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error updating write-up:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update write-up",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = (restoredContent: string, restoredTitle: string) => {
    setTitle(restoredTitle);
    setContent(restoredContent);
    setIsViewingVersions(false);
    // Set hasUnsavedChanges to true since we've restored a version
    setHasUnsavedChanges(true);
    onUnsavedChanges?.(true);
    toast({
      title: "Version Restored",
      description: "The selected version has been restored. Don't forget to save your changes.",
    });
  };

  const handleContentChange = (newContent: string) => {
    if (!isViewingVersions) {
      setContent(newContent);
    }
  };

  const parseFormattedContent = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);
    
    const extractFormatting = (element: Element): Array<{
      text: string;
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikethrough: boolean;
      isListItem?: boolean;
    }> => {
      const result: Array<{
        text: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
        isListItem?: boolean;
      }> = [];
      
      const processNode = (node: Node, format: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
      }) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            result.push({ text, ...format });
          }
          return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          const newFormat = { ...format };
          
          // Check for formatting tags
          if (el.tagName === 'STRONG' || el.tagName === 'B') newFormat.bold = true;
          if (el.tagName === 'EM' || el.tagName === 'I') newFormat.italic = true;
          if (el.tagName === 'U') newFormat.underline = true;
          if (el.tagName === 'S' || el.tagName === 'DEL' || el.tagName === 'STRIKE') newFormat.strikethrough = true;
          
          // Handle lists
          if (el.tagName === 'UL' || el.tagName === 'OL') {
            Array.from(el.children).forEach((li, index) => {
              if (li.tagName === 'LI') {
                const bulletPoint = el.tagName === 'UL' ? '• ' : `${index + 1}. `;
                const listItemContent: Array<{
                  text: string;
                  bold: boolean;
                  italic: boolean;
                  underline: boolean;
                  strikethrough: boolean;
                }> = [];
                
                Array.from(li.childNodes).forEach(child => {
                  const prevLength = listItemContent.length;
                  processNode(child, newFormat);
                  const newItems = result.splice(prevLength);
                  listItemContent.push(...newItems);
                });
                
                if (listItemContent.length > 0) {
                  listItemContent[0].text = bulletPoint + listItemContent[0].text;
                  result.push(...listItemContent);
                }
                
                result.push({ 
                  text: '\n',
                  bold: false,
                  italic: false,
                  underline: false,
                  strikethrough: false
                });
              }
            });
            return;
          }
          
          // Handle paragraphs and line breaks
          if (el.tagName === 'P' && result.length > 0) {
            result.push({
              text: '\n',
              bold: false,
              italic: false,
              underline: false,
              strikethrough: false
            });
          }
          if (el.tagName === 'BR') {
            result.push({
              text: '\n',
              bold: false,
              italic: false,
              underline: false,
              strikethrough: false
            });
            return;
          }
          
          Array.from(el.childNodes).forEach(child => processNode(child, newFormat));
        }
      };
      
      processNode(element, {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
      });
      return result;
    };
    
    return extractFormatting(tempDiv);
  };

  const handleExportDOCX = async () => {
    try {
      setIsExporting(true);
      
      // Parse content and create formatted paragraphs
      const parsedContent = parseFormattedContent(content);
      let currentParagraph: Array<TextRun> = [];
      const paragraphs: Array<Paragraph> = [];
      
      // Add title
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 32 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        })
      );
      
      // Process content
      parsedContent.forEach(segment => {
        if (segment.text === '\n') {
          if (currentParagraph.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: currentParagraph,
                spacing: { after: 200 }
              })
            );
            currentParagraph = [];
          }
        } else {
          currentParagraph.push(
            new TextRun({
              text: segment.text,
              bold: segment.bold,
              italics: segment.italic,
              break: segment.text.endsWith('\n') ? 1 : 0
            })
          );
        }
      });
      
      // Add any remaining content as a paragraph
      if (currentParagraph.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: currentParagraph,
            spacing: { after: 200 }
          })
        );
      }
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      // Generate and save document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "DOCX exported successfully",
      });
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      toast({
        title: "Error",
        description: "Failed to export DOCX",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.width;
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 20);
      
      // Add content with formatting
      doc.setFontSize(12);
      let yPosition = 40;
      const parsedContent = parseFormattedContent(content);
      
      parsedContent.forEach(segment => {
        // Set font style based on formatting
        let fontStyle = 'normal';
        if (segment.bold && segment.italic) {
          fontStyle = 'bolditalic';
        } else if (segment.bold) {
          fontStyle = 'bold';
        } else if (segment.italic) {
          fontStyle = 'italic';
        }
        doc.setFont('helvetica', fontStyle);

        if (segment.text !== '\n') {
          const lines = doc.splitTextToSize(segment.text, 170);
          
          // Draw underline if needed
          if (segment.underline) {
            lines.forEach((line: string, index: number) => {
              const lineWidth = doc.getTextWidth(line);
              doc.line(20, yPosition + 1 + (index * 7), 20 + lineWidth, yPosition + 1 + (index * 7));
            });
          }
          
          // Draw strikethrough if needed
          if (segment.strikethrough) {
            lines.forEach((line: string, index: number) => {
              const lineWidth = doc.getTextWidth(line);
              doc.line(20, yPosition - 1 + (index * 7), 20 + lineWidth, yPosition - 1 + (index * 7));
            });
          }
          
          doc.text(lines, 20, yPosition);
          yPosition += (lines.length * 7);
        } else {
          yPosition += 7; // Add space for newline
        }
        
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-fraunces flex items-center justify-between">
            Edit Write-up
            {hasUnsavedChanges && (
              <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                Unsaved Changes
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving || isViewingVersions}
                className="h-12 w-full"
              />
            </div>
            <div className="flex-shrink-0 self-end h-12 mt-1">
              <VersionHistory
                writingId={writing.id}
                onRestoreVersion={handleRestoreVersion}
                onOpenChange={setIsViewingVersions}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="collection" className="text-sm font-medium text-gray-700">
              Collection (Optional)
            </label>
            <Select
              value={selectedCollection}
              onValueChange={setSelectedCollection}
              disabled={isSaving || isViewingVersions}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">None</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <label htmlFor="content" className="text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="w-full overflow-hidden border rounded-md">
              <TipTapEditor
                content={content}
                onChange={handleContentChange}
                readOnly={isViewingVersions}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                  disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                  Export as
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDOCX}>
                  Export as DOCX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              type="submit" 
              className="bg-gray-900 hover:bg-gray-800 text-white transition-colors" 
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
