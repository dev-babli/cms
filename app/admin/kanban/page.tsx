import { requireAuth } from "@/lib/auth/server";
import { VisionUIKanbanBoard } from "@/components/vision-ui/kanban/kanban-board";

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  await requireAuth();
  return <VisionUIKanbanBoard />;
}

