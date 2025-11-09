import Link from 'next/link';
import { ArrowLeftIcon, MusicalNoteIcon, PlayCircleIcon, ArrowTopRightOnSquareIcon, HomeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { MUSIC_CONTENT, PLAYLISTS } from '@/constants/content';

export default function Music() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {MUSIC_CONTENT.backToHome}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-6">
              <MusicalNoteIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {MUSIC_CONTENT.hero.title}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              {MUSIC_CONTENT.hero.subtitle}
            </p>
            
            {/* SoundCloud CTA */}
            <a
              href={MUSIC_CONTENT.hero.soundcloudUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z"/>
              </svg>
              {MUSIC_CONTENT.hero.soundcloudButton}
            </a>
          </div>

          {/* Playlists Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {PLAYLISTS.map((playlist) => (
              <div
                key={playlist.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                {/* Playlist Cover */}
                <div className={`h-48 bg-gradient-to-br ${playlist.color} flex items-center justify-center text-6xl relative`}>
                  <span className="transform group-hover:scale-110 transition-transform duration-300">
                    {playlist.emoji}
                  </span>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <PlayCircleIcon className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                    {playlist.genre}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {playlist.trackCount} tracks
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {playlist.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* About My Music Taste */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              {MUSIC_CONTENT.about.title}
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              {MUSIC_CONTENT.about.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href={MUSIC_CONTENT.hero.soundcloudUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z"/>
                </svg>
                <h3 className="text-2xl font-semibold">{MUSIC_CONTENT.cta.soundcloud.title}</h3>
              </div>
              <p className="text-white/90 mb-4">
                {MUSIC_CONTENT.cta.soundcloud.description}
              </p>
              <span className="inline-flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                {MUSIC_CONTENT.cta.soundcloud.buttonText}
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </span>
            </a>

            <Link
              href="/"
              className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <HomeIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{MUSIC_CONTENT.cta.home.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {MUSIC_CONTENT.cta.home.description}
              </p>
              <span className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium group-hover:gap-3 transition-all">
                {MUSIC_CONTENT.cta.home.buttonText}
                <ArrowRightIcon className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

