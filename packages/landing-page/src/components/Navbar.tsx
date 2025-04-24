import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const sections = [
    { id: "hero", label: "Home", path: "/" },
    { id: "video", label: "Video", path: "/#video" },
    { id: "why", label: "Why Covalent", path: "/#why" },
    { id: "downloads", label: "Download and Pricing", path: "/#downloads" },
    { id: "features", label: "Vote on Features", path: "/#features" },
    { id: "how-to-use", label: "How to Use", path: "/how-to-use" },
  ];

  const handleNavigation = (section: { id: string, path: string }) => {
    if (section.path === "/") {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (section.path.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/");
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const element = document.getElementById(section.id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(section.id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      navigate(section.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
                onClick={() => handleNavigation(section)}
                className="text-sm font-medium"
              >
                {section.label}
              </Button>
            ))}
          </div>
          <a
            href="mailto:info@use-covalent.com"
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>info@use-covalent.com</span>
          </a>
        </div>
      </div>
    </nav>
  );
};