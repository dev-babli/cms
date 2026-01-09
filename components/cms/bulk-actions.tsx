"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Copy, Archive, CheckCircle, XCircle, Tag } from "lucide-react";

interface BulkActionsProps {
  selectedIds: number[];
  onBulkAction: (action: string, ids: number[], options?: any) => Promise<void>;
  contentType: string;
  availableActions?: string[];
}

export function BulkActions({
  selectedIds,
  onBulkAction,
  contentType,
  availableActions = ["publish", "unpublish", "delete", "duplicate", "archive", "tag"],
}: BulkActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tagValue, setTagValue] = useState("");

  const handleAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    if (action === "tag") {
      setSelectedAction(action);
      setIsDialogOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkAction(action, selectedIds);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTagSubmit = async () => {
    if (!tagValue.trim()) return;

    setIsProcessing(true);
    try {
      await onBulkAction("tag", selectedIds, { tag: tagValue });
      setIsDialogOpen(false);
      setTagValue("");
      setSelectedAction(null);
    } catch (error) {
      console.error("Bulk tag failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedIds.length === 0) return null;

  const actionIcons: Record<string, any> = {
    publish: CheckCircle,
    unpublish: XCircle,
    delete: Trash2,
    duplicate: Copy,
    archive: Archive,
    tag: Tag,
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <span className="text-sm text-[#6B7280] font-medium">
          {selectedIds.length} selected
        </span>
        <div className="flex items-center gap-1">
          {availableActions.map((action) => {
            const Icon = actionIcons[action];
            return (
              <Button
                key={action}
                variant="ghost"
                size="sm"
                onClick={() => handleAction(action)}
                disabled={isProcessing}
                className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827] hover:bg-white"
              >
                {Icon && <Icon className="w-3.5 h-3.5 mr-1" />}
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-[#E5E7EB] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-[#111827]">
              Add Tag to {selectedIds.length} items
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              Enter a tag to apply to all selected items
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              placeholder="Enter tag name"
              className="w-full h-8 px-3 border border-[#E5E7EB] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTagSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDialogOpen(false);
                setTagValue("");
                setSelectedAction(null);
              }}
              className="text-[#6B7280] hover:text-[#111827]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTagSubmit}
              disabled={!tagValue.trim() || isProcessing}
              className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
            >
              Apply Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}







