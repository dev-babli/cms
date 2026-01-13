"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignModal } from "./assign-modal";

interface Task {
  id: number;
  title: string;
  status: "Approve" | "Pending" | "Complete";
  assignee?: string;
}

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Approve danny's Acess",
      status: "Approve",
      assignee: "Jennifer",
    },
    {
      id: 2,
      title: "Add Danny to the Facebook ads account",
      status: "Approve",
    },
  ]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = (taskId: number) => {
    setSelectedTaskId(taskId);
    setShowAssignModal(true);
  };

  const handleSaveAssign = (assignee: string) => {
    if (selectedTaskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTaskId ? { ...task, assignee } : task
        )
      );
    }
    setShowAssignModal(false);
    setSelectedTaskId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Approve":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Tasks</CardTitle>
            <button className="px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors shadow-sm">
              + Add Tasks
            </button>
          </div>
          <CardDescription>Manage your team tasks and assignments</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold">
                  TASK
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold">
                  STATUS
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold">
                  ASSIGN
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm">
                    {task.title}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {task.assignee ? (
                      <span className="text-sm">
                        {task.assignee}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssign(task.id)}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/90 transition-colors shadow-sm"
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>1 of 101</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors">
                &lt; Back
              </button>
              <button className="px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors">
                Next &gt;
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAssignModal && (
        <AssignModal
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTaskId(null);
          }}
          onSave={handleSaveAssign}
        />
      )}
    </>
  );
}





