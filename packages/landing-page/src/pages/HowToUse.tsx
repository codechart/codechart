import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { howToUseSections, type Section } from "@/data/howToUseSections";
import { Check, Copy } from "lucide-react";

const HowToUse = () => {
  const [activeSection, setActiveSection] = useState<string>(howToUseSections[0].title);
  const [isScrolling, setIsScrolling] = useState(false);
  const [copiedTimeout, setCopiedTimeout] = useState<NodeJS.Timeout | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!isScrolling) {
        const sections = document.querySelectorAll('[data-section]');
        
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section.getAttribute('data-section') || '');
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);

  const scrollToSection = (title: string) => {
    setIsScrolling(true);
    setActiveSection(title);
    
    const element = document.querySelector(`[data-section="${title}"]`);
    if (element) {
      const offset = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      
      // Reset isScrolling after animation completes
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // Adjust timing if needed
    }
  };

  const handleCopyClick = (text: string) => {
    navigator.clipboard.writeText(text);
    
    // Clear existing timeout
    if (copiedTimeout) {
      clearTimeout(copiedTimeout);
    }
    
    // Set copied state for this text
    setCopiedText(text);
    
    // Clear copied state after 2 seconds
    const timeout = setTimeout(() => {
      setCopiedText(null);
    }, 2000);
    
    setCopiedTimeout(timeout);
  };

  const renderInstructionStep = (step: string, copyText?: string) => {
    if (!step.includes('<click-copy>')) return step;

    const parts = step.split(/<click-copy>(.*?)<\/click-copy>/);
    return (
      <>
        {parts.map((part, index) => {
          if (index % 2 === 1) { // This is the text between tags
            return (
              <button
                key={index}
                onClick={() => copyText && handleCopyClick(copyText)}
                className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
              >
                {part}
                {copiedText === copyText ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <main className="min-h-screen bg-background pt-16">
      <Navbar />
      
      {/* Sticky Navigation Menu */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b w-full">
        <nav className="w-full mx-auto">
          <div className="flex justify-center w-full">
            <ul className="flex gap-8 overflow-x-auto py-4 w-full justify-center custom-scrollbar px-4 md:px-8">
              {howToUseSections.map((section) => (
                <li key={section.title} className="flex-shrink-0">
                  <button
                    onClick={() => scrollToSection(section.title)}
                    className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-primary ${
                      activeSection === section.title 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">How to Use Cochart</h1>
          
          <div className="space-y-16">
            {howToUseSections.map((section, index) => (
              <div 
                key={index} 
                className="bg-card rounded-lg p-8 shadow-sm"
                data-section={section.title}
              >
                <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                <p className="text-muted-foreground mb-6">{section.subtitle}</p>
                
                <div className="space-y-4">
                  {section.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">
                          {renderInstructionStep(instruction.step, instruction.copyText)}
                        </h3>
                        {instruction.details && (
                          <p className="text-sm text-muted-foreground">
                            {instruction.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Need more help? Contact our support team at{" "}
              <a href="mailto:support@cochart.dev" className="text-primary hover:underline">
                support@cochart.dev
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowToUse; 