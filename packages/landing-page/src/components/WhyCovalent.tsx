import { useState, useEffect, useRef } from "react";
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
                benefit: "Create plans, track execution",
                description: "Small or big, it's easy. For your team or future self. Track execution of tasks and plans."
            },
            {
                benefit: "Embed in your devlopment. Explore. Using LLM or by your own",
                description: "Use as you work to navigate the code. Utilze LLM to create charts, use charts to expand context fo LLM. Explore code by searching, or adding nodes from code"
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
                benefit: "Sync with your code",
                description: "Update nodes of diagram to code on disc. More advanced syncing using git history is under development"
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
                benefit: "Better work distribution",
                description: `Many times devs and dev teams work on a part of code they know. 
                Now team members can plan tasks for other team members to execute. 
                Visual intuitivity allows them to understand easyly`
            },
            {
                benefit: "Less bottlenecks. Quicker development",
                description: "Dont be stuck by waiting for the \"imaginary expert\" to perform the task"
            },
            {
                benefit: "Better development process - Planning makes quicker development",
                description: "Add a \"planning\" stage to your process. Track execution, increase speed of development"
            },
            {
                benefit: "Team Onboarding",
                description: "Help new team members understand the codebase faster"
            },
            {
                benefit: "Better quality product",
                description: "Now that the architects and team leads can see the actual code and execution, your product will be better"
            },
            {
                benefit: "Preserve knowledge",
                description: "Charts are easy to create, and describe the code perfectly. Create proper documentation for your product."
            }
        ]
    }
];

export const WhyCovalent = () => {
    const [visibleBenefits, setVisibleBenefits] = useState<{[key: string]: boolean}>({});
    const [hasAnimated, setHasAnimated] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    
                    // Calculate total benefits for timing
                    const maxBenefits = Math.max(...benefitCategories.map(category => category.benefits.length));
                    const allBenefits = benefitCategories.flatMap((category, categoryIndex) => 
                        category.benefits.map((benefit, benefitIndex) => ({
                            id: `${categoryIndex}-${benefitIndex}`,
                            delay: benefitIndex * 500 // Now delay is based only on the benefit index
                        }))
                    );

                    // Animate each benefit with delay
                    allBenefits.forEach(({ id, delay }) => {
                        setTimeout(() => {
                            setVisibleBenefits(prev => ({ ...prev, [id]: true }));
                        }, delay);
                    });
                }
            },
            {
                threshold: 0.2 // Trigger when 20% of the section is visible
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            observer.disconnect();
            setVisibleBenefits({});
        };
    }, [hasAnimated]);

    return (
        <section 
            ref={sectionRef}
            id="why" 
            className="py-20 bg-gradient-to-b from-primary/5 to-background"
        >
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
                                            className={`p-4 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-500 transform ${
                                                visibleBenefits[`${categoryIndex}-${benefitIndex}`]
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-10'
                                            }`}
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