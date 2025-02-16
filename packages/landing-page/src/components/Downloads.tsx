import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Monitor, Laptop, Terminal, Code } from "lucide-react";
import { DatabaseService } from "@/services/DatabaseService";

const osOptions = [
  { name: "Windows", icon: Monitor, link: "/download/covalent-win.zip", osCode: 0 },
  { name: "macOS", icon: Laptop, link: "/download/covalent-mac.tar.gz", osCode: 1 },
  { name: "Linux", icon: Terminal, link: "/download/covalent-linux.tar.gz", osCode: 2 }
];

const idePlugins = [
  { name: "VS Code Extension", icon: Code, link: "/download/covalent-vscode-plugin-1.0.0.vsix" },
  { name: "IntelliJ Plugin", icon: Code, link: "/download/Covalent-IJ-Plugin.zip" }
];

const steps = [
  { title: "Download Agent", description: "Get the agent; Optionally an IDE plugin" },
  { title: "Install", description: "Run the agent" },
  { title: "Start Using", description: "Open browser or IDE & start mapping" }
];

export const Downloads = () => {
  const [downloadCount, setDownloadCount] = useState(0);

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
      window.location.href = selectedOs.link;
      await DatabaseService.incrementDownloadCount(osCode);
      await fetchDownloadCount();
      toast.success(`Downloading Covalent for ${os}`);
    }
  };

  const handlePluginDownload = (plugin: { name: string; link: string }) => {
    window.location.href = plugin.link;
    toast.success(`Downloading ${plugin.name}`);
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl font-bold">Download Covalent</h1>
          <div className="bg-primary/5 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-xl font-medium mb-2">Pricing: Completely free</p>
            <p className="text-muted-foreground">No hidden fees. No login required. Your data stays local.</p>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center 
                text-xl font-bold mx-auto mb-4">{index + 1}</div>
              <h3 className="font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* OS Downloads */}
        <h2 className="text-xl font-semibold text-center mb-6">Agent</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {osOptions.map((os) => (
            <div 
              key={os.name}
              onClick={() => handleDownload(os.name, os.osCode)}
              className="p-6 rounded-xl bg-card hover:bg-primary/5 hover:scale-105 
                transition-all cursor-pointer text-center"
            >
              <os.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-4">{os.name}</h3>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          ))}
        </div>

        {/* IDE Plugins */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-center mb-6">IDE Extensions (Agent also reuired)</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {idePlugins.map((plugin) => (
              <div
                key={plugin.name}
                onClick={() => handlePluginDownload(plugin)}
                className="p-6 rounded-xl bg-card hover:bg-primary/5 hover:scale-105 
                  transition-all cursor-pointer text-center"
              >
                <plugin.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-4">{plugin.name}</h3>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-card p-8 rounded-xl mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
          <div className="relative">
            <img
              src="covalent-layout.png"
              alt="Covalent Architecture"
              className="rounded-lg shadow-xl w-full max-w-3xl mx-auto"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-sm text-muted-foreground space-y-6 max-w-2xl mx-auto text-center">
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="font-medium mb-2">Installation Note</p>
            <p>Since we're focused on rapid testing, the extensions aren't in the official marketplaces yet 
              — but installation is straightforward with our guide.</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Patent Pending Technology</p>
            <p>Our innovative technology is protected by pending patents. All rights reserved.</p>
          </div>

          <div className="border-t pt-6">
            <p className="font-medium mb-2">Disclaimer</p>
            <p>By default, we collect anonymous usage data to improve our product. 
              No personal information is collected. You can opt out in settings.</p>
          </div>

          <p className="font-medium">
            Total Downloads: {downloadCount.toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
};