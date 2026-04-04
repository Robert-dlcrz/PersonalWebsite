import { NavigationCard } from '@/components/NavigationCard';
import { NAVIGATION_CARDS } from '@/constants/content';

export function HomeNavigationGrid() {
  return (
    <>
      {NAVIGATION_CARDS.map((card) => {
        const IconComponent = card.icon;

        return (
          <NavigationCard
            key={card.id}
            href={card.href}
            gradientClasses={card.gradientClasses}
            icon={<IconComponent className="h-16 w-16 text-white" />}
            title={card.title}
            description={card.description}
            ctaText={card.ctaText}
            accentColor={card.accentColor}
          />
        );
      })}
    </>
  );
}
