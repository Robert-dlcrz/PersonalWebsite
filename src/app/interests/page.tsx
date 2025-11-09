import Link from 'next/link';

export default function Interests() {
  // Sample travel data - you can replace this with real data later
  const adventures = [
    {
      id: 1,
      title: "Mountain Hiking in the Alps",
      location: "Swiss Alps, Switzerland",
      date: "Summer 2024",
      description: "An unforgettable journey through breathtaking mountain trails, pristine lakes, and charming alpine villages.",
      image: "🏔️",
    },
    {
      id: 2,
      title: "Coastal Road Trip",
      location: "Pacific Coast Highway, California",
      date: "Spring 2024",
      description: "Cruising along the stunning California coastline, from San Francisco to San Diego, discovering hidden beaches and scenic viewpoints.",
      image: "🌊",
    },
    {
      id: 3,
      title: "Urban Exploration",
      location: "Tokyo, Japan",
      date: "Fall 2023",
      description: "Immersing in the vibrant culture, incredible food scene, and the perfect blend of tradition and modernity.",
      image: "🗼",
    },
    {
      id: 4,
      title: "Desert Adventures",
      location: "Sedona, Arizona",
      date: "Winter 2023",
      description: "Exploring red rock formations, hiking through canyons, and witnessing some of the most spectacular sunsets.",
      image: "🏜️",
    },
    {
      id: 5,
      title: "Island Paradise",
      location: "Hawaiian Islands",
      date: "Summer 2023",
      description: "Surfing, snorkeling, and soaking up the aloha spirit across multiple islands, each with its own unique charm.",
      image: "🏝️",
    },
    {
      id: 6,
      title: "National Parks Tour",
      location: "Utah & Arizona",
      date: "Spring 2023",
      description: "Road tripping through Zion, Bryce Canyon, and the Grand Canyon - nature's most impressive masterpieces.",
      image: "🏕️",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-green-950 dark:to-blue-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
            <div className="inline-block p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              Travel & Adventures
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Life is about the journey, not just the destination. Here are some of my favorite adventures and the incredible places I've explored.
            </p>
          </div>

          {/* Adventures Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {adventures.map((adventure) => (
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
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
              More Adventures Coming Soon!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This is just the beginning. Follow along as I continue to explore new destinations and create more unforgettable memories.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

