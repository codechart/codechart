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
        title: "What Can I Do With Cochart?",
        benefits: [
            {
                benefit: "Create plans and track execution",
                description: "Create and track development plans of any size. Perfect for personal tasks or team-wide initiatives."
            },
            {
                benefit: "Embed in your development workflow",
                description: "Navigate and understand code as you work. Use AI assistance to generate charts and expand your context. Search and add nodes directly from your codebase."
            },
            {
                benefit: "Build your diagram library",
                description: "Create a comprehensive collection of diagrams that document your product. These become the foundation for future planning and development."
            },
            {
                benefit: "Increase visibility",
                description: "Developers, team leads, architects, and managers will finally all be on the same page. Everyone gains clear insight into the codebase structure."
            },
            {
                benefit: "Create intuitive visualizations",
                description: "Design custom diagrams with descriptive nodes and sections that effectively communicate your system's concepts and workflows."
            },
            {
                benefit: "Sync with your code",
                description: "Update diagram nodes to match your code. More advanced syncing using git history is under development."
            },
            {
                benefit: "Language and framework independent",
                description: "Cochart works with any programming language and framework. Create diagrams for code, flows, deployments, and more."
            }
        ]
    },
    {
        title: "Business Impact",
        benefits: [
            {
                benefit: "Better work distribution",
                description: `Development teams naturally specialize in different areas of the codebase. 
                Cochart enables confident task planning and assignment across all areas, 
                thanks to clear visual representations of the system.`
            },
            {
                benefit: "Fewer bottlenecks, faster development",
                description: "Eliminate dependencies on specific team members by making system knowledge accessible to everyone. Accelerate development through better understanding."
            },
            {
                benefit: "Streamlined development process",
                description: "Enhance your development lifecycle with structured planning phases. Track progress and optimize development speed through better organization."
            },
            {
                benefit: "Accelerate team onboarding",
                description: "Dramatically reduce the learning curve for new team members. Visual system representations help developers become productive contributors faster."
            },
            {
                benefit: "Improve product quality",
                description: "Enable architects and team leads to make better decisions with clear visibility into code structure and execution flows. Better understanding leads to better architecture."
            },
            {
                benefit: "Preserve team knowledge",
                description: "Transform tribal knowledge into clear, maintainable documentation through interactive diagrams. Ensure architectural decisions and system understanding persist over time."
            }
        ]
    }
];

export const WhyCochart = () => {
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
                <h2 className="text-3xl font-bold text-center mb-12">Why Cochart?</h2>

                {/* Title Section - Full Width */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    {benefitCategories.map((category, index) => (
                        <div 
                            key={index}
                            className={`${
                                index === 0 
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200' 
                                    : 'bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-200'
                            } backdrop-blur-sm rounded-lg py-4 shadow-md`}
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
                                            className={`p-4 rounded-lg ${
                                                categoryIndex === 0 
                                                    ? 'bg-blue-50/70 hover:bg-blue-100/70' 
                                                    : 'bg-green-50/70 hover:bg-green-100/70'
                                            } backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-500 transform ${
                                                visibleBenefits[`${categoryIndex}-${benefitIndex}`]
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-10'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium mb-1">{benefit.benefit}</h4>
                                                    {/* <p className="text-lg mb-4 text-gray-700">
                                                        {benefit.description}
                                                    </p> */}
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