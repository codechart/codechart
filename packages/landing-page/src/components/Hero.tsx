import { useState, useEffect } from "react";
import { Map, Users, Code, Layers, Brain } from "lucide-react";

const phrases = [
  // "A tool for freely creating code maps linked to the code itself, like a detective's bookmark map.",
  // "Faster and better development, less bottle necks, better team work"
];

const features = [
  { icon: Map, text: "Interactive Bookmark Maps", subtext: "Explore code, describe tasks, track execution" },
  { icon: Users, text: "Collaboration", subtext: "Full view of the code for everyone. Create a pool of diagrams" },
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

  const scrollToDownloads = () => {
    const downloadsSection = document.getElementById("downloads");
    if (downloadsSection) {
      downloadsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="flex-1 flex flex-col gap-4 max-h-screen">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mt-2">
          Covalent
        </h1>

        {/* Phrases */}
        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl lg:text-2xl text-white/90">
            {phrases[0]}
          </p>
          <p className={`text-lg md:text-xl lg:text-2xl text-white/90 transition-opacity duration-500 
            ${showSecondPhrase ? 'opacity-100' : 'opacity-0'}`}>
            {phrases[1]}
          </p>
          
          {/* Clickable new text with hover effect */}
          <button
            onClick={scrollToDownloads}
            className="text-lg font-medium text-white bg-purple-700/30 px-4 py-2 rounded-md mx-auto inline-block mt-2 border border-white/20 hover:bg-purple-700/50 hover:border-white/40 cursor-pointer transition-all"
          >
            1 minute and you're running - Run the runnable file (everything runs locally), and use a git repo for collaboration
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-white my-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-white/10 p-2 rounded-full mb-2">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm md:text-base">{feature.text}</h3>
              <p className="text-xs md:text-sm text-white/60">{feature.subtext}</p>
            </div>
          ))}
        </div>

        {/* Video */}
        <div className={`transition-all duration-1000 flex-1 min-h-0 
          ${showVideo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="h-full max-h-[40vh] bg-black/20 rounded-lg p-2">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/he5KivZisGk?si=Vs4KmafAzDsnBuBM&autoplay=1&mute=1&loop=1&playlist=he5KivZisGk"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};