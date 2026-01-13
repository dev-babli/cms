import { requireAuth } from "@/lib/auth/server";
import { VisionUIAnalyticsPage } from "@/components/vision-ui/analytics/analytics-page";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  await requireAuth();
  return <VisionUIAnalyticsPage />;
}

