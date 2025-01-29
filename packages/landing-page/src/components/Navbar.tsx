import { Mail } from "lucide-react";
import { Button } from "./ui/button";

export const Navbar = () => {
  const sections = [
    { id: "hero", label: "Home" },
    { id: "video", label: "Video" },
    { id: "downloads", label: "Download and Pricing" },
    { id: "features", label: "Vote on Features" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                onClick={() => scrollToSection(section.id)}
                className="text-sm font-medium"
              >
                {section.label}
              </Button>
            ))}
          </div>
          <a
            href="mailto:info@getcovalt.com"
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>info@getcovalt.com</span>
          </a>
        </div>
      </div>
    </nav>
  );
};