import React from 'react';

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 overflow-hidden">
      {/* Background animation (optional) */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 opacity-20 animate-pulse" />
      
      {/* Content box */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide animate__animated animate__fadeInDown">
          Unlock Your <span className="text-yellow-300">Potential</span> with <br />Smart Resume Matching
        </h1>
        {/* Sub text */}
        <p className="mt-4 text-xl md:text-2xl text-white font-semibold opacity-90 animate__animated animate__fadeInUp">
          Seamlessly upload, match, and find your dream jobs
        </p>
        {/* Call to Action Button */}
        <div className="mt-8">
          <a href="#upload" className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xl rounded-full transition-transform transform hover:-translate-y-1 shadow-lg shadow-pink-400/50 animate__animated animate__pulse animate__delay-2s">
            Get Started Now
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
