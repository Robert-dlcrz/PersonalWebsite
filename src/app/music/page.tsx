import Link from 'next/link';

export default function Music() {
  // Sample music data - you can replace this with real data later
  const playlists = [
    {
      id: 1,
      title: "Coding Sessions",
      genre: "Electronic / Chill",
      trackCount: 42,
      description: "The perfect soundtrack for deep focus coding sessions. Electronic beats and ambient sounds to keep you in the zone.",
      color: "from-purple-400 to-pink-500",
      emoji: "💻",
    },
    {
      id: 2,
      title: "Road Trip Vibes",
      genre: "Indie / Alternative",
      trackCount: 38,
      description: "Windows down, volume up. The ultimate collection of indie and alternative tracks for the open road.",
      color: "from-orange-400 to-red-500",
      emoji: "🚗",
    },
    {
      id: 3,
      title: "Sunset Sessions",
      genre: "Lofi / Jazz",
      trackCount: 28,
      description: "Smooth jazz and lofi beats perfect for unwinding as the day winds down. Your evening relaxation companion.",
      color: "from-yellow-400 to-orange-500",
      emoji: "🌅",
    },
    {
      id: 4,
      title: "Workout Energy",
      genre: "Hip Hop / EDM",
      trackCount: 35,
      description: "High-energy tracks to power through your workout. Bass-heavy beats that keep you moving and motivated.",
      color: "from-green-400 to-teal-500",
      emoji: "💪",
    },
    {
      id: 5,
      title: "Late Night Thoughts",
      genre: "R&B / Soul",
      trackCount: 31,
      description: "Smooth R&B and soulful melodies for those introspective late-night moments. Pure vibes only.",
      color: "from-blue-400 to-indigo-500",
      emoji: "🌙",
    },
    {
      id: 6,
      title: "Morning Coffee",
      genre: "Acoustic / Folk",
      trackCount: 25,
      description: "Start your day right with mellow acoustic tunes and folk melodies that pair perfectly with your morning brew.",
      color: "from-amber-400 to-yellow-500",
      emoji: "☕",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Music & Sounds
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Music is the soundtrack to life. Explore my curated playlists and discover the sounds that inspire me daily.
            </p>
            
            {/* SoundCloud CTA */}
            <a
              href="https://soundcloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z"/>
              </svg>
              Follow on SoundCloud
            </a>
          </div>

          {/* Playlists Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {playlists.map((playlist) => (
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
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-800 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
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
              About My Music Taste
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Music has always been a huge part of my life. From discovering new artists to creating the perfect playlist for every mood, 
                I believe music has the power to transform any moment.
              </p>
              <p>
                My taste is eclectic – I appreciate everything from electronic and indie to jazz and hip-hop. What matters most is the vibe, 
                the emotion, and how a track makes you feel. Whether I'm coding, traveling, or just relaxing, there's always a perfect soundtrack.
              </p>
              <p>
                Check out my SoundCloud to dive deeper into my musical journey, discover my latest finds, and see what's currently on repeat!
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="https://soundcloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z"/>
                </svg>
                <h3 className="text-2xl font-semibold">Visit My SoundCloud</h3>
              </div>
              <p className="text-white/90 mb-4">
                Follow me on SoundCloud to stay updated with my latest tracks, favorites, and playlists.
              </p>
              <span className="inline-flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                Open SoundCloud
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </span>
            </a>

            <Link
              href="/"
              className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Back to Home</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Return to the homepage to explore more about me and my other interests.
              </p>
              <span className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium group-hover:gap-3 transition-all">
                Go Home
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

