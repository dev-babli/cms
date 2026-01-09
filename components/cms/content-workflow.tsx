"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

interface WorkflowAction {
  id: string;
  name: string;
  type: string;
  fromStage: string;
  toStage: string;
  requiresComment?: boolean;
}

interface ContentWorkflowProps {
  contentType: string;
  contentId: number;
  currentStage?: string;
  workflowId?: string;
  onTransition?: (actionId: string, comment?: string) => Promise<void>;
}

export function ContentWorkflow({
  contentType,
  contentId,
  currentStage,
  workflowId,
  onTransition,
}: ContentWorkflowProps) {
  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflow();
  }, [workflowId, contentType]);

  const loadWorkflow = async () => {
    try {
      const response = await fetch(
        `/api/cms/workflows/${workflowId || contentType}`
      );
      const data = await response.json();
      if (data.success) {
        setWorkflow(data.data);
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
    }
  };

  const handleAction = async (action: WorkflowAction) => {
    if (action.requiresComment) {
      setPendingAction(action.id);
      setShowCommentDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      await onTransition?.(action.id);
      await loadWorkflow();
    } catch (error) {
      console.error("Workflow transition failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionWithComment = async () => {
    if (!pendingAction || !comment.trim()) return;

    setIsLoading(true);
    try {
      await onTransition?.(pendingAction, comment);
      setShowCommentDialog(false);
      setComment("");
      setPendingAction(null);
      await loadWorkflow();
    } catch (error) {
      console.error("Workflow transition failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!workflow) {
    return (
      <div className="text-sm text-[#6B7280] py-4">
        No workflow configured
      </div>
    );
  }

  const currentStageData = workflow.stages?.find(
    (s: WorkflowStage) => s.id === currentStage
  );
  const availableActions = workflow.actions?.filter(
    (a: WorkflowAction) => a.fromStage === currentStage
  );

  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case "check-circle":
        return CheckCircle;
      case "clock":
        return Clock;
      case "x-circle":
        return XCircle;
      case "alert-circle":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-[#111827] mb-2">
          Workflow Status
        </h3>
        {currentStageData && (
          <div className="flex items-center gap-2 p-3 border border-[#E5E7EB] rounded-md bg-white">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentStageData.color }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#111827]">
                {currentStageData.name}
              </p>
              {currentStageData.description && (
                <p className="text-xs text-[#6B7280]">
                  {currentStageData.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {availableActions && availableActions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#6B7280] mb-2 uppercase">
            Available Actions
          </h4>
          <div className="space-y-2">
            {availableActions.map((action: WorkflowAction) => {
              const toStage = workflow.stages?.find(
                (s: WorkflowStage) => s.id === action.toStage
              );
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                  className="w-full justify-start h-8 text-xs"
                >
                  {toStage?.name || action.name}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-md p-4 w-96">
            <h3 className="text-sm font-medium text-[#111827] mb-2">
              Add Comment
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter a comment for this transition..."
              className="w-full h-24 p-2 text-sm border border-[#E5E7EB] rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommentDialog(false);
                  setComment("");
                  setPendingAction(null);
                }}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActionWithComment}
                disabled={!comment.trim() || isLoading}
                className="flex-1 text-xs bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







