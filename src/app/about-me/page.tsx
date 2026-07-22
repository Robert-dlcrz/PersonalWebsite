import { AboutMeEditorialSplit } from '@/components/about-me/AboutMeEditorialSplit';
import { profileService } from '@/service/profileService';

export default function AboutMePage() {
  const photoUrl = profileService.fetchProfilePhotoUrl();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AboutMeEditorialSplit photoUrl={photoUrl} />
    </main>
  );
}
