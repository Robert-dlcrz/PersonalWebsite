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
      <AnimatedSection className="pt-8 pb-8 md:pt-10 md:pb-12">
        <div className="mx-auto w-full max-w-[2200px] px-5 md:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-foreground text-center md:text-left">
            <span className="hidden min-[1180px]:block whitespace-nowrap text-[clamp(4.8rem,10.6vw,14rem)] leading-[0.88] tracking-[-0.07em]">
              Robert De La Cruz
            </span>

            <span className="block min-[1180px]:hidden">
              <span className="block whitespace-nowrap text-[clamp(5rem,24vw,20rem)] leading-[0.76] tracking-[-0.05em]">
                Robert
              </span>
              <span className="block whitespace-nowrap text-[clamp(3.25rem,17vw,13.75rem)] leading-[0.82] tracking-[-0.05em]">
                De La Cruz
              </span>
            </span>
          </h1>

          <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2">
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
