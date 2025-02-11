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
        <div className="text-xl text-muted-foreground mb-2">
          <b>Pricing</b>: Covalent is completely free to use. No hidden fees or subscriptions. No need to login.
        </div>
        <div className="text text-muted-foreground mb-2">
          Since we're focused on rapid testing, the extensions aren't in the official marketplaces yet — but installation is very straightforward.
        </div>
        <div className="text text-muted-foreground mb-2">
          <strong> Everything runs locally - Your data stays secure on your machine. Diagrams are saved to your git repo.</strong>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {osOptions.map((os) => (
            <div key={os.name} className="p-6 rounded-xl bg-card hover:shadow-lg transition-all" onClick={() => handleDownload(os.name, os.osCode)}>
              <os.icon className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{os.name}</h3>
              <Button
                className="w-full"
                variant="default"
              >
                <Download className="mr-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="text text-muted-foreground mb-2">
          You will download a ZIP file containing everything you need: a lightweight runnable (.exe for Windows), IDE plugins (VS Code & IntelliJ), and a quick-start guide.
        </div>

        <h3 className="text-2xl font-bold mb-8">Covalent Layout</h3>
        <div className="text-left mb-4">
          <img
            src="public/covalent-layout.png"
            alt="How Covalent Works"
            className="rounded-lg shadow-lg w-4/5 h-auto object-cover mx-auto"
          />
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