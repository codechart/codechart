import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Monitor, Laptop, Terminal } from "lucide-react";
import { DatabaseService } from "@/services/DatabaseService";

const osOptions = [
  {
    name: "Windows",
    icon: Monitor,
    link: "#",
    osCode: 0
  },
  {
    name: "macOS",
    icon: Laptop,
    link: "#",
    osCode: 1
  },
  {
    name: "Linux",
    icon: Terminal,
    link: "#",
    osCode: 2
  },
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
    await DatabaseService.incrementDownloadCount(osCode);
    await fetchDownloadCount();
    toast.success(`Downloading Covalent for ${os}`);
  };

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">Download Covalent</h2>
        <p className="text-xl text-muted-foreground mb-6">
          <b>Pricing</b>: Covalent is completely free to use. No hidden fees or subscriptions. No need to login.
        </p>
        <p className="text-xl text-muted-foreground mb-12">
          You will download a ZIP file containing everything you need: a lightweight runnable (.exe for Windows), IDE plugins (VS Code & IntelliJ), and a quick-start guide.
          <br/>
          Your data stays secure on your machine. Diagrams are saved to your git repo.
        </p>

        <div className="text-left mb-16">
          <img
            src="public/covalent-layout.png"
            alt="How Covalent Works"
            className="rounded-lg shadow-lg w-1/2 h-auto object-cover mx-auto"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {osOptions.map((os) => (
            <div key={os.name} className="p-6 rounded-xl bg-card hover:shadow-lg transition-all">
              <os.icon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{os.name}</h3>
              <Button
                onClick={() => handleDownload(os.name, os.osCode)}
                className="w-full"
                variant="default"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground space-y-4 max-w-2xl mx-auto">
          <p className="font-medium">Patent Pending Technology</p>
          <p>
            Our innovative technology is protected by pending patents. All rights reserved.
          </p>
          <p className="border-t pt-4">
            <strong>Disclaimer:</strong>
            <div>
              By default, we collect usage data to improve our product.
              This data is completely anonymous and does not contain any personal information.
              You can opt out of this in the settings.
            </div>
          </p>
        </div>

        <p className="mt-8 text-muted-foreground">
          Total Downloads: {downloadCount.toLocaleString()}
        </p>
      </div>
    </section>
  );
};