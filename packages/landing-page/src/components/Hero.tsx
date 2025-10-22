import { useState, useEffect, useRef } from "react";
import { Map, Users, Code, Layers, Brain } from "lucide-react";

// Extend Window interface for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const demos = [
  {
    title: "Let AI Show You",
    subtext: "Visually explore with your AI assistant",
    videoId: "bALMSzgosjk"
  },
  {
    title: "Help AI Understand",
    subtext: "Explain to your AI assisttant",
    videoId: "y0-U913Y3cw"
  },
  {
    title: "Streamline Development",
    subtext: "Plan, Share, Follow Execution",
    videoId: "yji1aEWw5AM"
  }
];

const phrases = [
  // "A tool for freely creating code maps linked to the code itself, like a detective's bookmark map.",
  // "Faster and better development, less bottle necks, better team work"
];

const features = [
  { icon: Map, text: "Autosynched code maps" },
  { icon: Users, text: "Plan, Follow, Collaborate" },
  { icon: Layers, text: "Any Platform" },
  { icon: Brain, text: "Any AI assistant" }
];

export const Hero = () => {
  const [showSecondPhrase, setShowSecondPhrase] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [showFeatures, setShowFeatures] = useState<number[]>([]);
  const [showVideos, setShowVideos] = useState<number[]>([]);
  const [showDownloadText, setShowDownloadText] = useState(false);
  const playersRef = useRef<any[]>([]);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  // Initialize YouTube players when API is ready and videos are visible
  useEffect(() => {
    if (!apiReady || showVideos.length === 0) return;

    const initPlayers = () => {
      demos.forEach((demo, index) => {
        if (showVideos.includes(index) && !playersRef.current[index]) {
          playersRef.current[index] = new window.YT.Player(`player-${index}`, {
            videoId: demo.videoId,
            playerVars: {
              autoplay: index === 0 ? 1 : 0,
              mute: 1,
              loop: 1,
              playlist: demo.videoId,
              controls: 0,
              modestbranding: 1,
              rel: 0
            },
            events: {
              onReady: (event: any) => {
                if (index === 0) {
                  event.target.playVideo();
                }
              }
            }
          });
        }
      });
    };

    // Small delay to ensure DOM elements are ready
    const timer = setTimeout(initPlayers, 100);
    return () => clearTimeout(timer);
  }, [apiReady, showVideos]);

  // Handle video play/pause on hover
  useEffect(() => {
    playersRef.current.forEach((player, index) => {
      if (player && player.playVideo && player.pauseVideo) {
        if (index === activeVideo) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
    });
  }, [activeVideo]);

  useEffect(() => {
    const phraseTimeout = setTimeout(() => setShowSecondPhrase(true), 700);

    // Show features one by one starting at 1000ms
    features.forEach((_, index) => {
      setTimeout(() => {
        setShowFeatures(prev => [...prev, index]);
      }, 1000 + index * 200);
    });

    // Show videos one by one after features
    demos.forEach((_, index) => {
      setTimeout(() => {
        setShowVideos(prev => [...prev, index]);
      }, 1000 + features.length * 200 + index * 400);
    });

    // Show download text after videos
    setTimeout(() => {
      setShowDownloadText(true);
    }, 1000 + features.length * 200 + demos.length * 400 + 200);

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
          Visual Orientaion for Code
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

        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-white my-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center transition-opacity duration-500 ${showFeatures.includes(index) ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <div className="bg-white/10 p-2 rounded-full mb-2">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm md:text-base">{feature.text}</h3>
            </div>
          ))}
        </div>

        {/* Videos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {demos.map((demo, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center transition-opacity duration-500 ${showVideos.includes(index) ? 'opacity-100' : 'opacity-0'
                }`}
              onMouseEnter={() => setActiveVideo(index)}
            >
              <h3 className={`text-lg font-semibold mb-1 text-white transition-opacity duration-300 ${activeVideo === index ? 'opacity-100' : 'opacity-50'}`}>
                {demo.title}
              </h3>
              <p className={`text-xs md:text-sm text-white/60 mb-3 transition-opacity duration-300 ${activeVideo === index ? 'opacity-100' : 'opacity-50'}`}>
                {demo.subtext}
              </p>
              <div className={`aspect-video rounded-lg overflow-hidden shadow-xl w-full bg-black/20 transition-opacity duration-300 ${activeVideo === index ? 'opacity-100' : 'opacity-40'}`}>
                <div id={`player-${index}`} className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Download text */}
        <div className={`text-center mt-8 transition-opacity duration-500 ${
          showDownloadText ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={scrollToDownloads}
            className="text-lg font-medium text-white bg-purple-700/30 px-4 py-2 rounded-md mx-auto inline-block border border-white/20 hover:bg-purple-700/50 hover:border-white/40 cursor-pointer transition-all"
          >
            One minute and you're running - runs locally. Use a git repo for collaboration.
          </button>
        </div>
      </div>
    </div>
  );
};