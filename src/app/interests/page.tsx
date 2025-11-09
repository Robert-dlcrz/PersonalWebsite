import Link from 'next/link';
import { ArrowLeftIcon, GlobeAltIcon, MapPinIcon, HomeIcon } from '@heroicons/react/24/outline';
import { INTERESTS_CONTENT, ADVENTURES } from '@/constants/content';

export default function Interests() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-green-950 dark:to-blue-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {INTERESTS_CONTENT.backToHome}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-6">
              <GlobeAltIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              {INTERESTS_CONTENT.hero.title}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {INTERESTS_CONTENT.hero.subtitle}
            </p>
          </div>

          {/* Adventures Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ADVENTURES.map((adventure) => (
              <div
                key={adventure.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex items-center justify-center text-6xl">
                  {adventure.image}
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {adventure.title}
                    </h3>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {adventure.location}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {adventure.date}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {adventure.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
              {INTERESTS_CONTENT.cta.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {INTERESTS_CONTENT.cta.description}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <HomeIcon className="h-5 w-5" />
              {INTERESTS_CONTENT.cta.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

