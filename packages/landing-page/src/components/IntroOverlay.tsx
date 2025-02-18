import { useState, useEffect } from "react";

const textArray = [
  { text: "Code development process is not ideal.", size: "3xl", opacityClass: "text-white/100" },
  { text: "Plans and tracking are lacking,", size: "lg", opacityClass: "text-white/90" },
  { text: "Knowledge bubbles impede productivity and work distribution,", size: "lg", opacityClass: "text-white/90" },
  { text: "Architects and engineers are disconnected,", size: "lg", opacityClass: "text-white/90" },
  { text: "Knowledge preservation is lacking.", size: "lg", opacityClass: "text-white/90" },
  { text: "You're not working as good or fast as you should.", size: "2xl", opacityClass: "text-white/95" },
  { text: "That's why we created Covalent,", size: "3xl", opacityClass: "text-white" },
  { text: "A visual mindmap platform to plan, track, share, and preserve knowledge", size: "3xl", opacityClass: "text-white" }
];

export const IntroOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(true);
    // Auto-increment text index
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => {
        // if (prev === textArray.length - 1) {
        //   // When last text appears, show button after a delay
        //   setTimeout(() => setShowButton(true), 800);
        // }
        return prev < textArray.length - 1 ? prev + 1 : prev;
      });
    }, 1200);

    // Auto-dismiss after texts are shown
    const dismissTimeout = setTimeout(() => {
      handleDismiss();
    }, (textArray.length * 10000) + 2000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(dismissTimeout);
    };
  }, []);

  const handleDismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 1000); // Wait for fade animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-purple-600 to-blue-500 
      flex items-center justify-center transition-opacity duration-1000
      ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-full h-full flex flex-col items-center justify-center px-8">
        <div className="max-w-4xl space-y-4 -mt-32">
          {textArray.map((item, index) => (
            <div
              key={item.text}
              className={`text-${item.size} font-medium ${item.opacityClass}
                transition-all duration-700
                ${index <= currentTextIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
            >
              {item.text}
            </div>
          ))}
        </div>
        
        <button
          onClick={handleDismiss}
          className={`absolute bottom-10 text-white border border-white/20 px-8 py-3 rounded-full
            bg-white/10 hover:bg-white/20 transition-all duration-500
            text-lg font-medium shadow-lg hover:shadow-white/20
            hover:scale-105 hover:-translate-y-1
            ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          Discover Covalent
        </button>
      </div>
    </div>
  );
}; 