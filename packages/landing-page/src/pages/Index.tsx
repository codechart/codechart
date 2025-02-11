import { Hero } from "@/components/Hero";
import { Downloads } from "@/components/Downloads";
import { FeatureSuggest } from "@/components/FeatureSuggest";
import { VideoShowcase } from "@/components/VideoShowcase";
import { Navbar } from "@/components/Navbar";
import { WhyCovalent } from "@/components/WhyCovalent";
import { useEffect } from "react";
import { DatabaseService } from "@/services/DatabaseService";


const Index = () => {
  useEffect(() => {
    // Track visit when component mounts
    DatabaseService.trackVisit().catch(console.error);
  }, []);


  return (
    <main className="min-h-screen bg-background pt-16">
      <Navbar />
      <section id="hero">
        <Hero />
      </section>
      <section id="video">
        <VideoShowcase />
      </section>
      <section id="downloads">
        <Downloads />
      </section>
      <section id="why">
        <WhyCovalent />
      </section>
      <section id="features">
        <FeatureSuggest />
      </section>
    </main>
  );
};

export default Index;