import { toast } from "sonner";
import { useState, useEffect } from "react";
import { FeatureItem } from "./FeatureItem";
import { fetchFeatures } from "@/integrations/supabase/queries";
import { FeatureStatus, VoteImportance } from "@/types/enums";

interface Feature {
  id: number;
  title: string;
  description: string;
  priority: VoteImportance;
  status?: FeatureStatus;
  averagePriority: Feature['priority'];
  voterCount: number;
}

interface FeatureListProps {
  onVote: (id: number, priority: Feature['priority']) => void;
  isVotingEnabled: boolean;
  searchQuery: string;
}

export const FeatureList = ({ onVote, isVotingEnabled, searchQuery }: FeatureListProps) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        console.log('Starting to load features');
        const featuresData = await fetchFeatures();
        console.log('Loaded features:', featuresData);
        const sortedFeaturesData = featuresData.sort((a, b) => {
            const priorityOrder = ['crucial', 'high_priority', 'medium_priority', 'low_priority', 'not_important'];

          return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
        });
        setFeatures(sortedFeaturesData);
      } catch (error) {
        console.error('Error loading features:', error);
        toast.error("Failed to load features");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatures();
  }, []);

  const priorityConfig = {
    crucial: {
      label: "Crucial",
      color: "bg-rose-100 text-rose-700 border-rose-200",
      radioClass: "border-rose-600 text-rose-600 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
    },
    high_priority: {
      label: "High Priority",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      radioClass: "border-amber-600 text-amber-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
    },
    medium_priority: {
      label: "Medium Priority",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      radioClass: "border-emerald-600 text-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
    },
    low_priority: {
      label: "Low Priority",
      color: "bg-sky-100 text-sky-700 border-sky-200",
      radioClass: "border-sky-600 text-sky-600 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
    },
    not_important: {
      label: "Not Important",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      radioClass: "border-slate-600 text-slate-600 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
    },
  };

  const handleVote = async (id: number, priority: Feature['priority']) => {
    if (!isVotingEnabled) {
      toast.error("Please complete the form above before voting");
      return;
    }

    try {
      // Optimistically update UI
      setFeatures(features.map((feature) =>
        feature.id === id ? { ...feature, priority } : feature
      ));

      // TODO: Implement the vote submission to Supabase
      onVote(id, priority);
    } catch (error) {
      toast.error("Failed to submit vote");
      // Revert optimistic update on error
      const originalFeatures = await fetchFeatures();
      setFeatures(originalFeatures);
    }
  };

  // Filter and sort features by priority (crucial first)
  const priorityOrder = ['not_important', 'low_priority', 'medium_priority', 'high_priority', 'crucial'];

  const sortedFeatures = features
  const filteredFeatures = sortedFeatures
    .filter(feature => feature.title.toLowerCase().includes(searchQuery.toLowerCase()))


  return (
    <div>
      {filteredFeatures.length === 0 && searchQuery && (
        <p className="text-muted-foreground text-center py-4">
          No features found matching "{searchQuery}"
        </p>
      )}
      <div className="grid gap-4">
        {filteredFeatures.map((feature) => (
          <FeatureItem
            key={feature.id}
            feature={feature}
            priorityConfig={priorityConfig}
            onVote={handleVote}
            isVotingEnabled={isVotingEnabled}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}; 