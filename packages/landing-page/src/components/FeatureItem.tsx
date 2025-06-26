import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FeatureStatus, VoteImportance } from "@/types/enums";
import { useIsMobile } from "@/hooks/use-mobile";

interface Feature {
  id: number;
  title: string;
  description: string;
  priority: VoteImportance;
  status?: FeatureStatus;
  averagePriority: VoteImportance;
  voterCount: number;
}

interface FeatureItemProps {
  feature: Feature;
  priorityConfig: Record<VoteImportance, {
    label: string;
    color: string;
    radioClass: string;
  }>;
  onVote: (id: number, priority: VoteImportance) => void;
  isVotingEnabled: boolean;
  searchQuery: string;
}

export const FeatureItem = ({
  feature,
  priorityConfig,
  onVote,
  isVotingEnabled,
  searchQuery
}: FeatureItemProps) => {
  const [selectedPriority, setSelectedPriority] = useState<Feature['priority'] | ''>('');
  const isMobile = useIsMobile();

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusStyles = {
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      done: "bg-green-100 text-green-800 border-green-200",
      open: "bg-blue-100 text-blue-800 border-blue-200"
    };

    const statusLabels = {
      in_progress: "In Progress",
      done: "Done",
      open: "Open"
    };

    return (
      <Badge
        variant="outline"
        className={`ml-2 ${statusStyles[status as keyof typeof statusStyles]} ${isMobile ? 'text-xs' : ''}`}
      >
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="p-4 rounded-lg bg-card hover:bg-muted/50 transition-all">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-start'}`}>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 flex items-center gap-2 flex-wrap ${isMobile ? 'text-sm' : 'text-base'}`}>
            <span className="truncate">
              {highlightMatch(feature.title, searchQuery)}
            </span>
            {getStatusBadge(feature.status)}
          </h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {feature.description}
          </p>
        </div>
        <div className={`text-muted-foreground ${isMobile ? 'text-xs w-full' : 'text-sm text-right ml-4'}`}>
          <div className="flex items-center gap-2 justify-end">
            <span className="whitespace-nowrap">Average Priority:</span>
            <Badge
              variant="outline"
              className={`${priorityConfig[feature.averagePriority].color} whitespace-nowrap min-w-[90px] text-center ${isMobile ? 'text-xs' : ''}`}
            >
              {priorityConfig[feature.averagePriority].label}
            </Badge>
          </div>
          <div className="mt-1 text-right">
            {feature.voterCount} {feature.voterCount === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      </div>
      <div className={`flex justify-end items-center gap-2 mt-4 ${isMobile ? 'flex-wrap' : ''}`}>
        <span className={`text-muted-foreground whitespace-nowrap ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {selectedPriority ? priorityConfig[selectedPriority].label : 'Select Priority:'}
        </span>
        <RadioGroup
          disabled={!isVotingEnabled}
          value={selectedPriority}
          onValueChange={(value: Feature['priority']) => {
            setSelectedPriority(value);
            onVote(feature.id, value);
          }}
          className="flex gap-2"
        >
            {Object.entries(priorityConfig)
            .reverse()
            .map(([key, value]) => (
              <RadioGroupItem
              key={key}
              value={key}
              id={`${feature.id}-${key}`}
              className={value.radioClass}
              />
            ))}
        </RadioGroup>
      </div>
    </div>
  );
};