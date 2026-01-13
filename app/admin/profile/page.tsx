import { requireAuth, getCurrentUser } from "@/lib/auth/server";
import { VisionUIProfilePage } from "@/components/vision-ui/profile/profile-page";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireAuth();
  return <VisionUIProfilePage user={user} />;
}

