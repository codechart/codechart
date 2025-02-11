import { useState } from "react";

const demos = [
  {
    title: "Web App",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "VS Code Extension",
    videoId: "6Dh-RL__uN4",
  }
];

const links = [
  {
    title: "Web App",
    url: "https://app.covalent.xyz"
  },
  {
    title: "VS Code Extension",
    url: "https://marketplace.visualstudio.com/items?itemName=covalent.covalent"
  },
  {
    title: "IntelliJ Plugin",
    url: "https://plugins.jetbrains.com/plugin/covalent"
  }
];

export const VideoShowcase = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">See Covalent in Action</h2>
        
        <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
          {demos.map((demo, index) => (
            <div key={index} className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">{demo.title}</h3>
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${demo.videoId}?autoplay=0`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Check Demos</h3>
          <div className="flex justify-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};