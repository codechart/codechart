import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";

type Instruction = {
  step: string;
  details?: string;
};

type Section = {
  title: string;
  subtitle: string;
  instructions: Instruction[];
};

const howToUseSections: Section[] = [
  {
    title: "Installation",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Installation 0",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Installation 2",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Installation 3",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Installation 4",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Installation 5",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Installation 6 ",
    subtitle: "Get Covalent up and running on your system",
    instructions: [
      {
        step: "Download Covalent",
        details: "Choose the appropriate version for your operating system (Windows, Mac, or Linux)"
      },
      {
        step: "Run the installer",
        details: "Follow the installation wizard to complete the setup"
      },
      {
        step: "Install IDE plugins",
        details: "Get the VS Code or IntelliJ plugin from your IDE's marketplace"
      }
    ]
  },
  {
    title: "Creating Your First Diagram",
    subtitle: "Start documenting your code visually",
    instructions: [
      {
        step: "Open your project",
        details: "Launch your IDE and open the project you want to document"
      },
      {
        step: "Launch Covalent",
        details: "Click the Covalent icon in your IDE's toolbar"
      },
      {
        step: "Select code elements",
        details: "Choose the files or functions you want to include in your diagram"
      },
      {
        step: "Arrange and connect",
        details: "Drag elements to arrange them and create connections between related components"
      }
    ]
  },
  {
    title: "Sharing with Your Team",
    subtitle: "Collaborate and share knowledge effectively",
    instructions: [
      {
        step: "Save your diagram",
        details: "Your diagram is automatically saved to your project's repository"
      },
      {
        step: "Commit changes",
        details: "Use git to commit and push your diagram files"
      },
      {
        step: "Share the link",
        details: "Send the diagram link to your team members for viewing and editing"
      }
    ]
  }
];

const HowToUse = () => {
  const [activeSection, setActiveSection] = useState<string>(howToUseSections[0].title);
  const [isScrolling, setIsScrolling] = useState(false);

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
          <h1 className="text-4xl font-bold mb-8">How to Use Covalent</h1>
          
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
                        <h3 className="font-medium mb-1">{instruction.step}</h3>
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
              <a href="mailto:support@covalent.xyz" className="text-primary hover:underline">
                support@covalent.xyz
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowToUse; 