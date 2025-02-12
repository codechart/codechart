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
    <section className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/90 to-secondary/90">
      <div className="text-center w-full max-w-6xl mx-auto">
        <h1 className="text-6xl font-bold text-white mb-4">Covalent</h1>
        <div className="flex flex-col gap-2 h-20">
          <p className="text-2xl text-white/90 transition-all duration-500">
            {phrases[0]}
          </p>
          <p className={`text-2xl text-white/90 transition-all duration-500 ${
            showSecondPhrase ? 'opacity-100' : 'opacity-0'
          }`}>
            {phrases[1]}
          </p>
        </div>
        
        <div className={`mt-8 p-4 bg-black/20 rounded-lg shadow-xl mx-auto transition-all duration-1000 ${
          showVideo ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
        }`}>
          <iframe
            className="rounded-lg w-full aspect-video"
            src="https://www.youtube.com/embed/he5KivZisGk?si=Vs4KmafAzDsnBuBM&autoplay=1&mute=1&loop=1&playlist=he5KivZisGk"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            muted
          />
          
          <div className="mt-12 grid grid-cols-5 gap-8 text-white/80">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-white/10 p-4 rounded-full mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">{feature.text}</h3>
                <p className="text-sm text-white/60">{feature.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};