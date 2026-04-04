import { NavigationCard } from '@/components/NavigationCard';
import { AnimatedSection } from '@/components/AnimatedSection';
import { PERSONAL_INFO, HOME_CONTENT, NAVIGATION_CARDS } from '@/constants/content';

const footer = (
  <footer className="border-t border-foreground/10 py-8 mt-auto">
    <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12 text-center text-sm text-foreground/40">
      <p>
        &copy; {new Date().getFullYear()} {PERSONAL_INFO.name}.{' '}
        {HOME_CONTENT.footer.text}
      </p>
    </div>
  </footer>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AnimatedSection className="pt-8 pb-6 md:pt-10 md:pb-8">
        <div className="mx-auto w-full max-w-[2000px] px-6 md:px-8 lg:px-10">
          <h1 className="font-[family-name:var(--font-display)] tracking-tight text-center md:text-left text-foreground">
            <span className="block text-[clamp(5rem,22vw,18rem)] leading-[0.8]">
              Robert
            </span>
            <span className="block text-[clamp(3.25rem,15vw,12rem)] leading-[0.86]">
              De La Cruz
            </span>
          </h1>
        </div>
      </AnimatedSection>

      <AnimatedSection className="pb-8 md:pb-12" delay={0.1}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">
          <div className="grid md:grid-cols-2 gap-6">
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
          </div>
        </div>
      </AnimatedSection>

      {footer}
    </main>
  );
}
