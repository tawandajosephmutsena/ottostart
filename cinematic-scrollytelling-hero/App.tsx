
import React from 'react';
import CinematicHero from './components/CinematicHero';

const App: React.FC = () => {
  return (
    <main className="bg-black">
      <CinematicHero />
      
      <section className="min-h-screen flex items-center justify-center p-8 md:p-24 bg-[#0a0a0a] text-white">
        <div className="max-w-5xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-din font-bold mb-8 uppercase tracking-tighter leading-none">
              Take <span className="text-primary">Action</span> Today
            </h2>
            <p className="text-xl md:text-2xl font-inter font-light leading-relaxed text-gray-400">
              The conversation doesn't end here. We are gathering signatures to present to parliament 
              to ensure that the protection of children's rights is not just a slogan, but a lived reality.
            </p>
          </div>
          <div className="space-y-6">
            <button className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-black px-10 py-6 font-din font-bold text-2xl uppercase tracking-widest transition-all duration-500">
              Sign the Petition
            </button>
            <button className="w-full border-2 border-white/20 text-white hover:bg-white hover:text-black px-10 py-6 font-din font-bold text-2xl uppercase tracking-widest transition-all duration-500">
              Donate to the Cause
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;
