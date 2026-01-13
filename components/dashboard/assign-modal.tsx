"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AssignModalProps {
  onClose: () => void;
  onSave: (assignee: string) => void;
}

export function AssignModal({ onClose, onSave }: AssignModalProps) {
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const assignees = ["Rasel", "Victor", "Jennifer", "Mufidul"];

  const handleSave = () => {
    if (selectedAssignee) {
      onSave(selectedAssignee);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Assign</h3>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Assignee
          </label>
          <div className="relative">
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent appearance-none bg-white"
            >
              <option value="">Select Assignee</option>
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-[#6B7280]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#E5E7EB]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6B7280] bg-[#F9FAFB] rounded-md hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#10B981] rounded-md hover:bg-[#059669] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}





