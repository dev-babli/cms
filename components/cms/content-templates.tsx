"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, Trash2 } from "lucide-react";

interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  contentType: string;
  content: any;
  createdAt: string;
}

interface ContentTemplatesProps {
  contentType: string;
  currentContent: any;
  onApplyTemplate: (template: ContentTemplate) => void;
}

export function ContentTemplates({
  contentType,
  currentContent,
  onApplyTemplate,
}: ContentTemplatesProps) {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  useEffect(() => {
    loadTemplates();
  }, [contentType]);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/cms/templates?type=${contentType}`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/cms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          contentType,
          content: currentContent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadTemplates();
        setIsSaveDialogOpen(false);
        setTemplateName("");
        setTemplateDescription("");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      const response = await fetch(`/api/cms/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadTemplates();
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#111827]">Templates</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSaveDialogOpen(true)}
          className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          Save Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-[#6B7280] py-4 text-center">
          No templates saved yet
        </p>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-[#111827] truncate">
                      {template.name}
                    </h4>
                    {template.description && (
                      <p className="text-xs text-[#6B7280] truncate">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplyTemplate(template)}
                  className="h-7 px-2 text-xs"
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="h-7 px-2 text-xs text-[#EF4444] hover:text-[#DC2626]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-white border border-[#E5E7EB] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-[#111827]">
              Save Template
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              Save the current content as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name" className="text-sm text-[#111827]">
                Template Name
              </Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Standard Blog Post"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="template-description"
                className="text-sm text-[#111827]"
              >
                Description (optional)
              </Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe when to use this template"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setTemplateName("");
                setTemplateDescription("");
              }}
              className="text-[#6B7280] hover:text-[#111827]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim() || isLoading}
              className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}







