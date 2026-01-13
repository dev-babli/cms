import { requireAuth } from "@/lib/auth/server";
import { VisionUILayoutWrapper } from "@/components/vision-ui/layout-wrapper";

export const dynamic = 'force-dynamic';

/**
 * Vision UI Admin Layout - Exact Match to Figma Design
 * Dark theme with blue/purple gradients
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(); // Ensure user is authenticated

  return (
    <VisionUILayoutWrapper>
      {children}
    </VisionUILayoutWrapper>
  );
}
