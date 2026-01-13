"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, MoreVertical, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export function VisionUIKanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      color: "#94A3B8",
      tasks: [
        {
          id: "1",
          title: "Design new landing page",
          description: "Create a modern landing page design",
          assignee: "John Doe",
          priority: "high",
          tags: ["Design", "Frontend"],
        },
        {
          id: "2",
          title: "Update documentation",
          description: "Update API documentation",
          assignee: "Jane Smith",
          priority: "medium",
          tags: ["Documentation"],
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "#3B82F6",
      tasks: [
        {
          id: "3",
          title: "Implement user authentication",
          description: "Add login and signup functionality",
          assignee: "Bob Johnson",
          priority: "high",
          tags: ["Backend", "Security"],
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "#F59E0B",
      tasks: [
        {
          id: "4",
          title: "Code review for PR #123",
          description: "Review the new feature implementation",
          assignee: "Alice Williams",
          priority: "medium",
          tags: ["Review"],
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "#10B981",
      tasks: [
        {
          id: "5",
          title: "Fix bug in dashboard",
          description: "Resolved the dashboard loading issue",
          assignee: "Charlie Brown",
          priority: "low",
          tags: ["Bug Fix"],
        },
      ],
    },
  ]);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task);
    setDraggedFromColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask || !draggedFromColumn) return;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id === draggedFromColumn) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== draggedTask.id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, draggedTask],
          };
        }
        return col;
      });
      return newColumns;
    });

    setDraggedTask(null);
    setDraggedFromColumn(null);
  };

  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <XCircle className="w-4 h-4 text-[#EF4444]" />;
      case "medium":
        return <Clock className="w-4 h-4 text-[#F59E0B]" />;
      case "low":
        return <Circle className="w-4 h-4 text-[#10B981]" />;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-[#EF4444]";
      case "medium":
        return "border-l-[#F59E0B]";
      case "low":
        return "border-l-[#10B981]";
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Kanban Board</h3>
          <p className="text-sm text-[#94A3B8]">Manage your tasks efficiently</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-full md:w-auto"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h4 className="text-sm font-semibold text-white">{column.title}</h4>
              <span className="text-xs text-[#94A3B8] bg-[#334155] px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  className={cn(
                    "bg-[#0F172A] border-l-4 rounded-lg p-4 cursor-move hover:shadow-lg transition-all",
                    getPriorityColor(task.priority),
                    "border-t border-r border-b border-[#334155]"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-semibold text-white flex-1">{task.title}</h5>
                    <button className="text-[#94A3B8] hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2">{task.description}</p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-[#334155] text-[#CBD5E1] rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(task.priority)}
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignee.charAt(0)}
                        </div>
                      )}
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-[#94A3B8]">{task.dueDate}</span>
                    )}
                  </div>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-[#334155] rounded-lg">
                  <p className="text-sm text-[#64748B]">Drop tasks here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

