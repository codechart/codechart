import { useState, useEffect } from "react";
import { Map, GitBranch, Users, Code, Layers, Brain } from "lucide-react";

const phrases = [
  "Code isn't just how it runs — it's how people think about it.",
  "Developing is more than coding — it's teamwork. Make it visible"
];

const features = [
  { icon: Map, text: "Interactive Maps", subtext: "Explore code, describe tasks, track execution" },
  { icon: Users, text: "Collaboration", subtext: "Full view of the code for everyone." },
  { icon: Code, text: "Code-agnostic", subtext: "Node.js, Yaml, Python" },
  { icon: Layers, text: "For Everyone", subtext: "Local webapp,VSCode & IntelliJ ready" },
  { icon: Brain, text: "LLM Integration", subtext: "Create with AI, Explain to AI" }
];

export const Hero = () => {
  const [showSecondPhrase, setShowSecondPhrase] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const phraseTimeout = setTimeout(() => setShowSecondPhrase(true), 700);
    const videoTimeout = setTimeout(() => setShowVideo(true), 1400);
    return () => {
      clearTimeout(phraseTimeout);
      clearTimeout(videoTimeout);
    };
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-8 md:justify-center p-4 md:p-6 bg-gradient-to-br from-primary/90 to-secondary/90">
      <div className="text-center w-full max-w-6xl mx-auto space-y-8 md:space-y-12">
        {/* Header and Phrases */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Covalent</h1>
          <div className="flex flex-col gap-2 min-h-[5rem] md:h-20">
            <p className="text-lg md:text-2xl text-white/90 transition-all duration-500 px-4">
              {phrases[0]}
            </p>
            <p className={`text-lg md:text-2xl text-white/90 transition-all duration-500 px-4 ${
              showSecondPhrase ? 'opacity-100' : 'opacity-0'
            }`}>
              {phrases[1]}
            </p>
          </div>
        </div>

        {/* Video Section */}
        <div className={`w-full transition-all duration-1000 ${
          showVideo ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
        }`}>
          <div className="bg-black/20 rounded-lg shadow-xl p-4">
            <iframe
              className="rounded-lg w-full aspect-video"
              src="https://www.youtube.com/embed/he5KivZisGk?si=Vs4KmafAzDsnBuBM&autoplay=1&mute=1&loop=1&playlist=he5KivZisGk"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full px-4 md:px-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8 text-white/80">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-2">
                <div className="bg-white/10 p-3 md:p-4 rounded-full mb-3">
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="font-semibold mb-1 text-sm md:text-base">{feature.text}</h3>
                <p className="text-xs md:text-sm text-white/60">{feature.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};