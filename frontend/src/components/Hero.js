// File: frontend/src/components/Hero.js

export default function Hero() {
    return (
      <section className="relative w-full h-screen overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
  
        {/* Dark Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10" />
  
        {/* Text Content */}
        <div className="relative z-20 flex items-center justify-center h-full px-6 text-center">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white font-bold mb-4">
              The Dakshina Dance Repertory
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
              Exploring the boundaries of classical and contemporary Indian dance.
            </p>
            {/* Optional CTA */}
            {/* <div className="mt-6">
              <a href="/events" className="inline-block px-6 py-3 bg-[#8A993F] text-white rounded-full text-sm hover:bg-[#9baa53] transition">
                View Upcoming Events
              </a>
            </div> */}
          </div>
        </div>
      </section>
    );
  }
  