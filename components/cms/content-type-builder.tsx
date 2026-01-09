"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Settings,
} from "lucide-react";
import { FieldTypes, type FieldConfig, type ContentType, SchemaBuilder } from "@/lib/cms/advanced-schemas";

interface ContentTypeBuilderProps {
  contentType?: ContentType;
  onSave?: (contentType: ContentType) => void;
  onPreview?: (contentType: ContentType) => void;
}

export function ContentTypeBuilder({
  contentType,
  onSave,
  onPreview,
}: ContentTypeBuilderProps) {
  const [builder, setBuilder] = useState<SchemaBuilder | null>(null);
  const [name, setName] = useState(contentType?.name || "");
  const [label, setLabel] = useState(contentType?.label || "");
  const [description, setDescription] = useState(contentType?.description || "");
  const [fields, setFields] = useState<FieldConfig[]>(contentType?.fields || []);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [fieldForm, setFieldForm] = useState<Partial<FieldConfig>>({});

  useEffect(() => {
    if (contentType) {
      setName(contentType.name);
      setLabel(contentType.label);
      setDescription(contentType.description || "");
      setFields(contentType.fields);
    } else {
      const newBuilder = new SchemaBuilder("", "", "");
      setBuilder(newBuilder);
    }
  }, [contentType]);

  const handleAddField = () => {
    setEditingField(null);
    setFieldForm({
      type: FieldTypes.TEXT,
      label: "",
      name: "",
      required: false,
      options: { width: "full" },
    });
    setShowFieldDialog(true);
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingField(field);
    setFieldForm({ ...field });
    setShowFieldDialog(true);
  };

  const handleSaveField = () => {
    if (!fieldForm.name || !fieldForm.label || !fieldForm.type) return;

    const newField: FieldConfig = {
      id: editingField?.id || fieldForm.name,
      name: fieldForm.name,
      label: fieldForm.label,
      type: fieldForm.type as any,
      description: fieldForm.description,
      required: fieldForm.required || false,
      defaultValue: fieldForm.defaultValue,
      options: fieldForm.options || {},
    };

    if (editingField) {
      setFields(fields.map((f) => (f.id === editingField.id ? newField : f)));
    } else {
      setFields([...fields, newField]);
    }

    setShowFieldDialog(false);
    setFieldForm({});
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleSave = () => {
    if (!name || !label) return;

    const builtType: ContentType = {
      id: contentType?.id || name.toLowerCase().replace(/\s+/g, "_"),
      name,
      label,
      description,
      fields,
      icon: contentType?.icon,
      color: contentType?.color,
    };

    onSave?.(builtType);
  };

  const fieldTypeOptions = [
    { value: FieldTypes.TEXT, label: "Text" },
    { value: FieldTypes.TEXTAREA, label: "Textarea" },
    { value: FieldTypes.RICHTEXT, label: "Rich Text" },
    { value: FieldTypes.NUMBER, label: "Number" },
    { value: FieldTypes.BOOLEAN, label: "Boolean" },
    { value: FieldTypes.DATE, label: "Date" },
    { value: FieldTypes.EMAIL, label: "Email" },
    { value: FieldTypes.URL, label: "URL" },
    { value: FieldTypes.SELECT, label: "Select" },
    { value: FieldTypes.MULTISELECT, label: "Multi-select" },
    { value: FieldTypes.IMAGE, label: "Image" },
    { value: FieldTypes.FILE, label: "File" },
    { value: FieldTypes.REFERENCE, label: "Reference" },
    { value: FieldTypes.ARRAY, label: "Array" },
    { value: FieldTypes.OBJECT, label: "Object" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-[#111827]">Content Type Builder</h2>
          <p className="text-sm text-[#6B7280]">Define your content structure</p>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const builtType: ContentType = {
                  id: contentType?.id || name.toLowerCase().replace(/\s+/g, "_"),
                  name,
                  label,
                  description,
                  fields,
                };
                onPreview(builtType);
              }}
              className="h-8 px-2 text-xs"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={!name || !label}
            className="h-8 px-2 text-xs bg-[#3B82F6] text-white hover:bg-[#2563EB]"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4 p-4 border border-[#E5E7EB] rounded-md bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm text-[#111827]">
              Name (ID)
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="blog_post"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="label" className="text-sm text-[#111827]">
              Label
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Blog Post"
              className="mt-1 h-8 text-sm"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="text-sm text-[#111827]">
            Description
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A blog post content type"
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#111827]">Fields</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddField}
            className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="p-8 text-center border border-[#E5E7EB] rounded-md bg-[#F9FAFB]">
            <p className="text-sm text-[#6B7280] mb-4">No fields defined yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="h-8 px-2 text-xs"
            >
              Add Your First Field
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-md bg-white hover:bg-[#F9FAFB]"
              >
                <GripVertical className="w-4 h-4 text-[#6B7280] cursor-move" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#111827]">
                      {field.label}
                    </span>
                    <span className="text-xs text-[#6B7280]">({field.name})</span>
                    <span className="text-xs px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-xs text-[#EF4444]">Required</span>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-xs text-[#6B7280] mt-1">{field.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField(field)}
                    className="h-7 px-2 text-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
                    className="h-7 px-2 text-xs text-[#EF4444] hover:text-[#DC2626]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Field Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="bg-white border border-[#E5E7EB] rounded-md max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-[#111827]">
              {editingField ? "Edit Field" : "Add Field"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280]">
              Configure the field properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-name" className="text-sm text-[#111827]">
                  Name (ID)
                </Label>
                <Input
                  id="field-name"
                  value={fieldForm.name || ""}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, name: e.target.value })
                  }
                  placeholder="title"
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="field-label" className="text-sm text-[#111827]">
                  Label
                </Label>
                <Input
                  id="field-label"
                  value={fieldForm.label || ""}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, label: e.target.value })
                  }
                  placeholder="Title"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="field-type" className="text-sm text-[#111827]">
                Type
              </Label>
              <select
                id="field-type"
                value={fieldForm.type || FieldTypes.TEXT}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, type: e.target.value as any })
                }
                className="mt-1 w-full h-8 px-3 text-sm border border-[#E5E7EB] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              >
                {fieldTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="field-description" className="text-sm text-[#111827]">
                Description (optional)
              </Label>
              <Input
                id="field-description"
                value={fieldForm.description || ""}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, description: e.target.value })
                }
                placeholder="Field description"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="field-required"
                checked={fieldForm.required || false}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, required: e.target.checked })
                }
                className="w-4 h-4 text-[#3B82F6] border-[#E5E7EB] rounded focus:ring-[#3B82F6]"
              />
              <Label htmlFor="field-required" className="text-sm text-[#111827]">
                Required field
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowFieldDialog(false);
                setFieldForm({});
                setEditingField(null);
              }}
              className="text-[#6B7280] hover:text-[#111827]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveField}
              disabled={!fieldForm.name || !fieldForm.label}
              className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
            >
              {editingField ? "Update" : "Add"} Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}







