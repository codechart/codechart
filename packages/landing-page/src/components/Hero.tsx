import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slogans = [
  "Describe code visually - for yourself, for others",
  "Small or big plans - short or long term",
  "Describe logical flows, infrastructure layouts, or data models",
  "Incoporate architects, coders, and teamleads into one knowledge base",
];

const images = [
  {
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
    alt: "Developer using Covalent"
  },
  {
    url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    alt: "Coding session"
  },
  {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    alt: "Development environment"
  }
];

export const Hero = () => {
  const [currentSlogan, setCurrentSlogan] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/90 to-secondary/90">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-white mb-4">Covalent</h1>
        <div className="h-12">
          <p className="text-2xl text-white/90 transition-all duration-500">
            {slogans[currentSlogan]}
          </p>
        </div>
        <div className="mt-8 p-4 bg-black/20 rounded-lg shadow-xl max-w-3xl mx-auto">
          <Carousel className="w-full max-w-3xl mx-auto relative">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="rounded-lg w-full object-cover aspect-video animate-fade-in"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-16">
              <CarouselPrevious
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg"
              />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-16">
              <CarouselNext
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg"
              />
            </div>
          </Carousel>
          <div className="mt-6 text-white/80 max-w-2xl mx-auto">
            <p className="text-lg mb-4">
              Create interactive, human made, maps to share tasks, plans, and ideas. Share info with you team or future self.
              Architects, developers, and team leads can finally have a shared, precise view of the code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};