import { CheckCircle } from "lucide-react";

type Benefit = {
    benefit: string;
    description: string;
};

type BenefitCategory = {
    title: string;
    benefits: Benefit[];
};

const benefitCategories: BenefitCategory[] = [
    {
        title: "What Can I Do With Covalent",
        benefits: [
            {
                benefit: "Create plans",
                description: "Small or big, it's easy. For your team or future self."
            },
            {
                benefit: "Track execution",
                description: "Track execution of tasks and plans."
            },
            {
                benefit: "Create a pool of charts",
                description: "A pool of charts describe your product. These will be basis for plans and ideas."
            },
            {
                benefit: "Increase visibility",
                description: "Devs, team leads, architects, managers will finally all be on same page. They'll know whats in the codebase."
            },
            {
                benefit: "Human made charts",
                description: "Add description nodes and sections to your charts, conveying concepts and flows"
            },
            {
                benefit: "Code agnostic",
                description: "Covalent is code agnostic. It works with any language and framework. Describe flows, deployments, and more."
            }
        ]
    },
    {
        title: "Business Impact",
        benefits: [
            {
                benefit: "Increase work distribution",
                description: `Many times devs and dev teams work on a part of code they know. 
                Now team members can plan tasks for other team members to execute. 
                Visual intuitivity allows them to understand easyly`
            },
            {
                benefit: "Less bottlenecks. Quicker development",
                description: "Dont be stuck by waiting for the \"imaginary expert\" to perform the task"
            },
            {
                benefit: "Team Onboarding",
                description: "Help new team members understand the codebase faster"
            },
            {
                benefit: "Better quality product",
                description: "now that the architects and team leads can see the actual code and execution, your product will be better"
            },
            {
                benefit: "Preserve knowledge",
                description: "Charts are easy to create, and describe the code perfectly. Create proper documentation for your product."
            }
        ]
    }
];

export const WhyCovalent = () => {
    return (
        <section id="why" className="py-20 bg-gradient-to-b from-primary/5 to-background">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Why Covalent?</h2>

                {/* Title Section - Full Width */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    {benefitCategories.map((category, index) => (
                        <div 
                            key={index}
                            className="bg-white/50 backdrop-blur-sm rounded-lg py-4 shadow-sm"
                        >
                            <h3 className="text-2xl font-semibold text-center">
                                {category.title}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Benefits Section - Centered */}
                <div className="flex justify-center">
                    <div className="grid grid-cols-2 gap-12 max-w-5xl">
                        {benefitCategories.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="flex flex-col gap-6">
                                <div className="space-y-6">
                                    {category.benefits.map((benefit, benefitIndex) => (
                                        <div
                                            key={benefitIndex}
                                            className="p-4 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium mb-1">{benefit.benefit}</h4>
                                                    <p className="text-lg mb-4 text-gray-700">
                                                        {benefit.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}; 