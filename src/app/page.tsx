import { NavigationCard } from '@/components/NavigationCard';
import { AnimatedSection } from '@/components/AnimatedSection';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  PERSONAL_INFO,
  HOME_CONTENT,
  NAVIGATION_CARDS,
} from '@/constants/content';

const footer = (
  <footer className="border-t border-foreground/10 py-8 mt-auto">
    <div className="px-6 md:px-12 lg:px-20 text-center text-sm text-foreground/40">
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
      {/* Hero */}
      <AnimatedSection className="px-6 md:px-12 lg:px-20 pt-24 pb-16 md:pt-32 md:pb-20">
        <p className="text-sm tracking-widest uppercase text-foreground/50 mb-4">
          {PERSONAL_INFO.title}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.9] tracking-tight">
          {PERSONAL_INFO.name}
        </h1>
      </AnimatedSection>

      {/* About */}
      <AnimatedSection
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-foreground/10"
        delay={0.1}
      >
        <div className="max-w-3xl">
          <h2 className="text-xs tracking-widest uppercase text-foreground/50 mb-8">
            {HOME_CONTENT.aboutMe.title}
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
            <p>
              <span className="font-semibold text-foreground">
                {HOME_CONTENT.aboutMe.professional.label}
              </span>{' '}
              {HOME_CONTENT.aboutMe.professional.text}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {HOME_CONTENT.aboutMe.personal.label}
              </span>{' '}
              {HOME_CONTENT.aboutMe.personal.text}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {HOME_CONTENT.aboutMe.hobbies.label}
              </span>{' '}
              {HOME_CONTENT.aboutMe.hobbies.text}
            </p>
          </div>

          <div className="mt-10">
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium tracking-wide hover:opacity-80 transition-opacity"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {HOME_CONTENT.resumeButton}
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Explore Grid */}
      <AnimatedSection
        className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-foreground/10"
        delay={0.15}
      >
        <h2 className="text-xs tracking-widest uppercase text-foreground/50 mb-10">
          {HOME_CONTENT.exploreMore.title}
        </h2>
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
      </AnimatedSection>

      {footer}
    </main>
  );
}
