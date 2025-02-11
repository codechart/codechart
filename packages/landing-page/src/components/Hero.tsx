import { useState, useEffect } from "react";

const phrases = [
  "Code isn’t just how it runs—it’s how people think about it.",
  "Developing is more than coding — it'steamwork. Make it visible"
];

export const Hero = () => {
  const [showSecondPhrase, setShowSecondPhrase] = useState(false);

  useEffect(() => {
    // Show second phrase after 2 seconds
    const timeout = setTimeout(() => {
      setShowSecondPhrase(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/90 to-secondary/90">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-white mb-4">Covalent</h1>
        <div className="flex flex-col gap-2 h-20">
          <p className="text-2xl text-white/90 transition-all duration-500">
            {phrases[0]}
          </p>
          <p 
            className={`text-2xl text-white/90 transition-all duration-500 ${
              showSecondPhrase ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {phrases[1]}
          </p>
        </div>
        <div className="mt-8 p-4 bg-black/20 rounded-lg shadow-xl max-w-3xl mx-auto">
          <video 
            className="rounded-lg w-full object-cover aspect-video animate-fade-in"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="mt-6 text-white/80 max-w-2xl mx-auto">
            <p className="text-lg mb-4">
              Empower your team with interactive, human made maps. Share tasks plans, and ideas. Track execution. Share info with your team or future self.
              Architects, developers, and team leads can finally have a shared, precise view of the code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};