import { NavigationCard } from '@/components/NavigationCard';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { PERSONAL_INFO, HOME_CONTENT, NAVIGATION_CARDS } from '@/constants/content';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 pt-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {PERSONAL_INFO.name}
            </h1>
            <p className="text-2xl text-slate-600 dark:text-slate-300 mb-2">
              {PERSONAL_INFO.title}
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {PERSONAL_INFO.domain}
            </p>
          </div>

          {/* About Me Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-12 border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              {HOME_CONTENT.aboutMe.title}
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{HOME_CONTENT.aboutMe.professional.label}</span>{' '}
                {HOME_CONTENT.aboutMe.professional.text}
              </p>
              <p>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{HOME_CONTENT.aboutMe.personal.label}</span>{' '}
                {HOME_CONTENT.aboutMe.personal.text}
              </p>
              <p>
                <span className="font-semibold text-green-600 dark:text-green-400">{HOME_CONTENT.aboutMe.hobbies.label}</span>{' '}
                {HOME_CONTENT.aboutMe.hobbies.text}
              </p>
            </div>

            {/* Resume Download Button */}
            <div className="mt-8 flex justify-center">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                {HOME_CONTENT.resumeButton}
              </a>
            </div>
          </div>

          {/* Explore More Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-center mb-8 text-slate-800 dark:text-slate-100">
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
                    icon={<IconComponent className="h-8 w-8 text-white" />}
                    title={card.title}
                    description={card.description}
                    ctaText={card.ctaText}
                    accentColor={card.accentColor}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="container mx-auto px-6 text-center text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} {PERSONAL_INFO.name}. {HOME_CONTENT.footer.text}</p>
        </div>
      </footer>
    </main>
  );
}
