import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const videos = [
  "dQw4w9WgXcQ", // Sample YouTube video IDs
  "6Dh-RL__uN4",
  "jNQXAC9IVRw"
];

export const VideoShowcase = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const previousVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">See Covalent in Action</h2>
        <div className="relative max-w-4xl mx-auto">
          <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videos[currentVideo]}?autoplay=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-16">
            <Button
              variant="secondary"
              size="icon"
              onClick={previousVideo}
              className="rounded-full shadow-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-16">
            <Button
              variant="secondary"
              size="icon"
              onClick={nextVideo}
              className="rounded-full shadow-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};