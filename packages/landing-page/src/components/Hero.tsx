import { useState, useEffect } from "react";
import { Map, Users, Code, Layers, Brain } from "lucide-react";

const demos = [
  {
    title: "Let AI Show You",
    videoId: "Z3Z4K7UT0vI"
  },
  {
    title: "Help AI Understand",
    videoId: "YIH2fYIZuIM"
  },
  {
    title: "Create And Share",
    videoId: "OnKupR_2b0I"
  }
];

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

  useEffect(() => {
    const phraseTimeout = setTimeout(() => setShowSecondPhrase(true), 700);
    return () => {
      clearTimeout(phraseTimeout);
    };
  }, []);

  const scrollToDownloads = () => {
    const downloadsSection = document.getElementById("downloads");
    if (downloadsSection) {
      downloadsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mt-2">
          Cochart
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
            One minute and you're running - Run the runnable file (everything runs locally), use a git repo for collaboration - Click HERE!
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

        {/* Videos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {demos.map((demo, index) => (
            <div key={index} className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-3 text-white">{demo.title}</h3>
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl w-full bg-black/20">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${demo.videoId}?autoplay=1&mute=1&loop=1&playlist=${demo.videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="border-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};