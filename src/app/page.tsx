import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 pt-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Robert De La Cruz
            </h1>
            <p className="text-2xl text-slate-600 dark:text-slate-300 mb-2">
              Software Development Engineer
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              robertdelacruz.com
            </p>
          </div>

          {/* About Me Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-12 border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              About Me
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Professional:</span>{' '}
                I'm a passionate software engineer specializing in building scalable, high-performance applications. 
                With expertise in cloud architecture, full-stack development, and modern web technologies, 
                I love solving complex problems and creating elegant solutions.
              </p>
              <p>
                <span className="font-semibold text-purple-600 dark:text-purple-400">Personal:</span>{' '}
                Outside of coding, I'm driven by curiosity and a love for learning. I enjoy exploring new technologies,
                contributing to open-source projects, and sharing knowledge with the developer community.
              </p>
              <p>
                <span className="font-semibold text-green-600 dark:text-green-400">Hobbies:</span>{' '}
                When I'm not at my desk, you'll find me traveling to new destinations, discovering incredible music,
                and seeking out adventures that push me outside my comfort zone. Life's too short not to explore!
              </p>
            </div>

            {/* Resume Download Button */}
            <div className="mt-8 flex justify-center">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Resume
              </a>
            </div>
          </div>

          {/* Explore More Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-center mb-8 text-slate-800 dark:text-slate-100">
              Explore More
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Travel & Adventures Card */}
              <Link href="/interests">
                <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 border border-slate-200 dark:border-slate-700 cursor-pointer transform hover:scale-105 transition-all duration-300 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
                      Travel & Adventures
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Explore my journey around the world. From mountain peaks to hidden gems, 
                      discover the places I've been and the adventures I've had.
                    </p>
                    <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                      View Adventures
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>

              {/* Music Card */}
              <Link href="/music">
                <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 border border-slate-200 dark:border-slate-700 cursor-pointer transform hover:scale-105 transition-all duration-300 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
                      Music & Sounds
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Dive into my musical world. Check out my favorite tracks, playlists, 
                      and connect with me on SoundCloud to explore the sounds that inspire me.
                    </p>
                    <span className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium group-hover:gap-3 transition-all">
                      Explore Music
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="container mx-auto px-6 text-center text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Robert De La Cruz. Built with Next.js & Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  );
}
