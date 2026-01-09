"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Save, Eye, Copy, Trash2 } from "lucide-react";

interface QuickActionsProps {
  onSave?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  contentType: string;
  contentId?: number;
}

export function QuickActions({
  onSave,
  onPreview,
  onDuplicate,
  onDelete,
  contentType,
  contentId,
}: QuickActionsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl/Cmd + P - Preview
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        onPreview?.();
      }

      // Ctrl/Cmd + D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        onDuplicate?.();
      }

      // Ctrl/Cmd + K - Show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowShortcuts(true);
      }

      // Delete key - Delete (with confirmation)
      if (e.key === "Delete" && e.shiftKey && onDelete) {
        e.preventDefault();
        if (confirm("Delete this content?")) {
          onDelete();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onPreview, onDuplicate, onDelete]);

  const shortcuts = [
    { key: "Ctrl/Cmd + S", action: "Save", icon: Save },
    { key: "Ctrl/Cmd + P", action: "Preview", icon: Eye },
    { key: "Ctrl/Cmd + D", action: "Duplicate", icon: Copy },
    { key: "Ctrl/Cmd + K", action: "Show Shortcuts", icon: Keyboard },
    { key: "Shift + Delete", action: "Delete", icon: Trash2 },
  ];

  return (
    <>
      <div className="flex items-center gap-2">
        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
            title="Save (Ctrl/Cmd + S)"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
        )}
        {onPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
            title="Preview (Ctrl/Cmd + P)"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview
          </Button>
        )}
        {onDuplicate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
            title="Duplicate (Ctrl/Cmd + D)"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            Duplicate
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(true)}
          className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
          title="Show Shortcuts (Ctrl/Cmd + K)"
        >
          <Keyboard className="w-3.5 h-3.5 mr-1" />
          Shortcuts
        </Button>
      </div>

      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="bg-white border border-[#E5E7EB] rounded-md max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-[#111827]">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              Quick actions for content editing
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-2 hover:bg-[#F9FAFB] rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#111827]">{shortcut.action}</span>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-mono bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[#6B7280]">
                    {shortcut.key}
                  </kbd>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}







