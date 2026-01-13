import { requireAuth } from "@/lib/auth/server";
import { VisionUIDashboard } from "@/components/vision-ui/dashboard/dashboard-page";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // requireAuth() will redirect to login if not authenticated
  // Don't catch the redirect error - let Next.js handle it
  const user = await requireAuth();
  
  // Serialize user object to ensure it's safe to pass to client component
  // Only include plain serializable properties (no functions, classes, etc.)
  const serializedUser = {
    name: user.name || user.email?.split('@')[0] || 'User',
    role: user.role || 'viewer',
  };
  
  return <VisionUIDashboard user={serializedUser} />;
}
