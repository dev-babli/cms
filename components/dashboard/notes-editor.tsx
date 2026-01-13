"use client";

import { SimpleRichEditor } from "./simple-rich-editor";

export function NotesEditor() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Notes</h2>
      <SimpleRichEditor placeholder="Type your notes..." />
    </div>
  );
}





