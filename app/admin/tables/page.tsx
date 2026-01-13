import { requireAuth } from "@/lib/auth/server";
import { VisionUITablesPage } from "@/components/vision-ui/tables/tables-page";

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  await requireAuth();
  return <VisionUITablesPage />;
}

