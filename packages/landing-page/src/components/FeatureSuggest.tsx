import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"; import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { FeatureList } from "./FeatureList";
import { UsageLevel, FeatureStatus, Purpose, RoleType, VoteImportance } from "@/types/enums";
import { submitNewFeature, submitFeatureVote, createResponder } from "../integrations/supabase/queries";

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
    }
};

interface FormSelections {
    usage_level: UsageLevel | "";
    usage_types: Purpose[];
    roles: RoleType[];
}

interface PendingVote {
    importance: VoteImportance;
    usage_level: UsageLevel;
    usage_types: Purpose[];
    roles: RoleType[];
    email?: string;
}

export const FeatureSuggest = () => {
    const [newFeature, setNewFeature] = useState({ title: "", description: "" });
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selections, setSelections] = useState<FormSelections>({
        usage_level: "",
        usage_types: [],
        roles: [],
    });
    const [pendingVotes, setPendingVotes] = useState<Map<number, PendingVote>>(new Map());
    const [selectedPriority, setSelectedPriority] = useState<VoteImportance>(VoteImportance.NotImportant);

    const isFormValid = selections.usage_level && selections.usage_types.length > 0 && selections.roles.length > 0;

    const handleVote = (id: number, importance: VoteImportance) => {
        if (!selections.usage_types || !selections.usage_level) return;

        const currentVote = pendingVotes.get(id) || {
            importance,
            usage_level: selections.usage_level as UsageLevel,
            usage_types: selections.usage_types,
            roles: selections.roles,
            email: email || undefined
        };

        setPendingVotes(new Map(pendingVotes.set(id, {
            ...currentVote,
            importance
        })));
    };

    const [email, setEmail] = useState('');

    const handleSubmitVotes = async () => {
        try {
            // If email is provided, create/update responder first
            if (email && selections.usage_level !== "") {
                await createResponder({
                    email,
                    roles: selections.roles,
                    usage_level: selections.usage_level,
                    usage_types: selections.usage_types 
                });
            }

            // Submit votes
            for (const [featureId, vote] of pendingVotes) {
                await submitFeatureVote({
                    feature_id: featureId,
                    ...vote,
                    email: email || undefined
                });
            }

            toast.success("Votes submitted successfully!");
            setPendingVotes(new Map());
            setEmail(''); // Clear email after submission
        } catch (error) {
            toast.error("Failed to submit votes");
            console.error(error);
        }
    };

    const handleUsageChange = (value: string) => {
        setSelections(prev => ({ ...prev, usage_level: value as UsageLevel }));
    };

    const handlePurposeChange = (value: Purpose, checked: boolean) => {
        setSelections(prev => ({
            ...prev,
            usage_types: checked
                ? [...prev.usage_types, value]
                : prev.usage_types.filter(p => p !== value)
        }));
    };

    const handleRoleChange = (value: RoleType, checked: boolean) => {
        setSelections(prev => ({
            ...prev,
            roles: checked
                ? [...prev.roles, value]
                : prev.roles.filter(r => r !== value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error("Please complete all selections before submitting");
            return;
        }
        if (!newFeature.title || !newFeature.description) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            await submitNewFeature(
                newFeature.title,
                newFeature.description,
                {
                    importance: selectedPriority,
                    usage_level: selections.usage_level as UsageLevel,
                    usage_types: selections.usage_types,
                    roles: selections.roles,
                    email: email || undefined
                }
            );
            setNewFeature({ title: "", description: "" });
            setIsFormExpanded(false);
            toast.success("Feature suggestion added!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to submit feature");
            console.error(error);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewFeature({ ...newFeature, title: value });
        setSearchQuery(value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    return (
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 via-primary/10 to-background">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 text-center">Feature Requests</h2>
                <div className="rounded-xl bg-white shadow-lg border border-primary/10 mb-8 p-4 sm:p-8" id="feature-voting-form">
                    <p className="text-muted-foreground text-center mb-8 text-lg">
                        <h3>We'd love for your advice. Please fill type of usage for us to better understand real world needs.</h3>
                    </p>

                    <div className="mb-6">
                        <h4 className="text-xl font-medium mb-2">How much have you used Covalent?*</h4>
                        <div className="flex flex-wrap gap-4">
                            {Object.values(UsageLevel).map(value => (
                                <label key={value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="usage"
                                        value={value}
                                        className="mr-2"
                                        checked={selections.usage_level === value}
                                        onChange={(e) => handleUsageChange(e.target.value)}
                                    />
                                    {value.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-medium mb-2">What are you using it for?*</h4>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { value: Purpose.SoloWork, label: "Solo work" },
                                { value: Purpose.Cooperation, label: "Cooperation with other people" }
                            ].map(({ value, label }) => (
                                <label key={value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="purpose"
                                        value={value}
                                        className="mr-2"
                                        checked={selections.usage_types.includes(value)}
                                        onChange={(e) => handlePurposeChange(value, e.target.checked)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-medium mb-2">What is your role?*</h4>
                        <div className="flex flex-wrap gap-4">
                            {Object.values(RoleType).map(role => (
                                <label key={role} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="role"
                                        value={role}
                                        className="mr-2"
                                        checked={selections.roles.includes(role)}
                                        onChange={(e) => handleRoleChange(role, e.target.checked)}
                                    />
                                    {role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-medium mb-2">Email (optional)</h4>
                        <Input
                            type="email"
                            placeholder="So we can follow up with you"
                            className="max-w-md"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <Button
                        variant="default"
                        className="text-lg font-bold"
                        onClick={() => setIsFormExpanded(!isFormExpanded)}
                        disabled={!isFormValid}
                    >
                        {isFormExpanded ? (
                            <ChevronUp className="mr-2 h-5 w-5" />
                        ) : (
                            <ChevronDown className="mr-2 h-5 w-5" />
                        )}
                        Suggest a Feature
                    </Button>

                    {isFormExpanded && (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <Input
                                    placeholder="Feature title"
                                    value={newFeature.title}
                                    onChange={handleTitleChange}
                                />
                            </div>
                            <div>
                                <Textarea
                                    placeholder="Feature description"
                                    value={newFeature.description}
                                    onChange={(e) =>
                                        setNewFeature({ ...newFeature, description: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <RadioGroup
                                    value={selectedPriority}
                                    onValueChange={(value: VoteImportance) => setSelectedPriority(value)}
                                    className="flex flex-wrap gap-2"
                                >
                                    {Object.entries(priorityConfig).map(([key, value]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={key}
                                                id={`priority-${key}`}
                                                className={value.radioClass}
                                            />
                                            <Label htmlFor={`priority-${key}`}>{value.label}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <Button type="submit" disabled={!isFormValid}>Submit Feature Request</Button>
                        </form>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <h4 className="text-xl font-semibold">Vote on requested features</h4>
                        <Button
                            variant="default"
                            disabled={!isFormValid || pendingVotes.size === 0}
                            onClick={handleSubmitVotes}
                        >
                            Submit Votes ({pendingVotes.size})
                        </Button>
                    </div>
                    <FeatureList
                        onVote={handleVote}
                        isVotingEnabled={isFormValid}
                        searchQuery={searchQuery}
                    />
                </div>
            </div>
        </section>
    );
};