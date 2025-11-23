import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Download, 
  Monitor, 
  Laptop, 
  Terminal, 
  Code, 
  Hexagon, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatabaseService } from "@/services/DatabaseService";

// GitHub repository and download base URL
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'codechart/codechart';
const DOWNLOAD_BASE = `https://github.com/${GITHUB_REPO}/releases/latest/download`;

const osOptions = [
  {
    name: "Node.js",
    icon: Hexagon,
    link: `${DOWNLOAD_BASE}/cochart-js.tar.gz`,
    osCode: 3,
    description: "Run using <code>node cochart.js</code>",
    recommended: true,
    warning: ""
  },
  {
    name: "Windows",
    icon: Monitor,
    link: `${DOWNLOAD_BASE}/cochart-win.zip`,
    osCode: 0,
    description: "",
    recommended: false,
    warning: "A zip folder containing an .exe file. Some systems block this"
  },
  {
    name: "macOS",
    icon: Laptop,
    link: `${DOWNLOAD_BASE}/cochart-mac.tar.gz`,
    osCode: 1,
    description: "As we're not yet in the Apple development program, you'll be notified to approve it.",
    recommended: false,
    warning: ""
  },
  {
    name: "Linux",
    icon: Terminal,
    link: `${DOWNLOAD_BASE}/cochart-linux.tar.gz`,
    osCode: 2,
    description: "",
    recommended: false,
    warning: ""
  }
];

const idePlugins = [
  { name: "VS Code Extension", icon: Code, link: `${DOWNLOAD_BASE}/cochart-vscode-plugin-1.0.0.vsix`, warning: "" },
  { name: "IntelliJ Plugin", icon: Code, link: null, warning: "Coming soon", comingSoon: true }
];

// Installation videos
const installVideos = [
  { title: "Install & Start Guide", videoId: "t542CWlkEF8" },
  { title: "VS Code Extension Guide", videoId: "QCyw2iBmBfA" },
  { title: "IntelliJ Extension Guide", videoId: "W1owezAPKKQ" },
  { title: "Use with llm guide", videoId: "5LKgMVhwcDk" }  
];

// Updated installation steps with better descriptions
const steps = [
  { 
    title: "Download Agent", 
    description: "Click the download button for your OS below", 
    icon: Download
  },
  { 
    title: "Run Agent", 
    description: "Extract and run the agent executable - no installation needed", 
    icon: PlayCircle
  },
  { 
    title: "Start Using", 
    description: "Start using Cochart on localhost:2900", 
    icon: CheckCircle
  },
  { 
    title: "Install Extensions (Optional)", 
    description: "Add IDE extensions for VS Code or IntelliJ for a better experience", 
    icon: Code
  }
];

export const Downloads = () => {
  const [downloadCount, setDownloadCount] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    fetchDownloadCount();
  }, []);

  const fetchDownloadCount = async () => {
    const count = await DatabaseService.getDownloadCount();
    setDownloadCount(count);
  };

  const handleDownload = async (os: string, osCode: number) => {
    const selectedOs = osOptions.find(option => option.osCode === osCode);
    if (selectedOs) {
      // Small delay to ensure user sees the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      window.location.href = selectedOs.link;
      await DatabaseService.incrementDownloadCount(osCode);
      await fetchDownloadCount();

      toast.success(
        `Downloading Cochart Agent for ${os}`,
        {
          description: "Please read the readme file for instructions. Remember the IDE plugins require a running agent.",
          duration: 6000,
        }
      );
    }
  };

  const handlePluginDownload = (plugin: { name: string; link: string; comingSoon?: boolean }) => {
    if (plugin.comingSoon || !plugin.link) {
      toast.info(
        `${plugin.name} Coming Soon`,
        {
          description: "We're working on bringing you the IntelliJ plugin. Stay tuned!",
          duration: 4000,
        }
      );
      return;
    }
    // Small delay to ensure user sees the loading state
    setTimeout(() => {
      window.location.href = plugin.link;
      toast.success(
        `Downloading ${plugin.name}`,
        {
          description: "After download, follow the IDE-specific installation instructions. Make sure the Cochart agent is running first.",
          duration: 6000,
        }
      );
    }, 1000);
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
    setShowVideoPlayer(true);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-purple-50" id="downloads">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header with improved messaging */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Download Cochart Agent</h1>
          <div className="inline-flex items-center bg-primary/10 px-4 py-2 rounded-full mb-2">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            <span className="font-medium">Up and running in under 1 minute</span>
          </div>
          <p className="text-muted-foreground mt-2">No installation needed. Just download, extract, and run.</p>
        </div>

        {/* Quick Install Video Showcase */}
        <div className="bg-card rounded-xl overflow-hidden shadow-md mb-8">
          <div className="bg-primary/5 p-4">
            <h2 className="text-xl font-semibold">1 Minute Guides</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4">
            {installVideos.map((video, index) => (
              <button 
                key={index}
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
                onClick={() => handleVideoClick(video.videoId)}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {video.title}
              </button>
            ))}
          </div>
          
          {showVideoPlayer && (
            <div className="aspect-video w-full p-2">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                title="Installation video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Installation Steps - Timeline Design */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">4 Steps to Get Started</h2>
          <div className="relative">
            {/* Timeline connector positioned behind the circles */}
            <div className="absolute left-[25px] top-10 bottom-10 w-[2px] bg-primary/20 hidden md:block z-0"></div>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white flex items-center justify-center z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <step.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 bg-card p-4 rounded-lg border shadow-sm">
                    <div>
                      <h3 className="font-medium text-lg">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OS Downloads - Improved layout */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Download Agent for Your Platform</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {osOptions.map((os) => (
              <div
                key={os.name}
                onClick={() => handleDownload(os.name, os.osCode)}
                className={`p-4 rounded-xl bg-card hover:bg-primary/5 border hover:border-primary/30
                  transition-all cursor-pointer text-center flex flex-col h-full shadow-sm relative
                  ${os.recommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                {os.recommended && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Recommended
                  </div>
                )}
                <div className="flex-1 relative">
                  <os.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{os.name}</h3>
                    {(os.description || os.warning) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="rounded-full bg-muted w-5 h-5 inline-flex items-center justify-center text-muted-foreground">
                              <Info className="w-3 h-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs space-y-2">
                              {os.description && (
                                <div dangerouslySetInnerHTML={{ __html: os.description }} />
                              )}
                              {os.warning && (
                                <div className="text-amber-600 font-medium">
                                  ⚠️ {os.warning}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {os.recommended && (
                    <p className="text-xs text-primary font-medium mb-2">
                      Works on all platforms. Run using <code>node cochart.js</code>
                    </p>
                  )}
                </div>
                {os.link && (
                  <Button className={`w-full ${os.recommended ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'}`}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* IDE Plugins */}
        <div className="bg-card rounded-xl p-6 mb-8 border shadow-sm">
          <h2 className="text-xl font-semibold mb-3">IDE Extensions (Optional) <span className="text-sm text-muted-foreground mb-4">- Agent must be running first!</span></h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {idePlugins.map((plugin) => (
              <div
                key={plugin.name}
                onClick={() => handlePluginDownload(plugin)}
                className={`p-4 rounded-xl bg-card border transition-all text-center shadow-sm ${
                  plugin.comingSoon
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer'
                }`}
              >
                <plugin.icon className={`w-10 h-10 mx-auto mb-3 ${plugin.comingSoon ? 'text-muted-foreground' : 'text-primary'}`} />
                <div className="flex items-center justify-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">{plugin.name}</h3>
                  {plugin.comingSoon && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                      Coming Soon
                    </span>
                  )}
                  {plugin.warning && !plugin.comingSoon && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="rounded-full bg-muted w-5 h-5 inline-flex items-center justify-center text-muted-foreground">
                            <Info className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-amber-600 font-medium">
                            ⚠️ {plugin.warning}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <Button
                  disabled={plugin.comingSoon}
                  className={`w-full ${plugin.comingSoon ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                >
                  <Download className="mr-2 h-4 w-4" /> {plugin.comingSoon ? 'Coming Soon' : 'Download'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Download Count - Made more prominent */}
        <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-center mb-8">
          <p className="text-lg font-medium">
            Trusted by <span className="text-xl font-bold text-primary">{downloadCount.toLocaleString()}</span> developers
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-card p-4 rounded-xl mb-6 border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
          <div className="relative">
            <img
              src="cochart-layout.png"
              alt="Cochart Architecture"
              className="rounded-lg w-full max-w-xl mx-auto"
            />
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-5 max-w-2xl mx-auto mb-8">
          <p className="text-xl font-medium mb-1">Pricing: Completely free</p>
          <p className="text-muted-foreground text-sm">No hidden fees. No login required. Your data stays local.</p>
        </div>

        {/* Footer Info - Consolidated */}
        <div className="text-sm text-muted-foreground space-y-4 max-w-2xl mx-auto text-center">
          <div className="p-3 bg-card rounded-lg border">
            <p className="font-medium mb-1">Installation Note</p>
            <p className="text-xs">Extensions aren't in the official marketplaces yet — installation is straightforward with our guide.</p>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-xs">Patent Pending Technology | All rights reserved</p>
            <p className="text-xs">By default, we collect anonymous usage data. No personal information is collected. You can opt out in settings.</p>
          </div>
        </div>
      </div>
    </section>
  );
};