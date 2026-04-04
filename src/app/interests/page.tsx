import { InterestsPageContent } from '@/components/InterestsPageContent';
import { SiteFooter } from '@/components/SiteFooter';
import { tripService } from '@/service/tripService';

export default async function Interests() {
  const trips = await tripService.fetchTripSummaries();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <InterestsPageContent trips={trips} />

      <SiteFooter />
    </main>
  );
}

